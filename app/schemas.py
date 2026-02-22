from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str      # New Field
    genotype: str       # New Field (e.g., AA, AS, SS)
    role: str
    patient_code_to_link: Optional[str] = None
    
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