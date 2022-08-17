# ResuMatch - AI-Powered CV Analysis & Matching System

A comprehensive web application that analyzes CVs against job descriptions using Google Gemini AI, providing structured scoring and ranking to streamline the hiring process.

## 🚀 Features

### Core Functionality
- **Job Description Management**: Create and manage job descriptions with requirements
- **Multi-format CV Upload**: Support for PDF, DOC, DOCX, and TXT files
- **AI-Powered Analysis**: Google Gemini AI integration with mock data fallback
- **Batch Processing**: Analyze multiple CVs simultaneously against job descriptions
- **Structured Scoring**: Color-coded scoring system (70+ Green, 50-69 Yellow, <50 Red)
- **Detailed Insights**: Matching skills, missing skills, and comprehensive analysis

### Technical Features
- **Modern UI**: Two-column responsive layout built with React
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Updates**: Live analysis results and visual feedback
- **Data Persistence**: SQLite database with proper relationships
- **Containerized**: Docker support for easy deployment
- **Error Handling**: Comprehensive error handling and loading states

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **Database**: SQLite with three main tables:
  - `job_descriptions`: Job titles, descriptions, and requirements
  - `cv_files`: Uploaded CV metadata and extracted content
  - `analysis_results`: AI analysis results linking CVs to jobs
- **AI Engine**: Google Gemini API integration with mock data fallback
- **File Processing**: Text extraction from multiple file formats
- **API Endpoints**: RESTful API for all operations

### Frontend (React)
- **Modern React**: Hooks, Context API, and functional components
- **Component Architecture**: Modular, reusable components
- **State Management**: Centralized state with React hooks
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Installation & Setup

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Node.js 18+ and Python 3.11+ (for manual setup)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResuMatch
   ```

2. **Configure environment (optional)**
   ```bash
   cp env.example .env
   # Edit .env and add your Google Gemini API key
   ```

3. **Build and run with Docker Compose**
   ```bash
   # Production mode
   docker-compose up --build

   # Development mode (with hot reload)
   docker-compose --profile dev up --build resumatch-dev
   ```

4. **Access the application**
   - Production: http://localhost:8000
   - Development: http://localhost:8001

### Option 2: Manual Setup

#### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
export GEMINI_API_KEY="your_api_key_here"  # Optional

# Start the backend server
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Install Node.js dependencies
cd frontend
npm install

# Start the development server
npm start
```

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key (optional - uses mock data if not provided)
- `DATABASE_URL`: SQLite database path (default: `sqlite:///./resumatch.db`)
- `ALLOWED_ORIGINS`: CORS allowed origins (default: `http://localhost:3000`)

### Getting Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file or environment variables

## 📖 Usage Guide

### 1. System Test
- Click "System Test" in the header to verify all components are working
- This creates sample data and tests database, file processing, and AI analysis

### 2. Creating Job Descriptions
- **Manual Creation**: Use the form to enter job title, description, and requirements
- **JSON Upload**: Upload a JSON file with job description data
- **Format**: See `sample_data/sample_job.json` for the expected format

### 3. Uploading CVs
- **Drag & Drop**: Drop multiple files into the upload area
- **Supported Formats**: PDF, DOC, DOCX, TXT
- **Batch Processing**: Upload multiple CVs at once

### 4. Running Analysis
- Select a job description from the left panel
- Select one or more CVs from the right panel
- Click "Analyze CVs" to start the AI analysis
- Results appear below with detailed scoring and insights

### 5. Understanding Results
- **Overall Score**: 0-100% match score with color coding
- **Matching Skills**: Skills found in the CV that match job requirements
- **Missing Skills**: Required skills not found in the CV
- **Detailed Analysis**: Comprehensive AI-generated assessment
- **Ranking**: CVs automatically sorted by match score

## 🧪 Testing with Sample Data

The application includes sample data for immediate testing:

1. **Sample Job Description**: `sample_data/sample_job.json`
   - Senior Full Stack Developer position
   - 15 technical requirements including React, Node.js, AWS, Docker

2. **Sample CV**: `sample_data/sample_cv.txt`
   - Experienced developer profile
   - Matches many of the job requirements
   - Realistic work experience and skills

### Quick Test Workflow
1. Upload the sample job JSON file
2. Upload the sample CV text file
3. Select both and run analysis
4. Review the detailed results and scoring

## 🔗 API Endpoints

### Job Descriptions
- `GET /api/jobs` - List all job descriptions
- `POST /api/jobs` - Create new job description
- `POST /api/jobs/upload-json` - Upload job from JSON file

### CV Files
- `GET /api/cvs` - List all uploaded CVs
- `POST /api/cvs/upload` - Upload multiple CV files

### Analysis
- `POST /api/analyze` - Analyze CVs against job description
- `GET /api/analyses/{job_id}` - Get analysis results for a job

### System
- `GET /api/test` - Run comprehensive system test
- `GET /` - Health check endpoint

## 🏢 Database Schema

### job_descriptions
- `id` (Primary Key)
- `title` (Unique)
- `description` (Text)
- `requirements` (JSON Array)
- `created_at` (Timestamp)
- `active` (Boolean)

### cv_files
- `id` (Primary Key)
- `filename` (String)
- `content` (Extracted Text)
- `file_type` (String)
- `file_size` (Integer)
- `uploaded_at` (Timestamp)

### analysis_results
- `id` (Primary Key)
- `cv_id` (Foreign Key)
- `job_id` (Foreign Key)
- `overall_score` (Float 0-100)
- `matching_skills` (JSON Array)
- `missing_skills` (JSON Array)
- `summary` (Text)
- `detailed_analysis` (Text)
- `created_at` (Timestamp)

## 🔒 Error Handling

The application includes comprehensive error handling:

- **File Upload Errors**: Invalid file types, processing failures
- **API Errors**: Network issues, server errors
- **AI Analysis Errors**: Automatic fallback to mock data
- **Form Validation**: Required fields, unique constraints
- **Loading States**: Visual feedback during operations

## 🚀 Deployment

### Docker Deployment
1. Build the image: `docker build -t resumatch .`
2. Run with volume mounts for data persistence
3. Configure environment variables for production

### Manual Deployment
1. Set up Python environment with requirements
2. Build React frontend: `npm run build`
3. Configure web server (nginx/apache) to serve static files
4. Set up process manager (PM2/systemd) for backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the system test results for diagnostics
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check Docker logs for detailed error messages

## 🔮 Future Enhancements

- [ ] Support for more file formats (RTF, ODT)
- [ ] Advanced search and filtering
- [ ] User authentication and authorization
- [ ] Email notifications for analysis completion
- [ ] Export results to PDF/Excel
- [ ] Integration with popular ATS systems
- [ ] Advanced analytics and reporting dashboard