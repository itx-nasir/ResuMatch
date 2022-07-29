import PyPDF2
import docx
import io
import tempfile
import os
from typing import Tuple, Optional

class FileProcessor:
    
    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            # Create a temporary file to work with python-docx
            with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp_file:
                tmp_file.write(file_content)
                tmp_file.flush()
                
                doc = docx.Document(tmp_file.name)
                text = ""
                
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                
                # Clean up temporary file
                os.unlink(tmp_file.name)
                
                return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
    
    @staticmethod
    def extract_text_from_doc(file_content: bytes) -> str:
        """Extract text from DOC file (legacy format)"""
        # For DOC files, we'll attempt to read as plain text
        # In a production environment, you might want to use python-docx2txt or similar
        try:
            text = file_content.decode('utf-8', errors='ignore')
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOC: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_content: bytes) -> str:
        """Extract text from TXT file"""
        try:
            text = file_content.decode('utf-8')
            return text.strip()
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                text = file_content.decode('latin-1')
                return text.strip()
            except Exception as e:
                raise ValueError(f"Failed to extract text from TXT: {str(e)}")
    
    @staticmethod
    def process_file(filename: str, file_content: bytes) -> Tuple[str, str]:
        """
        Process uploaded file and extract text content
        Returns: (extracted_text, file_type)
        """
        # Determine file type from extension
        file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
        
        if file_extension == 'pdf':
            text = FileProcessor.extract_text_from_pdf(file_content)
            return text, 'pdf'
        elif file_extension == 'docx':
            text = FileProcessor.extract_text_from_docx(file_content)
            return text, 'docx'
        elif file_extension == 'doc':
            text = FileProcessor.extract_text_from_doc(file_content)
            return text, 'doc'
        elif file_extension == 'txt':
            text = FileProcessor.extract_text_from_txt(file_content)
            return text, 'txt'
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
    
    @staticmethod
    def validate_file_type(filename: str) -> bool:
        """Validate if file type is supported"""
        supported_extensions = {'pdf', 'docx', 'doc', 'txt'}
        file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
        return file_extension in supported_extensions