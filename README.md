# AI-Based Skin Analysis and Recommendation System
 Project containing a Full-Stack Web Application for Skin Analysis using CNN (MobileNetV2).

## Structural Overview
- `frontend/`: React + Tailwind CSS web application.
- `backend/`: FastAPI backend providing REST endpoints.
- `model/`: AI Model training logic and inference wrapper.
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




