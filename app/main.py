from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import List

from .database import Base, engine, get_db
from .models import User, HealthLog
from .schemas import UserSignup, UserLogin, UserResponse
from .utils import generate_sickle_code, verify_drinking_action

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sickle DB API")

@app.get("/")
def home():
    return {"message": "Sickle_DB Backend Active"}

@app.post("/signup", response_model=UserResponse)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    user_role = data.role.lower()

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=data.email,
        password=data.password,
        role=user_role
    )

    if user_role == "patient":
        while True:
            code = generate_sickle_code()
            if not db.query(User).filter(User.patient_code == code).first():
                new_user.patient_code = code
                break
        new_user.linked_patient_code = None

    elif user_role == "caregiver":
        if not data.patient_code_to_link:
            raise HTTPException(status_code=400, detail="Patient code is required for caregivers")
        
        target = db.query(User).filter(
            User.patient_code == data.patient_code_to_link,
            User.role == "patient"
        ).first()
        
        if not target:
            raise HTTPException(status_code=404, detail="Invalid Patient Code. Please verify with the patient.")
        
        new_user.linked_patient_code = data.patient_code_to_link
        new_user.patient_code = None

    elif user_role == "consultant":
        new_user.patient_code = None
        new_user.linked_patient_code = None
    
    else:
        raise HTTPException(status_code=400, detail="Invalid role. Use 'patient', 'caregiver', or 'consultant'.")

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=UserResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user

@app.post("/logs/hydration-verify/{user_id}")
async def upload_hydration_video(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Read the video file into memory
    video_bytes = await file.read()

    # 2. Call Gemini for verification
    analysis = await verify_drinking_action(video_bytes)

    if not analysis["is_drinking"]:
        raise HTTPException(
            status_code=400, 
            detail="AI Verification Failed: Please drink actual water to update progress."
        )

    # 3. Save the verified log to sickle_db
    new_log = HealthLog(
        user_id=user_id,
        log_type="hydration",
        value=float(analysis["ml"]),
        note=analysis["explanation"],
        is_verified=True
    )
    db.add(new_log)
    db.commit()

    # 4. Calculate progress (3 verified drinks = 100%)
    total_drinks_today = db.query(HealthLog).filter(
        HealthLog.user_id == user_id,
        HealthLog.log_type == "hydration",
        func.date(HealthLog.timestamp) == date.today(),
        HealthLog.is_verified == True
    ).count()

    current_progress = (total_drinks_today / 3) * 100
    
    return {
        "verified": True,
        "ml_added": analysis["ml"],
        "drinks_today": total_drinks_today,
        "progress_percentage": min(current_progress, 100.0),
        "message": f"Verified! Progress: {round(current_progress, 1)}%"
    }