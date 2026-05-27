from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json

import models
import auth

from database import get_db

router = APIRouter(
    prefix="/history",
    tags=["History"]
)

# GET USER HISTORY
@router.get("/")
def get_user_history(

    db: Session = Depends(get_db),

    current_user: models.User = Depends(
        auth.get_current_user
    )
):

    scans = db.query(
        models.ScanHistory
    ).filter(

        models.ScanHistory.user_id
        == current_user.id

    ).order_by(
        models.ScanHistory.timestamp.desc()
    ).all()

    formatted_scans = []

    for scan in scans:

        try:

            seven_day_plan = (
                json.loads(scan.seven_day_plan)
                if scan.seven_day_plan
                else {}
            )

        except:

            seven_day_plan = {}

        try:

            home_remedies = (
                json.loads(scan.home_remedies)
                if scan.home_remedies
                else []
            )

        except:

            home_remedies = []

        formatted_scans.append({

            "id":
            scan.id,

            "prediction":
            scan.prediction,

            "confidence_score":
            scan.confidence_score,

            "recommendation":
            scan.recommendation,

            "image_path":
            scan.image_path,

            "timestamp":
            scan.timestamp,

            "seven_day_plan":
            seven_day_plan,

            "home_remedies":
            home_remedies
        })

    return formatted_scans


# SAVE NEW SCAN
@router.post("/save")
def save_scan_history(

    data: dict,

    db: Session = Depends(get_db)
):

    try:

        new_scan = models.ScanHistory(

            user_id=1,

            prediction=data.get(
                "skin_type",
                "Unknown"
            ),

            confidence_score=float(
                data.get(
                    "confidence",
                    0
                )
            ),

            recommendation=" | ".join(
                data.get(
                    "recommendations",
                    []
                )
            ),

            image_path=data.get(
                "image",
                ""
            ),

            seven_day_plan=json.dumps(
                data.get(
                    "seven_day_plan",
                    {}
                )
            ),

            home_remedies=json.dumps(
                data.get(
                    "recommendations",
                    []
                )
            )
        )

        db.add(new_scan)

        db.commit()

        db.refresh(new_scan)

        return {
            "message": "Scan saved successfully"
        }

    except Exception as e:

        db.rollback()

        return {
            "error": str(e)
        }