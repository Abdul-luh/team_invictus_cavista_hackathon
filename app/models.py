from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from .database import Base
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)  # New Column
    genotype = Column(String)   # New Column
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)  # Raw text for hackathon speed
    role = Column(String, nullable=False)     # 'patient', 'caregiver', 'consultant'

    # For Patients: The unique SC-XXXX code
    patient_code = Column(String, unique=True, index=True, nullable=True)

    # For Caregivers: The code of the patient they are linked to
    linked_patient_code = Column(String, nullable=True)

class HealthLog(Base):
    __tablename__ = "health_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    log_type = Column(String, nullable=False) # Will be 'hydration'
    value = Column(Float, nullable=False)     # Will store the ml detected
    is_verified = Column(Boolean, default=False) 
    note = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

