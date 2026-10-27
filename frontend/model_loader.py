from pathlib import Path
from huggingface_hub import hf_hub_download, snapshot_download
from config import *

class LocalModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
            cls._instance._llm = None
        return cls._instance

    def download_model(self, repo_id: str, filename: str):
        """ดาวน์โหลดโมเดลถ้ายังไม่มี"""
        MODEL_DIR.mkdir(exist_ok=True)
        local_path = MODEL_DIR / filename

        if local_path.exists():
            print(f"✅ พบโมเดลแล้ว: {local_path}")
            return str(local_path)

        print(f"📥 กำลังดาวน์โหลด: {filename} ...")
        try:
            path = hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                local_dir=MODEL_DIR,
                local_dir_use_symlinks=False
            )
            print(f"✅ ดาวน์โหลดเสร็จ: {path}")
            return path
        except Exception as e:
            print(f"❌ ดาวน์โหลดล้มเหลว: {e}")
            raise

    def load_model(self):
        """โหลดโมเดลเข้าหน่วยความจำ"""
        if self._loaded:
            return self._llm

        # ดาวน์โหลดถ้ายังไม่มี
        model_path = self.download_model(DEFAULT_MODEL_NAME, DEFAULT_MODEL_FILE)

        # นำเข้าเมื่อพร้อมแล้ว
        from llama_cpp import Llama

        print("🧠 กำลังโหลดโมเดลเข้าหน่วยความจำ...")
        self._llm = Llama(
            model_path=model_path,
            n_ctx=N_CTX,
            n_threads=N_THREADS,
            n_gpu_layers=0,  # ใช้ CPU บนมือถือ
            verbose=False
        )
        self._loaded = True
        print("✅ โมเดลพร้อมทำงาน!")
        return self._llm

    def generate(self, prompt: str, max_tokens: int = MAX_TOKENS):
        """ส่งคำถามและรับคำตอบ"""
        llm = self.load_model()

        # จัดรูปแบบข้อความตามที่โมเดลคาดหวัง
        messages = [
            {"role": "system", "content": "คุณคือ ZyntroAI ผู้ช่วยอัจฉริยะ พูดภาษาไทยได้ชัดเจน กระชับ และเป็นประโยชน์"},
            {"role": "user", "content": prompt}
        ]

        output = llm.create_chat_completion(
            messages=messages,
            max_tokens=max_tokens,
            temperature=TEMPERATURE,
            stop=["<|im_end|>", "\n\n\n"]
        )

        return output["choices"][0]["message"]["content"].strip()
