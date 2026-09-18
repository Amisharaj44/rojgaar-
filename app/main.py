from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, JobRequest, Review
from app.schemas import (
    CustomerCreate,
    WorkerCreate,
    UserLogin,
    JobRequestCreate,
    ReviewCreate
)
from app.auth import create_access_token, get_current_user
from app.utils import hash_password, verify_password

app = FastAPI(title="Rojgaar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Rojgaar API is running"}

@app.post("/workers")
def create_worker(
    worker: WorkerCreate,
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.phone == worker.phone).first():
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    if worker.email:
        if db.query(User).filter(User.email == worker.email).first():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

    new_worker = User(
        name=worker.name,
        phone=worker.phone,
        email=worker.email,
        password=hash_password(worker.password),
        role="worker",
        work_type=worker.work_type,
        area=worker.area
    )

    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    return {
        "message": "Worker registered successfully",
        "id": new_worker.id
    }

@app.post("/customers")
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.phone == customer.phone).first():
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    if db.query(User).filter(User.email == customer.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_customer = User(
        name=customer.name,
        phone=customer.phone,
        email=customer.email,
        password=hash_password(customer.password),
        role="customer"
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return {
        "message": "Customer registered successfully",
        "id": new_customer.id
    }

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.phone == user.phone
    ).first()

    if not db_user or not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid phone number or password"
        )

    token = create_access_token({
        "user_id": db_user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }

@app.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "phone": current_user.phone,
        "email": current_user.email,
        "role": current_user.role,
        "work_type": current_user.work_type,
        "area": current_user.area
    }

@app.get("/workers")
def get_workers(
    work_type: str | None = None,
    area: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == "worker")

    workers = query.all()

    result = []

    for worker in workers:
        if work_type:
            if not worker.work_type:
                continue

            if work_type.lower() not in [
                item.lower() for item in worker.work_type
            ]:
                continue

        if area:
            if not worker.area:
                continue

            if area.lower() not in worker.area.lower():
                continue

        average_rating = db.query(
            func.avg(Review.rating)
        ).filter(
            Review.worker_id == worker.id
        ).scalar()

        review_count = db.query(
            Review.id
        ).filter(
            Review.worker_id == worker.id
        ).count()

        result.append({
            "id": worker.id,
            "name": worker.name,
            "phone": worker.phone,
            "work_type": worker.work_type,
            "area": worker.area,
            "average_rating": round(float(average_rating), 1)
            if average_rating else None,
            "review_count": review_count
        })

    return result

@app.get("/workers/{worker_id}")
def get_worker_profile(
    worker_id: int,
    db: Session = Depends(get_db)
):
    worker = db.query(User).filter(
        User.id == worker_id,
        User.role == "worker"
    ).first()

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    average_rating = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.worker_id == worker.id
    ).scalar()

    review_count = db.query(
        Review.id
    ).filter(
        Review.worker_id == worker.id
    ).count()

    return {
        "id": worker.id,
        "name": worker.name,
        "phone": worker.phone,
        "work_type": worker.work_type,
        "area": worker.area,
        "average_rating": round(float(average_rating), 1)
        if average_rating else None,
        "review_count": review_count
    }

@app.post("/job-requests")
def create_job_request(
    request: JobRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can create job requests"
        )

    worker = db.query(User).filter(
        User.id == request.worker_id,
        User.role == "worker"
    ).first()

    if not worker:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    if not worker.work_type or request.work_type.lower() not in [
        item.lower() for item in worker.work_type
    ]:
        raise HTTPException(
            status_code=400,
            detail="Worker does not provide this work type"
        )

    new_request = JobRequest(
        customer_id=current_user.id,
        worker_id=worker.id,
        work_type=request.work_type,
        description=request.description,
        status="pending"
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "message": "Job request created",
        "id": new_request.id,
        "status": new_request.status
    }

@app.get("/my-job-requests")
def get_my_job_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can view these requests"
        )

    requests = db.query(JobRequest).filter(
        JobRequest.customer_id == current_user.id
    ).all()

    result = []

    for request in requests:
        worker = db.query(User).filter(
            User.id == request.worker_id
        ).first()

        result.append({
            "id": request.id,
            "worker_id": request.worker_id,
            "worker_name": worker.name if worker else None,
            "worker_phone": worker.phone if worker else None,
            "work_type": request.work_type,
            "description": request.description,
            "status": request.status
        })

    return result

@app.get("/job-requests")
def get_worker_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=403,
            detail="Only workers can view job requests"
        )

    requests = db.query(JobRequest).filter(
        JobRequest.worker_id == current_user.id
    ).all()

    result = []

    for request in requests:
        customer = db.query(User).filter(
            User.id == request.customer_id
        ).first()

        result.append({
            "id": request.id,
            "customer_id": request.customer_id,
            "customer_name": customer.name if customer else None,
            "customer_phone": customer.phone if customer else None,
            "work_type": request.work_type,
            "description": request.description,
            "status": request.status
        })

    return result

@app.patch("/job-requests/{request_id}")
def update_job_request(
    request_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=403,
            detail="Only workers can update requests"
        )

    if status not in ["accepted", "rejected", "completed"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    request = db.query(JobRequest).filter(
        JobRequest.id == request_id,
        JobRequest.worker_id == current_user.id
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Job request not found"
        )

    if status == "completed" and request.status != "accepted":
        raise HTTPException(
            status_code=400,
            detail="Only accepted requests can be completed"
        )

    request.status = status
    db.commit()

    return {
        "message": "Request updated",
        "status": request.status
    }

@app.post("/reviews")
def create_review(
    review: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can submit reviews"
        )

    request = db.query(JobRequest).filter(
        JobRequest.id == review.job_request_id,
        JobRequest.customer_id == current_user.id
    ).first()

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Job request not found"
        )

    if request.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="You can review only completed work"
        )

    existing_review = db.query(Review).filter(
        Review.job_request_id == request.id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You already reviewed this work"
        )

    new_review = Review(
        job_request_id=request.id,
        customer_id=current_user.id,
        worker_id=request.worker_id,
        rating=review.rating,
        comment=review.comment
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "message": "Review submitted successfully",
        "id": new_review.id
    }

@app.get("/workers/{worker_id}/reviews")
def get_worker_reviews(
    worker_id: int,
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(
        Review.worker_id == worker_id
    ).all()

    average_rating = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.worker_id == worker_id
    ).scalar()

    return {
        "average_rating": round(float(average_rating), 1)
        if average_rating else None,
        "review_count": len(reviews),
        "reviews": [
            {
                "rating": review.rating,
                "comment": review.comment
            }
            for review in reviews
        ]
    }