# AI-Based Skin Analysis and Recommendation System

A placement-ready B.Tech final year project containing a Full-Stack Web Application for Skin Analysis using CNN (MobileNetV2).

## Structural Overview
- `frontend/`: React + Tailwind CSS web application.
- `backend/`: FastAPI backend providing REST endpoints.
- `model/`: AI Model training logic and inference wrapper.
- `dataset/`: Directory to place datasets (e.g., Kaggle Oily-Dry-Normal Skin dataset).
- `docs/`: API and deployment documentation.

## Setup Instructions

### Backend
Requires Python 3.9+
1. Create a virtual environment: `python -m venv venv`
2. Activate the environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Start the FastAPI server: `uvicorn backend.main:app --reload`

### Frontend
Requires Node.js 18+
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

### AI Model (Mock vs Training)
- By default, the application runs a lightweight pre-trained MobileNetV2 architecture.
- For academic demonstration, uncomment the mock layer in `backend/routers/analyze.py` if heavy torch inference lags your computer.

## Deployment
See `docs/deployment.md` for information on how to deploy this stack.
