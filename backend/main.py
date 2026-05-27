from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm
import os
import random
import models
import schemas
import auth
import database

from routers import analyze, history, notifications, dermatologists
from email_utils import send_email_notification

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI Skin Analysis API")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For student projects, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("dataset/uploads", exist_ok=True)
app.mount("/dataset", StaticFiles(directory="dataset/uploads"), name="dataset")

# Include Routers
app.include_router(analyze.router)
app.include_router(history.router)
app.include_router(notifications.router)
app.include_router(dermatologists.router)

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pass = auth.get_password_hash(user.password)
    
    # Generate verification OTP
    otp = f"{random.randint(100000, 999999)}"
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pass,
        is_verified=False,
        verification_otp=otp,
        otp_expiry=otp_expiry
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send email
    subject = "Verify Your Account - AI Skin Analysis"
    body = f"Welcome to AI Skin Analysis! Your verification OTP is: {otp}. It will expire in 10 minutes."
    send_email_notification(user.email, subject, body)
    
    # Create notification
    notification = models.Notification(
        user_id=new_user.id,
        title="Welcome to AI Skin Analysis!",
        message="Please verify your account using the OTP sent to your email.",
        type="info"
    )
    db.add(notification)
    db.commit()
    
    return new_user

@app.post("/verify-otp")
def verify_otp(verify_data: schemas.UserVerify, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == verify_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        return {"message": "Email already verified"}
    
    if not user.verification_otp or user.verification_otp != verify_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    if not user.otp_expiry or user.otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP code has expired")
        
    user.is_verified = True
    user.verification_otp = None
    user.otp_expiry = None
    db.commit()
    
    # Create notification
    notification = models.Notification(
        user_id=user.id,
        title="Account Verified",
        message="Your account has been successfully verified! You can now analyze your skin.",
        type="success"
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Account successfully verified"}

@app.post("/resend-otp")
def resend_otp(data: schemas.ForgotPassword, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.is_verified:
        return {"message": "Email already verified"}
        
    otp = f"{random.randint(100000, 999999)}"
    user.verification_otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    
    # Send email
    subject = "Verify Your Account - AI Skin Analysis (Resend)"
    body = f"Your new verification OTP is: {otp}. It will expire in 10 minutes."
    send_email_notification(user.email, subject, body)
    
    return {"message": "New OTP sent successfully"}

@app.post("/forgot-password")
def forgot_password(data: schemas.ForgotPassword, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    otp = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp
    user.reset_otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    
    # Send email
    subject = "Reset Your Password - AI Skin Analysis"
    body = f"Your password reset OTP is: {otp}. It will expire in 10 minutes."
    send_email_notification(user.email, subject, body)
    
    return {"message": "Reset OTP sent successfully"}

@app.post("/reset-password")
def reset_password(data: schemas.ResetPassword, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.reset_otp or user.reset_otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    if not user.reset_otp_expiry or user.reset_otp_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP code has expired")
        
    user.hashed_password = auth.get_password_hash(data.new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None
    db.commit()
    
    # Create notification
    notification = models.Notification(
        user_id=user.id,
        title="Password Reset Successful",
        message="Your password has been successfully updated.",
        type="success"
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Password successfully updated"}

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account not verified. Please verify your email first.",
        )
    
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Log login notification
    try:
        notification = models.Notification(
            user_id=user.id,
            title="Successful Login",
            message=f"Logged in successfully at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC.",
            type="info"
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        print(f"Error creating login notification: {e}")
        
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/clerk-login", response_model=schemas.Token)
def clerk_login(payload: schemas.ClerkLogin, db: Session = Depends(database.get_db)):
    # Verify Clerk Token signature & decode it
    clerk_payload = auth.verify_clerk_token(payload.clerk_token)
    clerk_sub = clerk_payload.get("sub")
    
    if not clerk_sub:
        raise HTTPException(status_code=401, detail="Clerk token is missing subject (sub) claim")
        
    # Check if this email exists in database
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    clerk_pass_ident = f"clerk_{clerk_sub}"
    
    if user:
        # Verify matching Clerk sub or migrate legacy email/password users
        if user.hashed_password.startswith("clerk_"):
            if user.hashed_password != clerk_pass_ident:
                raise HTTPException(status_code=401, detail="Identity mismatch for this email address")
        else:
            # Migrate legacy password user to Clerk-managed user
            user.hashed_password = clerk_pass_ident
            user.is_verified = True
            db.commit()
    else:
        # Create a new Clerk-managed user record
        user = models.User(
            email=payload.email,
            hashed_password=clerk_pass_ident,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Log registration notification
        try:
            notification = models.Notification(
                user_id=user.id,
                title="Welcome to AI Skincare!",
                message="Account successfully initialized and authenticated via Clerk secure portals.",
                type="success"
            )
            db.add(notification)
            db.commit()
        except Exception as e:
            print(f"Error creating registration notification: {e}")

    # Generate a backend JWT token for full downstream route compatibility
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Log successful login notification
    try:
        notification = models.Notification(
            user_id=user.id,
            title="Clerk Login Successful",
            message=f"Logged in successfully via Clerk credentials at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC.",
            type="info"
        )
        db.add(notification)
        db.commit()
    except Exception as e:
        print(f"Error creating login notification: {e}")
        
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Skin Analysis API"}

