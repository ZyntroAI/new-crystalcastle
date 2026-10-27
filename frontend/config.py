import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

# === AI Settings ===
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

# เลือกโมเดลขนาดเล็ก เหมาะกับมือถือ
DEFAULT_MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct-GGUF"
DEFAULT_MODEL_FILE = "qwen2.5-0.5b-instruct-q4_k_m.gguf"
MODEL_PATH = MODEL_DIR / DEFAULT_MODEL_FILE

# ขีดจำกัดทรัพยากร
MAX_TOKENS = 512
TEMPERATURE = 0.7
N_CTX = 2048       # หน่วยความจำบริบท
N_THREADS = 2      # ใช้ 2 แกนประมวลผล (ปรับตามเครื่อง)

# === Server ===
HOST = "0.0.0.0"
PORT = 8000
