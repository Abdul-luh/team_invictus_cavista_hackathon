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
    # Use 2.0-flash specifically for better video reasoning
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        system_instruction="You are a strict fraud-detection AI for medical compliance. Your default answer is 'is_drinking: false' unless you see undeniable proof of swallowing."
    )
    
    prompt = """
    Analyze this video for Sickle Cell hydration compliance. 
    
    CRITICAL CHECKLIST:
    1. Container Tilt: Is the bottle/cup tilted towards the mouth?
    2. Mouth Contact: Is the container actually touching the lips?
    3. Water  test: Is water in the container
    3. The "Truth" Test: Do you see the throat move (swallow) or the water level drop? 
    
    If the person is just holding the bottle to their face without drinking, or if the bottle is closed/empty, you MUST return is_drinking: false.
    
    Return ONLY JSON:
    {
        "is_drinking": bool, 
        "ml": int, 
        "explanation": "State exactly what frames or movements proved the drink happened, or why it looks fake."
    }
    """

    content = [
        prompt,
        {
            "mime_type": "video/mp4",
            "data": video_content
        }
    ]

    try:
        response = model.generate_content(content)
        
        # DEBUG: Print Gemini's actual thoughts to your VS Code terminal
        print(f"--- Gemini Analysis ---")
        print(response.text)
        print(f"------------------------")

        cleaned_response = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(cleaned_response)
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {"is_drinking": False, "ml": 0, "explanation": "Verification failed."}

async def analyze_jaundice_eye(image_content: bytes):
    """
    Analyzes a photo of the eye to determine the yellowing level of the sclera.
    """
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        system_instruction="""You are a specialized ophthalmology AI. 
        Your goal is to detect jaundice (icterus) in the sclera of patients with Sickle Cell Disease."""
    )
    
    prompt = """
    TASK: Analyze the white part (sclera) of the eye in this image.
    
    BASELINE: A healthy sclera is clear white (Index 0.0). 
    COMPARISON: 
    - 0.0 - 2.0: Normal/Healthy.
    - 2.1 - 5.0: Mild yellowing (Observation required).
    - 5.1 - 8.0: Significant yellowing (Possible impending crisis).
    - 8.1 - 10.0: Severe jaundice (Immediate clinical attention).

    Strictly evaluate the intensity of yellow/amber hues compared to a pure white baseline. Ignore redness/veins.
    
    Return ONLY JSON:
    {
        "yellow_index": float,
        "status": "string",
        "observation": "detailed reason for the score"
    }
    """

    content = [
        prompt,
        {
            "mime_type": "image/jpeg",
            "data": image_content
        }
    ]

    try:
        response = model.generate_content(content)
        # Clean response string
        raw_text = response.text.strip()
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        
        return json.loads(raw_text)
    except Exception as e:
        print(f"Jaundice AI Error: {e}")
        return {"yellow_index": 0.0, "status": "Error", "observation": "Analysis failed."}