from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
import json
import asyncio
import os

from .database import get_db, create_tables, JobDescription, CVFile, AnalysisResult
from .schemas import (
    JobDescriptionCreate, JobDescriptionResponse, CVFileResponse, 
    AnalysisRequest, AnalysisResultResponse, TestResponse
)
from .file_processor import FileProcessor
from .ai_analyzer import AIAnalyzer

# Create tables on startup
create_tables()

app = FastAPI(title="ResuMatch API", description="CV Analysis and Matching System", version="1.0.0")

# Get allowed origins from environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI analyzer
ai_analyzer = AIAnalyzer()

# Mount static files (React build)
frontend_build_path = "/app/frontend/build"
if os.path.exists(frontend_build_path):
    app.mount("/static", StaticFiles(directory=f"{frontend_build_path}/static"), name="static")

@app.get("/")
async def serve_frontend():
    """Serve React frontend or API status"""
    frontend_build_path = "/app/frontend/build"
    index_file = os.path.join(frontend_build_path, "index.html")
    
    if os.path.exists(index_file):
        return FileResponse(index_file)
    else:
        return {"message": "ResuMatch API is running"}

# Job Description Endpoints
@app.get("/api/jobs", response_model=List[JobDescriptionResponse])
async def get_all_jobs(db: Session = Depends(get_db)):
    """Get all job descriptions"""
    jobs = db.query(JobDescription).filter(JobDescription.active == True).all()
    return jobs

@app.post("/api/jobs", response_model=JobDescriptionResponse)
async def create_job(job: JobDescriptionCreate, db: Session = Depends(get_db)):
    """Create a new job description"""
    try:
        db_job = JobDescription(
            title=job.title,
            description=job.description,
            requirements=job.requirements
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job title must be unique"
        )

