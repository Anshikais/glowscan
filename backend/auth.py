from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import requests
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "supersecret_placement_project_key_change_in_prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user


CLERK_JWKS_CACHE = {}

def verify_clerk_token(token: str) -> dict:
    try:
        # Get key ID from JWT headers
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Token header is missing key ID (kid)")
            
        unverified_claims = jwt.get_unverified_claims(token)
        iss = unverified_claims.get("iss")
        if not iss:
            raise HTTPException(status_code=401, detail="Token is missing issuer (iss)")
            
        jwks_url = f"{iss.rstrip('/')}/.well-known/jwks.json"
        
        if jwks_url not in CLERK_JWKS_CACHE:
            resp = requests.get(jwks_url)
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to retrieve Clerk JWKS")
            CLERK_JWKS_CACHE[jwks_url] = resp.json()
            
        jwks = CLERK_JWKS_CACHE[jwks_url]
        
        # Find matching key from JWKS
        public_key = None
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                public_key = key
                break
                
        if not public_key:
            raise HTTPException(status_code=401, detail="Matching public key not found in JWKS")
            
        # Decode and verify the token signature
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Clerk credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

