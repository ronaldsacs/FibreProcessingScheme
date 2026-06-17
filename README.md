# FibreProcessingScheme
Fibre Processing Scheme for selecting and sizing equipment
cat > README.md << 'EOL'
# OCC Pulp Mill Sizing Application

A full-stack web application for sizing Old Corrugated Container (OCC) line pulp mills from conveyor to final storage tower. 
The application recommends Basic, Essential, and Full-Fledged process schemes with reject handling, grounded in OEM standards (Andritz, Kadant, Voith, Valmet, Bellmer, Papcel).

## Tech Stack
- **Backend:** Python, FastAPI, PostgreSQL
- **Frontend:** Next.js, React, React Flow, Tailwind CSS
- **Reporting:** jsPDF, html2canvas

## Setup Instructions

### 1. Database (PostgreSQL)
Run the SQL scripts in `backend/database.py` to create the schema and tables.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic
uvicorn main:app --reload