@app.post("/api/jobs/upload-json", response_model=JobDescriptionResponse)
async def upload_job_json(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload job description from JSON file"""
    try:
        content = await file.read()
        job_data = json.loads(content.decode('utf-8'))
        
        # Validate required fields
        if not all(key in job_data for key in ['title', 'description', 'requirements']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON must contain title, description, and requirements fields"
            )
        
        db_job = JobDescription(
            title=job_data['title'],
            description=job_data['description'],
            requirements=job_data['requirements']
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        return db_job
    
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format"
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job title must be unique"
        )

# CV File Endpoints
@app.get("/api/cvs", response_model=List[CVFileResponse])
async def get_all_cvs(db: Session = Depends(get_db)):
    """Get all uploaded CV files"""
    cvs = db.query(CVFile).all()
    return cvs

@app.post("/api/cvs/upload", response_model=List[CVFileResponse])
async def upload_cvs(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    """Upload multiple CV files"""
    uploaded_cvs = []
    
    for file in files:
        try:
            # Validate file type
            if not FileProcessor.validate_file_type(file.filename):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported file type: {file.filename}"
                )
            
            # Read file content
            file_content = await file.read()
            
            # Process file and extract text
            extracted_text, file_type = FileProcessor.process_file(file.filename, file_content)
            
            # Save to database
            db_cv = CVFile(
                filename=file.filename,
                content=extracted_text,
                file_type=file_type,
                file_size=len(file_content)
            )
            db.add(db_cv)
            db.commit()
            db.refresh(db_cv)
            uploaded_cvs.append(db_cv)
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to process {file.filename}: {str(e)}"
            )
    
    return uploaded_cvs

# Analysis Endpoints
@app.post("/api/analyze", response_model=List[AnalysisResultResponse])
async def analyze_cvs(request: AnalysisRequest, db: Session = Depends(get_db)):
    """Analyze CVs against a job description"""
    
    # Get job description
    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found"
        )
    
    # Get CV files
    cvs = db.query(CVFile).filter(CVFile.id.in_(request.cv_ids)).all()
    if not cvs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No CV files found"
        )
    
    # Prepare CV data for analysis
    cv_data = [{"id": cv.id, "filename": cv.filename, "content": cv.content} for cv in cvs]
    
    # Run AI analysis
    analysis_results = await ai_analyzer.analyze_multiple_cvs(
        job.description, job.requirements, cv_data
    )
    
    # Save results to database
    saved_results = []
    for result in analysis_results:
        db_result = AnalysisResult(
            cv_id=result['cv_id'],
            job_id=request.job_id,
            overall_score=result['overall_score'],
            matching_skills=result['matching_skills'],
            missing_skills=result['missing_skills'],
            summary=result['summary'],
            detailed_analysis=result['detailed_analysis']
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        
        # Add additional info for response
        cv = next((cv for cv in cvs if cv.id == result['cv_id']), None)
        response_data = AnalysisResultResponse(
            id=db_result.id,
            cv_id=db_result.cv_id,
            job_id=db_result.job_id,
            overall_score=db_result.overall_score,
            matching_skills=db_result.matching_skills,
            missing_skills=db_result.missing_skills,
            summary=db_result.summary,
            detailed_analysis=db_result.detailed_analysis,
            created_at=db_result.created_at,
            cv_filename=cv.filename if cv else "Unknown",
            job_title=job.title
        )
        saved_results.append(response_data)
    
    return saved_results

@app.get("/api/analyses/{job_id}", response_model=List[AnalysisResultResponse])
async def get_job_analyses(job_id: int, db: Session = Depends(get_db)):
    """Get all analysis results for a specific job"""
    analyses = db.query(AnalysisResult).filter(AnalysisResult.job_id == job_id).all()
    
    result = []
    for analysis in analyses:
        cv = db.query(CVFile).filter(CVFile.id == analysis.cv_id).first()
        job = db.query(JobDescription).filter(JobDescription.id == analysis.job_id).first()
        
        response_data = AnalysisResultResponse(
            id=analysis.id,
            cv_id=analysis.cv_id,
            job_id=analysis.job_id,
            overall_score=analysis.overall_score,
            matching_skills=analysis.matching_skills,
            missing_skills=analysis.missing_skills,
            summary=analysis.summary,
            detailed_analysis=analysis.detailed_analysis,
            created_at=analysis.created_at,
            cv_filename=cv.filename if cv else "Unknown",
            job_title=job.title if job else "Unknown"
        )
        result.append(response_data)
    
    return result

# Test Endpoint
@app.get("/api/test", response_model=TestResponse)
async def test_system(db: Session = Depends(get_db)):
    """Comprehensive system test endpoint"""
    
    test_results = {
        "status": "unknown",
        "database_test": {"status": "unknown"},
        "sample_job_created": {"status": "unknown"},
        "sample_cv_created": {"status": "unknown"},
        "analysis_test": {"status": "unknown"},
        "message": "Starting system tests..."
    }
    
    try:
        # Test 1: Database connection
        try:
            # Simple query to test database
            job_count = db.query(JobDescription).count()
            test_results["database_test"] = {
                "status": "success", 
                "message": f"Database connection successful. Found {job_count} job descriptions."
            }
        except Exception as db_error:
            test_results["database_test"] = {
                "status": "error", 
                "message": f"Database connection failed: {str(db_error)}"
            }
            raise Exception(f"Database test failed: {str(db_error)}")
        
        # Test 2: Create sample job description
        try:
            sample_job_title = "Test Senior Full Stack Developer"
            
            # Remove existing test job if it exists
            existing_job = db.query(JobDescription).filter(JobDescription.title == sample_job_title).first()
            if existing_job:
                db.delete(existing_job)
                db.commit()
            
            sample_job = JobDescription(
                title=sample_job_title,
                description="We are looking for a senior full stack developer with expertise in modern web technologies.",
                requirements=["React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker"]
            )
            
            db.add(sample_job)
            db.commit()
            db.refresh(sample_job)
            
            test_results["sample_job_created"] = {
                "status": "success", 
                "job_id": sample_job.id,
                "title": sample_job.title,
                "message": "Sample job created successfully"
            }
            
        except Exception as job_error:
            test_results["sample_job_created"] = {
                "status": "error",
                "message": f"Failed to create sample job: {str(job_error)}"
            }
            raise Exception(f"Job creation test failed: {str(job_error)}")
        
        # Test 3: Create sample CV
        try:
            sample_cv_content = """
John Doe
Senior Software Engineer

Experience:
- 5 years developing web applications using React, Node.js, and Python
- Experienced with PostgreSQL database design and optimization
- Proficient in Git version control and Agile development
- Strong problem-solving and communication skills

Skills:
React, JavaScript, Python, Node.js, PostgreSQL, Git, HTML, CSS
            """.strip()
            
            sample_cv = CVFile(
                filename="test_candidate.txt",
                content=sample_cv_content,
                file_type="txt",
                file_size=len(sample_cv_content.encode('utf-8'))
            )
            
            db.add(sample_cv)
            db.commit()
            db.refresh(sample_cv)
            
            test_results["sample_cv_created"] = {
                "status": "success",
                "cv_id": sample_cv.id,
                "filename": sample_cv.filename,
                "message": "Sample CV created successfully"
            }
            
        except Exception as cv_error:
            test_results["sample_cv_created"] = {
                "status": "error",
                "message": f"Failed to create sample CV: {str(cv_error)}"
            }
            raise Exception(f"CV creation test failed: {str(cv_error)}")
        
        # Test 4: AI Analysis
        try:
            if not ai_analyzer.is_configured:
                test_results["analysis_test"] = {
                    "status": "warning",
                    "ai_configured": False,
                    "message": "AI analyzer not configured - GEMINI_API_KEY missing",
                    "score": 0,
                    "matching_skills": [],
                    "missing_skills": []
                }
            else:
                cv_data = [{"id": sample_cv.id, "filename": sample_cv.filename, "content": sample_cv.content}]
                analysis_result = await ai_analyzer.analyze_multiple_cvs(
                    sample_job.description, sample_job.requirements, cv_data
                )
                
                if analysis_result and len(analysis_result) > 0:
                    result = analysis_result[0]
                    test_results["analysis_test"] = {
                        "status": "success",
                        "ai_configured": True,
                        "score": result.get('overall_score', 0),
                        "matching_skills": result.get('matching_skills', []),
                        "missing_skills": result.get('missing_skills', []),
                        "message": "AI analysis completed successfully"
                    }
                else:
                    test_results["analysis_test"] = {
                        "status": "error",
                        "ai_configured": True,
                        "message": "AI analysis returned empty results",
                        "score": 0,
                        "matching_skills": [],
                        "missing_skills": []
                    }
                    
        except Exception as ai_error:
            test_results["analysis_test"] = {
                "status": "error",
                "ai_configured": ai_analyzer.is_configured,
                "message": f"AI analysis failed: {str(ai_error)}",
                "score": 0,
                "matching_skills": [],
                "missing_skills": []
            }
        
        # Determine overall status
        if (test_results["database_test"]["status"] == "success" and 
            test_results["sample_job_created"]["status"] == "success" and 
            test_results["sample_cv_created"]["status"] == "success"):
            
            if test_results["analysis_test"]["status"] == "success":
                test_results["status"] = "success"
                test_results["message"] = "All systems operational. ResuMatch is ready for use."
            elif test_results["analysis_test"]["status"] == "warning":
                test_results["status"] = "warning"
                test_results["message"] = "Core systems operational. AI analysis unavailable (API key required)."
            else:
                test_results["status"] = "warning"
                test_results["message"] = "Core systems operational. AI analysis has issues."
        else:
            test_results["status"] = "error"
            test_results["message"] = "Critical system components failed."
        
        return TestResponse(**test_results)
        
    except Exception as e:
        test_results["status"] = "error"
        test_results["message"] = f"System test failed: {str(e)}"
        return TestResponse(**test_results)

# Catch-all route for React Router
@app.get("/{path:path}")
async def serve_react_app(path: str):
    """Serve React app for all non-API routes"""
    frontend_build_path = "/app/frontend/build"
    index_file = os.path.join(frontend_build_path, "index.html")
    
    if os.path.exists(index_file):
        return FileResponse(index_file)
    else:
        raise HTTPException(status_code=404, detail="Frontend not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)