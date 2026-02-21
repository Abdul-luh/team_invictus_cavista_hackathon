import random
import string
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
load_dotenv()


def generate_sickle_code():
    """Generates a unique 4-digit code: SC-1234"""
    digits = ''.join(random.choices(string.digits, k=4))
    return f"SC-{digits}"



# Get your key from aistudio.google.com
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def verify_drinking_action(video_content: bytes):
    model = genai.GenerativeModel('gemini-2.0-flash') # Use 2.0-flash for speed/vision accuracy
    
    prompt = """
    You are a strict medical verification AI. Your job is to detect if a patient with Sickle Cell is ACTUALLY hydrating or faking it.
    
    STRICT VERIFICATION CRITERIA:
    1. LIQUID LEVEL: Is there actual liquid in the cup/bottle? If the container is opaque, is it tilted enough for liquid to flow?
    2. SWALLOWING MOTION: Look closely at the throat (Adam's apple area). Do you see rhythmic swallowing motions?
    3. LIP SEAL: Is there a proper seal between the mouth and the container?
    4. CHEATING DETECTION: If the person is just putting the cup to their lips without swallowing, or if the water level does not decrease, 'is_drinking' MUST be false.

    Analyze the video frame-by-frame. 
    Return ONLY a JSON object:
    {
        "is_drinking": bool, 
        "ml": int, 
        "explanation": "Detailed clinical reason for your decision"
    }
    """

    content = [
        prompt,
        {
            "mime_type": "video/mp4",
            "data": video_content
        }
    ]

    response = model.generate_content(content)
    
    try:
        cleaned_response = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(cleaned_response)
    except:
        return {"is_drinking": False, "ml": 0, "explanation": "AI failed to parse video logic."}