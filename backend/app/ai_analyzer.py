import google.generativeai as genai
import json
import re
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class AIAnalyzer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "models/gemini-1.5-flash"
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
            
            if not all([score_match, summary_match, matching_match, missing_match, detailed_match]):
                raise ValueError("Incomplete or malformed response from Gemini")
            
            # Parse score
            overall_score = float(score_match.group(1))
            if not 0 <= overall_score <= 100:
                raise ValueError("Score must be between 0 and 100")
            
            # Parse summary
            summary = summary_match.group(1).strip()
            if not summary:
                raise ValueError("Summary cannot be empty")
            
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
            detailed_analysis = detailed_match.group(1).strip()
            if not detailed_analysis:
                raise ValueError("Detailed analysis cannot be empty")
            
            return {
                "overall_score": overall_score,
                "summary": summary,
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "detailed_analysis": detailed_analysis
            }
        
        except Exception as e:
            raise ValueError(f"Failed to parse Gemini response: {str(e)}")
    
    async def analyze_cv(self, job_description: str, job_requirements: List[str], cv_content: str) -> Dict:
        """Analyze CV against job description using Gemini AI"""
        
        if not self.is_configured:
            raise RuntimeError("Gemini API is not configured. Please provide a valid API key.")
        
        try:
            # Create model instance with full model name
            model = genai.GenerativeModel('models/gemini-1.5-flash')
            
            # Generate prompt
            prompt = self._create_analysis_prompt(job_description, job_requirements, cv_content)
            
            # Get response from Gemini
            response = model.generate_content(prompt)
            
            if not response or not response.text:
                raise RuntimeError("Empty response received from Gemini API")
            
            return self._parse_gemini_response(response.text)
                
        except Exception as e:
            if "quota exceeded" in str(e).lower():
                raise RuntimeError("Gemini API quota exceeded. Please try again later.")
            elif "rate limit" in str(e).lower():
                raise RuntimeError("Gemini API rate limit reached. Please try again in a few minutes.")
            elif "invalid api key" in str(e).lower():
                raise RuntimeError("Invalid Gemini API key. Please check your configuration.")
            elif "not found" in str(e).lower() or "not supported" in str(e).lower():
                raise RuntimeError(f"Model {self.model_name} is not available. Please check your model configuration.")
            else:
                raise RuntimeError(f"Error calling Gemini API: {str(e)}")
    
    async def analyze_multiple_cvs(self, job_description: str, job_requirements: List[str], cv_data: List[Dict]) -> List[Dict]:
        """Analyze multiple CVs against a job description"""
        results = []
        errors = []
        
        for cv in cv_data:
            try:
                analysis = await self.analyze_cv(job_description, job_requirements, cv['content'])
                analysis['cv_id'] = cv['id']
                analysis['cv_filename'] = cv['filename']
                analysis['error'] = None
                results.append(analysis)
            except Exception as e:
                error_result = {
                    'cv_id': cv['id'],
                    'cv_filename': cv['filename'],
                    'error': str(e),
                    'overall_score': 0,
                    'summary': f"Error analyzing CV: {str(e)}",
                    'matching_skills': [],
                    'missing_skills': [],
                    'detailed_analysis': "Analysis failed due to an error with the AI service."
                }
                results.append(error_result)
                errors.append(str(e))
        
        if len(errors) == len(cv_data):
            # If all CVs failed, raise an error
            raise RuntimeError(f"Failed to analyze all CVs. First error: {errors[0]}")
        
        # Sort by score (highest first)
        results.sort(key=lambda x: x['overall_score'], reverse=True)
        return results