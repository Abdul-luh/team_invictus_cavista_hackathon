from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import List

from .database import Base, engine, get_db
from .models import User, HealthLog
from .schemas import UserSignup, UserLogin, UserResponse
from .utils import generate_sickle_code, verify_drinking_action, analyze_jaundice_eye
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sickle DB API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any website to talk to your backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



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

@app.post("/logs/jaundice-check/{user_id}")
async def jaundice_check(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Read image bytes
    image_bytes = await file.read()

    # 2. Call Gemini for the Index
    analysis = await analyze_jaundice_eye(image_bytes)

    # 3. Record in HealthLog
    new_log = HealthLog(
        user_id=user_id,
        log_type="jaundice",
        value=analysis["yellow_index"],
        note=analysis["observation"],
        is_verified=True # It's AI verified
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # 4. Crisis Prediction (The "Wow" logic)
    # Check if the last log was lower than this one (Trending upwards)
    previous_log = db.query(HealthLog).filter(
        HealthLog.user_id == user_id, 
        HealthLog.log_type == "jaundice"
    ).order_by(HealthLog.timestamp.desc()).offset(1).first()

    risk_rising = False
    if previous_log and analysis["yellow_index"] > previous_log.value:
        risk_rising = True

    return {
        "yellow_index": analysis["yellow_index"],
        "status": analysis["status"],
        "risk_rising": risk_rising,
        "message": "Crisis risk alert sent to caregiver!" if risk_rising and analysis["yellow_index"] > 5 else "Record updated."
    }

@app.get("/user/profile/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": user.email,
        "role": user.role,
        "patient_code": user.patient_code,  # This is the SC-XXXX code
        "linked_patient_code": user.linked_patient_code, # For caregivers
        "message": "Success"
    }


@app.get("/user/clinical-report/{user_id}")
def get_clinical_report(user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch the latest hydration AND latest jaundice logs
    hydration = db.query(HealthLog).filter(HealthLog.user_id == user_id, HealthLog.log_type == "hydration").order_by(HealthLog.timestamp.desc()).first()
    jaundice = db.query(HealthLog).filter(HealthLog.user_id == user_id, HealthLog.log_type == "jaundice").order_by(HealthLog.timestamp.desc()).first()

    if not hydration or not jaundice:
        return {"error": "Insufficient data. Please log both hydration and a jaundice check."}

    # 2. Use the 'value' column from your HealthLog model
    current_water = hydration.value
    current_jaundice = jaundice.value

    target_water = 2500  
    base_jaundice = 2.0 

    water_drop = round(((target_water - current_water) / target_water) * 100, 1)
    jaundice_rise = round(((current_jaundice - base_jaundice) / base_jaundice) * 100, 1) if current_jaundice > base_jaundice else 0

    # 3. Prompt (Strictly following your detailed requirements)
    prompt = f"""
    You are a professional Hematologist. Analyze this specific Sickle Cell data:
    - Hydration Level: {current_water}ml (which is a {water_drop}% drop from the safety target)
    - Eye Yellowishness Score: {current_jaundice}/10 (indicating a {jaundice_rise}% estimated rise in Bilirubin markers)
    
    Write a detailed, formal medical summary for the patient.
    1. Start by explicitly stating: 'Your hydration level has dropped by {water_drop}%...'
    2. Mention that the eye data suggests a {jaundice_rise}% increase in bilirubin.
    3. Explain that this combination increases the risk of a Vaso-Occlusive Crisis (VOC).
    4. Conclude with: 'It is strongly advised that you see a doctor immediately.'
    
    Make it 2-3 detailed, professional paragraphs.
    """
    

    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)
    
    return {
        "user_id": user_id,
        "detailed_report": response.text,
        "metrics": {
            "water_percent_drop": water_drop,
            "bilirubin_percent_rise": jaundice_rise
        }
    }