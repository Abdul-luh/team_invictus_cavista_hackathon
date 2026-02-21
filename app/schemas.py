from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    role: str # patient, caregiver, consultant
    patient_code_to_link: Optional[str] = None # Only for caregivers

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    patient_code: Optional[str]
    linked_patient_code: Optional[str]

    class Config:
        from_attributes = True