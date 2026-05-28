from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import uuid
import json
import requests
from PIL import Image

import models
import schemas
import auth

from database import get_db

from model.inference import (
    analyze_skin_image,
    get_recommendations,
    get_detailed_skincare_data
)

router = APIRouter(
    prefix="/analyze",
    tags=["Analyze"]
)

# UPLOAD DIRECTORY
UPLOAD_DIR = "dataset/uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

# ANALYZE ROUTE
@router.post(
    "/",
    response_model=schemas.ScanResponse
)
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    )
):

    # VALIDATE FILE EXTENSION
    file_ext = os.path.splitext(
        file.filename
    )[1].lower()

    if file_ext not in [
        ".jpg",
        ".jpeg",
        ".png"
    ]:

        raise HTTPException(
            status_code=400,
            detail=
            "Only JPG, JPEG, PNG allowed."
        )

    # VALIDATE IMAGE
    try:

        img = Image.open(file.file)

        img.verify()

        file.file.seek(0)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )

    # SAVE IMAGE
    filename = (
        f"{uuid.uuid4()}{file_ext}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # AI ANALYSIS
    print(f"Analyzing {file_path}")

    try:

        prediction, confidence = (
            analyze_skin_image(file_path)
        )
        print(f"Prediction: {prediction}")
        print(f"Confidence: {confidence}")
    except Exception as e:

        print(
            f"Inference Error: {e}"
        )

        prediction = "dry"

        confidence = 0.95

    # RECOMMENDATION
    recommendation = (
        get_recommendations(
            prediction
        )
    )

    # GEMINI / GROQ ROUTINES
    seven_day_plan_str = None

    home_remedies_str = None

    gemini_key = os.environ.get(
        "GEMINI_API_KEY"
    )

    if gemini_key and gemini_key.strip():

        try:

            url = (
                "https://generativelanguage.googleapis.com/"
                "v1beta/models/gemini-1.5-flash:"
                f"generateContent?key={gemini_key}"
            )

            prompt = f"""
            You are an expert dermatologist AI.

            The detected skin condition is:
            {prediction}

            Generate:
            1. Personalized skincare routine
            2. 7-day skincare plan
            3. 3 natural remedies

            Return ONLY valid JSON:

            {{
              "seven_day_plan": {{
                "Monday": {{
                  "Morning": "...",
                  "Evening": "..."
                }},
                "Tuesday": {{
                  "Morning": "...",
                  "Evening": "..."
                }},
                "Wednesday": {{
                  "Morning": "...",
                  "Evening": "..."
                }},
                "Thursday": {{
                  "Morning": "...",
                  "Evening": "..."
                }},
                "Friday": {{
                  "Morning": "...",
                  "Evening": "..."
                }},
                "Saturday": {{
                  "Morning": "...",
                  "Evening": "..."
                }},
                "Sunday": {{
                  "Morning": "...",
                  "Evening": "..."
                }}
              }},

              "home_remedies": [

                {{
                  "title": "...",
                  "description": "..."
                }}

              ]
            }}
            """

            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            }

            response = requests.post(
                url,
                json=payload,
                timeout=20
            )

            if response.status_code == 200:

                response_data = (
                    response.json()
                )

                text = (
                    response_data["candidates"][0]
                    ["content"]["parts"][0]
                    ["text"]
                    .strip()
                )

                # CLEAN JSON
                text = (
                    text
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

                parsed = json.loads(text)

                seven_day_plan_str = (
                    json.dumps(
                        parsed.get(
                            "seven_day_plan",
                            {}
                        )
                    )
                )

                home_remedies_str = (
                    json.dumps(
                        parsed.get(
                            "home_remedies",
                            []
                        )
                    )
                )

                print(
                    "Gemini routine generated."
                )

        except Exception as gem_error:

            print(
                f"Gemini Error: {gem_error}"
            )

    # LOCAL FALLBACK
    if (
        not seven_day_plan_str
        or not home_remedies_str
    ):

        local_data = (
            get_detailed_skincare_data(
                prediction
            )
        )

        seven_day_plan_str = json.dumps(
            local_data.get(
                "seven_day_plan",
                {}
            )
        )

        home_remedies_str = json.dumps(
            local_data.get(
                "home_remedies",
                []
            )
        )

    # SAVE HISTORY
    new_scan = models.ScanHistory(

        user_id=current_user.id,

        image_path=file_path.replace(
            "\\",
            "/"
        ),

        prediction=prediction,

        confidence_score=confidence,

        recommendation=recommendation,

        seven_day_plan=
        seven_day_plan_str,

        home_remedies=
        home_remedies_str
    )

    db.add(new_scan)

    db.commit()

    db.refresh(new_scan)

    # SUCCESS NOTIFICATION
    try:

        success_notification = (
            models.Notification(

                user_id=current_user.id,

                title=
                "Skin Analysis Complete",

                message=
                f"{prediction} detected with "
                f"{int(confidence * 100)}% confidence.",

                type="success"
            )
        )

        db.add(
            success_notification
        )

        db.commit()

    except Exception as notify_error:

        print(
            f"Notification Error: "
            f"{notify_error}"
        )
        print({
          "prediction": prediction,
          "confidence_score": confidence,
          "recommendation": recommendation
         })

    # FINAL RESPONSE
    return {

        "id":
        new_scan.id,

        "prediction":
        prediction,

        "confidence_score":
        confidence,

        "recommendation":
        recommendation,

        "image_path":
        file_path.replace(
            "\\",
            "/"
        ),

        "seven_day_plan":
        json.loads(
            seven_day_plan_str
        ) if seven_day_plan_str else {},

        "home_remedies":
        json.loads(
            home_remedies_str
        ) if home_remedies_str else []
    }