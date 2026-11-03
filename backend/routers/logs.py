
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import LogAnalysis, User
from services.log_analyzer import analyze_logs


router = APIRouter(prefix="/logs", tags=["Log Analysis"])


# --------------------------------------------------
# Request Schema
# --------------------------------------------------

class LogRequest(BaseModel):
    filename: str = Field(
        default="pasted_logs.log",
        max_length=255
    )

    log_text: str = Field(
        min_length=1,
        max_length=5 * 1024 * 1024
    )


# --------------------------------------------------
# Analyze Logs
# --------------------------------------------------

@router.post("/analyze")
def analyze_log_file(
    request: LogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate filename
    filename = request.filename.strip()

    if not filename:
        raise HTTPException(
            status_code=400,
            detail="Filename cannot be empty."
        )

    if "/" in filename or "\\" in filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid filename."
        )

    if Path(filename).suffix.lower() not in {".log", ".txt"}:
        raise HTTPException(
            status_code=400,
            detail="Only .log and .txt files are allowed."
        )

    # Validate log content
    if not request.log_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Log content cannot be empty."
        )

    # Validate maximum file size (5 MB)
    if len(request.log_text.encode("utf-8")) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Log file size cannot exceed 5 MB."
        )

    try:
        # Analyze log content
        result = analyze_logs(request.log_text)

        # Save analysis in database
        analysis = LogAnalysis(
            user_id=current_user.id,
            filename=filename,
            total_lines=result["total_lines"],
            error_count=result["error_count"],
            critical_count=result["critical_count"],
            high_count=result["high_count"],
            medium_count=result["medium_count"],
            low_count=result["low_count"],
            overall_severity=result["overall_severity"],
            summary=result["summary"],
            findings=result["findings"]
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return {
            "status": "success",
            "analysis_id": analysis.id,
            **result
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Log analysis failed. Check backend logs."
        )


# --------------------------------------------------
# Analysis History
# --------------------------------------------------

@router.get("/history")
def get_analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = (
        db.query(LogAnalysis)
        .filter(LogAnalysis.user_id == current_user.id)
        .order_by(LogAnalysis.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "id": item.id,
            "filename": item.filename,
            "total_lines": item.total_lines,
            "error_count": item.error_count,
            "overall_severity": item.overall_severity,
            "summary": item.summary,
            "created_at": item.created_at,
            "findings": item.findings
        }
        for item in records
    ]


# --------------------------------------------------
# Analysis Statistics
# --------------------------------------------------

@router.get("/stats")
def get_analysis_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = (
        db.query(LogAnalysis)
        .filter(LogAnalysis.user_id == current_user.id)
        .all()
    )

    return {
        "total_analyses": len(records),
        "total_lines": sum(item.total_lines for item in records),
        "total_errors": sum(item.error_count for item in records),
        "critical": sum(item.critical_count for item in records),
        "high": sum(item.high_count for item in records),
        "medium": sum(item.medium_count for item in records),
        "low": sum(item.low_count for item in records)
    }
