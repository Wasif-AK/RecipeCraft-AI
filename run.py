# run.py

import sys
import subprocess

REQUIRED_PACKAGES = [
    "fastapi",
    "uvicorn",
    "httpx",
    "python-multipart",
    "python-dotenv"
]

def check_and_install_dependencies():
    print("Checking dependencies...")
    try:
        import fastapi
        import uvicorn
        import httpx
        import multipart
        import dotenv
        print("All dependencies are already installed.")
    except ImportError:
        print("Some dependencies are missing. Installing required packages...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", *REQUIRED_PACKAGES])
            print("Successfully installed all dependencies.")
        except subprocess.CalledProcessError as e:
            print(f"Error occurred while installing dependencies: {e}")
            sys.exit(1)

def start_server():
    print("Starting RecipeCraft AI server...")
    try:
        import uvicorn
        uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\nStopping RecipeCraft AI server.")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    check_and_install_dependencies()
    start_server()
