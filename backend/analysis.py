import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-flash-latest')

def analyze_food_image(image_bytes, food_type="General"):
    """
    Analyzes an image for food adulteration using Gemini 1.5 Flash.
    Returns a dictionary with detection results.
    """
    
    prompt = f"Analyze this image of {food_type} for adulteration. Return ONLY a JSON object: {{\"food_item\": \"{food_type}\", \"adulterated\": boolean, \"confidence_score\": float, \"purity_percentage\": float, \"report_summary\": \"string\", \"adulterants_found\": [], \"recommendations\": []}}"
    
    start_time = datetime.now()
    try:
        print(f"[{start_time}] DEBUG: Starting Gemini Analysis for {food_type}...")
        img_part = {"mime_type": "image/jpeg", "data": image_bytes}
        
        response = model.generate_content(
            [prompt, img_part],
            generation_config={"response_mime_type": "application/json"}
        )
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        print(f"[{end_time}] DEBUG: Gemini Analysis finished in {duration}s")
        
        text = response.text.strip()
        
        # Robust JSON extraction
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        result = json.loads(text)
        
        if "purity_percentage" not in result:
            result["purity_percentage"] = 100 - result.get("confidence_score", 0) if result.get("adulterated") else 100
            
        return result
    except Exception as e:
        error_time = datetime.now()
        print(f"[{error_time}] DEBUG: Gemini ERROR after {(error_time - start_time).total_seconds()}s: {e}")
        return {
            "food_item": food_type,
            "adulterated": False,
            "error": str(e),
            "confidence_score": 0,
            "purity_percentage": 0,
            "report_summary": f"Analysis failed: {str(e)}"
        }
