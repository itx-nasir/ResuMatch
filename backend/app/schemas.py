from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Job Description Schemas
class JobDescriptionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    requirements: List[str] = Field(..., min_items=1)

class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    description: str
    requirements: List[str]
    created_at: datetime
    active: bool

    class Config:
        from_attributes = True

# CV File Schemas
class CVFileResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Analysis Result Schemas
class AnalysisRequest(BaseModel):
    job_id: int
    cv_ids: List[int]

class AnalysisResultResponse(BaseModel):
    id: int
    cv_id: int
    job_id: int
    overall_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    summary: str
    detailed_analysis: str
    created_at: datetime
    cv_filename: str
    job_title: str

    class Config:
        from_attributes = True

# Test Endpoint Response
class TestResponse(BaseModel):
    status: str
    database_test: dict
    sample_job_created: dict
    sample_cv_created: dict
    analysis_test: dict
    message: str