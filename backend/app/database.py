from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Use environment variable for database URL or default to data directory
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/resumatch.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=False)  # Stored as JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)
    
    # Relationship to analysis results
    analysis_results = relationship("AnalysisResult", back_populates="job_description")

class CVFile(Base):
    __tablename__ = "cv_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to analysis results
    analysis_results = relationship("AnalysisResult", back_populates="cv_file")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cv_files.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    overall_score = Column(Float, nullable=False)  # 0-100
    matching_skills = Column(JSON, nullable=False)  # Array of matching skills
    missing_skills = Column(JSON, nullable=False)   # Array of missing skills
    summary = Column(Text, nullable=False)
    detailed_analysis = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cv_file = relationship("CVFile", back_populates="analysis_results")
    job_description = relationship("JobDescription", back_populates="analysis_results")

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise