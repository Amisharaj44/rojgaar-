from pydantic import BaseModel, Field
from typing import List

class WorkerCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    password: str
    work_type: List[str]
    area: str

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: str
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class JobRequestCreate(BaseModel):
    worker_id: int
    work_type: str
    description: str | None = None

class ReviewCreate(BaseModel):
    job_request_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None