#!/usr/bin/env python
"""
LLMediCare Model Downloader

This script automates the download of the Llama 2 model required for the LLMediCare application.
It uses the Hugging Face Hub API to download the model and provides progress tracking.
"""

import os
import sys
import hashlib
import argparse
from pathlib import Path
import logging
import shutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Constants
MODEL_REPO = "TheBloke/Llama-2-7B-Chat-GGUF"
MODEL_FILENAME = "llama-2-7b-chat.gguf"
MODEL_SIZE_GB = 4.0  # Approximate size in GB


def check_disk_space(path, required_gb=5.0):
    """Check if there's enough disk space available."""
    try:
        total, used, free = shutil.disk_usage(path)
        free_gb = free / (1024 ** 3)  # Convert bytes to GB
        
        if free_gb < required_gb:
            logger.error(f"Insufficient disk space. Required: {required_gb}GB, Available: {free_gb:.2f}GB")
            return False
        
        logger.info(f"Disk space check passed. Available: {free_gb:.2f}GB")
        return True
    except Exception as e:
        logger.error(f"Error checking disk space: {e}")
        return False


def check_ram():
    """Check if there's enough RAM available."""
    try:
        import psutil
        total_ram = psutil.virtual_memory().total / (1024 ** 3)  # GB
        
        if total_ram < 16:
            logger.warning(f"Low RAM detected: {total_ram:.2f}GB. Minimum 16GB recommended.")
            return False
        
        logger.info(f"RAM check passed. Available: {total_ram:.2f}GB")
        return True
    except ImportError:
        logger.warning("psutil not installed. Skipping RAM check.")
        return True
    except Exception as e:
        logger.error(f"Error checking RAM: {e}")
        return True  # Continue anyway


def download_model(output_dir, force=False):
    """Download the model from Hugging Face."""
    try:
        from huggingface_hub import hf_hub_download, HfApi
        
        output_path = os.path.join(output_dir, MODEL_FILENAME)
        
        # Check if model already exists
        if os.path.exists(output_path) and not force:
            logger.info(f"Model already exists at {output_path}")
            logger.info("Use --force to re-download")
            return output_path
        
        # Check available model files
        api = HfApi()
        files = api.list_repo_files(MODEL_REPO)
        
        if MODEL_FILENAME not in files:
            logger.error(f"Model file {MODEL_FILENAME} not found in repository {MODEL_REPO}")
            logger.info(f"Available files: {[f for f in files if f.endswith('.gguf')]}")
            return None
        
        logger.info(f"Downloading {MODEL_FILENAME} from {MODEL_REPO}...")
        logger.info(f"This is a large file (~{MODEL_SIZE_GB}GB) and may take some time to download")
        
        # Download with progress tracking
        output_path = hf_hub_download(
            repo_id=MODEL_REPO,
            filename=MODEL_FILENAME,
            local_dir=output_dir,
            local_dir_use_symlinks=False,
            resume_download=True,
        )
        
        logger.info(f"Model downloaded successfully to {output_path}")
        return output_path
    
    except ImportError:
        logger.error("huggingface_hub package not installed. Please install it with:")
        logger.error("pip install huggingface-hub")
        return None
    except Exception as e:
        logger.error(f"Error downloading model: {e}")
        return None


def verify_model(model_path):
    """Verify the model file exists and has a reasonable size."""
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at {model_path}")
        return False
    
    # Check file size (should be several GB)
    file_size_gb = os.path.getsize(model_path) / (1024 ** 3)
    if file_size_gb < 3.0:  # Llama 2 7B should be at least 3GB
        logger.warning(f"Model file size ({file_size_gb:.2f}GB) seems too small. File may be corrupted.")
        return False
    
    logger.info(f"Model verification passed. File size: {file_size_gb:.2f}GB")
    return True


def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Download Llama 2 model for LLMediCare")
    parser.add_argument("--force", action="store_true", help="Force re-download even if model exists")
    parser.add_argument("--skip-checks", action="store_true", help="Skip system requirement checks")
    args = parser.parse_args()
    
    # Get the project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, "models")
    
    # Create models directory if it doesn't exist
    os.makedirs(models_dir, exist_ok=True)
    
    # System checks
    if not args.skip_checks:
        if not check_disk_space(models_dir):
            logger.warning("Disk space check failed. Use --skip-checks to bypass.")
            if not input("Continue anyway? (y/n): ").lower().startswith('y'):
                return 1
        
        check_ram()  # Just a warning, don't block on this
    
    # Download the model
    model_path = download_model(models_dir, force=args.force)
    if not model_path:
        return 1
    
    # Verify the downloaded model
    if not verify_model(model_path):
        logger.error("Model verification failed. The downloaded file may be corrupted.")
        return 1
    
    # Success
    logger.info("="*50)
    logger.info("Model download and verification completed successfully!")
    logger.info(f"Model path: {model_path}")
    logger.info("")
    logger.info("You can now start the LLMediCare backend server.")
    logger.info("="*50)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())