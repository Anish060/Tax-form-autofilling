import os
from typing import List

def create_project_structure(paths: List[str]):
    """
    Creates the specified directories and empty files for the project structure.

    Args:
        paths: A list of file and directory paths to create.
    """
    print("--- Starting Project Structure Creation ---")
    
    # 1. Define the full list of files and directories based on the image
    structure = [
        "backend", # Main directory
        "backend/package.json",
        "backend/.env.example",
        
        # Source (src) files and subdirectories
        "backend/src", 
        "backend/src/index.js",
        
        "backend/src/config",
        "backend/src/config/db.js",
        
        "backend/src/models",
        "backend/src/models/index.js",
        "backend/src/models/User.js",
        "backend/src/models/Document.js",
        "backend/src/models/TaxReturn.js",
        
        "backend/src/routes",
        "backend/src/routes/auth.js",
        "backend/src/routes/upload.js",
        "backend/src/routes/extraction.js",
        "backend/src/routes/tax.js",
        
        "backend/src/services",
        "backend/src/services/ocrService.js",
        "backend/src/services/GeminiService.js",
        
        "backend/src/utils",
        "backend/src/utils/pdfGenerator.js",
        
        # Migrations directory and file
        "backend/migrations",
        "backend/migrations/init.sql",
    ]

    for path in structure:
        # Check if the path is intended to be a file (e.g., has an extension or known file name)
        # We assume any path that is not an explicitly defined directory (like 'backend/src')
        # should be a file, and its parent directories should be created first.
        
        # Determine if the path is a file or a directory by checking the file extension
        is_file = '.' in os.path.basename(path) or path.endswith('.example')
        
        if is_file:
            # For files, ensure the parent directory exists first
            parent_dir = os.path.dirname(path)
            if parent_dir and not os.path.exists(parent_dir):
                os.makedirs(parent_dir, exist_ok=True)
                print(f"Created directory: {parent_dir}")
                
            # Create the file (touch equivalent)
            try:
                with open(path, 'w') as f:
                    # Write a minimal comment/content for clarity, especially in JS/SQL files
                    if path.endswith('.js'):
                        f.write('// Auto-generated file\n')
                    elif path.endswith('.sql'):
                        f.write('-- Auto-generated SQL file\n')
                    elif path.endswith('.json'):
                        f.write('{\n  "name": "backend-project",\n  "version": "1.0.0"\n}\n')
                    elif path.endswith('.example'):
                        f.write('DATABASE_URL=...\nGEMINI_API_KEY=...\n')
                print(f"Created file: {path}")
            except IOError as e:
                print(f"Error creating file {path}: {e}")
                
        else:
            # For directories, create them directly
            if not os.path.exists(path):
                os.makedirs(path, exist_ok=True)
                print(f"Created directory: {path}")
            else:
                # If it already exists, just confirm
                print(f"Directory already exists: {path}")

    print("--- Structure Creation Complete ---")

# Run the function with the defined structure paths
if __name__ == "__main__":
    # The structure list is defined inside the function for encapsulation, but 
    # we can pass it as an argument if it were external. 
    # Calling the function directly here will use the internal structure list.
    create_project_structure([]) 
