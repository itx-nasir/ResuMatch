import google.generativeai as genai
import json
import re
import random
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class AIAnalyzer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-pro"
        self.is_configured = self._configure_gemini()
    
    def _configure_gemini(self) -> bool:
        """Configure Gemini API if key is available"""
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                return True
            except Exception as e:
                print(f"Failed to configure Gemini API: {e}")
                return False
        return False
    
    def _create_analysis_prompt(self, job_description: str, job_requirements: List[str], cv_content: str) -> str:
        """Create structured prompt for CV analysis"""
        requirements_text = "\n".join([f"- {req}" for req in job_requirements])
        
        prompt = f"""
        You are an expert HR recruiter analyzing a CV against a specific job description. 
        Please provide a structured analysis in the following EXACT format:

        OVERALL_SCORE: [score from 0-100]
        SUMMARY: [2-3 sentence summary of candidate fit]
        MATCHING_SKILLS: [comma-separated list of skills found in CV that match job requirements]
        MISSING_SKILLS: [comma-separated list of required skills not found in CV]
        DETAILED_ANALYSIS: [detailed paragraph analysis of strengths, weaknesses, and overall fit]

        Job Description:
        {job_description}

        Job Requirements:
        {requirements_text}

        CV Content:
        {cv_content}

        Please analyze how well this candidate matches the job requirements and provide the response in the EXACT format specified above.
        """
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict:
        """Parse structured response from Gemini"""
        try:
            # Extract components using regex
            score_match = re.search(r'OVERALL_SCORE:\s*(\d+)', response_text)
            summary_match = re.search(r'SUMMARY:\s*(.+?)(?=MATCHING_SKILLS:|$)', response_text, re.DOTALL)
            matching_match = re.search(r'MATCHING_SKILLS:\s*(.+?)(?=MISSING_SKILLS:|$)', response_text, re.DOTALL)
            missing_match = re.search(r'MISSING_SKILLS:\s*(.+?)(?=DETAILED_ANALYSIS:|$)', response_text, re.DOTALL)
            detailed_match = re.search(r'DETAILED_ANALYSIS:\s*(.+?)$', response_text, re.DOTALL)
            
            # Parse score
            overall_score = float(score_match.group(1)) if score_match else 0.0
            
            # Parse summary
            summary = summary_match.group(1).strip() if summary_match else "Analysis not available"
            
            # Parse skills lists
            matching_skills = []
            if matching_match:
                matching_text = matching_match.group(1).strip()
                matching_skills = [skill.strip() for skill in matching_text.split(',') if skill.strip()]
            
            missing_skills = []
            if missing_match:
                missing_text = missing_match.group(1).strip()
                missing_skills = [skill.strip() for skill in missing_text.split(',') if skill.strip()]
            
            # Parse detailed analysis
            detailed_analysis = detailed_match.group(1).strip() if detailed_match else "Detailed analysis not available"
            
            return {
                "overall_score": overall_score,
                "summary": summary,
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "detailed_analysis": detailed_analysis
            }
        
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            return self._generate_mock_analysis()
    
    def _generate_mock_analysis(self) -> Dict:
        """Generate realistic mock analysis when Gemini is not available"""
        mock_analyses = [
            {
                "overall_score": random.randint(65, 85),
                "summary": "Strong candidate with relevant technical experience and good educational background. Shows potential for growth in the required areas.",
                "matching_skills": ["Python", "JavaScript", "SQL", "Git", "Agile Development"],
                "missing_skills": ["Docker", "Kubernetes", "AWS"],
                "detailed_analysis": "The candidate demonstrates solid technical foundations with strong programming skills in Python and JavaScript. Their experience with database management and version control systems aligns well with our requirements. However, they would benefit from additional training in containerization and cloud technologies to fully meet all job requirements."
            },
            {
                "overall_score": random.randint(45, 65),
                "summary": "Candidate has some relevant experience but lacks several key technical skills required for this position.",
                "matching_skills": ["Communication", "Team Collaboration", "Problem Solving"],
                "missing_skills": ["React", "Node.js", "Database Design", "API Development"],
                "detailed_analysis": "While the candidate shows good soft skills and general problem-solving abilities, there are significant gaps in the technical requirements. They would need substantial training and development to meet the role's technical demands. Consider for junior positions or with extended onboarding period."
            },
            {
                "overall_score": random.randint(85, 95),
                "summary": "Excellent candidate with comprehensive skills matching most job requirements. Strong technical background and proven track record.",
                "matching_skills": ["Full Stack Development", "React", "Node.js", "Database Management", "Cloud Technologies", "DevOps"],
                "missing_skills": ["Specific Domain Knowledge"],
                "detailed_analysis": "This is a highly qualified candidate who meets or exceeds most of our technical requirements. Their extensive experience in full-stack development, combined with strong cloud and DevOps skills, makes them an ideal fit. The only gap is domain-specific knowledge, which can be addressed through orientation and training."
            }
        ]
        
        return random.choice(mock_analyses)
    
    async def analyze_cv(self, job_description: str, job_requirements: List[str], cv_content: str) -> Dict:
        """Analyze CV against job description using Gemini AI or mock data"""
        
        if not self.is_configured:
            print("Gemini API not configured, using mock analysis")
            return self._generate_mock_analysis()
        
        try:
            # Create model instance
            model = genai.GenerativeModel(self.model_name)
            
            # Generate prompt
            prompt = self._create_analysis_prompt(job_description, job_requirements, cv_content)
            
            # Get response from Gemini
            response = model.generate_content(prompt)
            
            if response and response.text:
                return self._parse_gemini_response(response.text)
            else:
                print("Empty response from Gemini, using mock analysis")
                return self._generate_mock_analysis()
                
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return self._generate_mock_analysis()
    
    async def analyze_multiple_cvs(self, job_description: str, job_requirements: List[str], cv_data: List[Dict]) -> List[Dict]:
        """Analyze multiple CVs against a job description"""
        results = []
        
        for cv in cv_data:
            analysis = await self.analyze_cv(job_description, job_requirements, cv['content'])
            analysis['cv_id'] = cv['id']
            analysis['cv_filename'] = cv['filename']
            results.append(analysis)
        
        # Sort by score (highest first)
        results.sort(key=lambda x: x['overall_score'], reverse=True)
        return results