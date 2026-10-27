from model_loader import LocalModelLoader
from pydantic import BaseModel

class AgentRequest(BaseModel):
    message: str
    mode: str = "chat"  # chat / task / analyze

class ZyntroMobileAgent:
    def __init__(self):
        self.loader = LocalModelLoader()
        self.name = "Zyntro-Mobile"
        self.status = "idle"

    def ask(self, user_input: str, mode: str = "chat"):
        """รับคำสั่งและประมวลผล"""
        self.status = "thinking"

        # ปรับคำสั่งตามโหมด
        if mode == "task":
            prompt = f"ช่วยวิเคราะห์และเสนอแนวทางปฏิบัติ: {user_input}"
        elif mode == "analyze":
            prompt = f"วิเคราะห์ข้อมูลนี้โดยละเอียด: {user_input}"
        else:
            prompt = user_input

        try:
            response = self.loader.generate(prompt)
            self.status = "idle"
            return {
                "agent": self.name,
                "response": response,
                "status": "success",
                "mode": mode
            }
        except Exception as e:
            self.status = "error"
            return {
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }

    def status_check(self):
        return {
            "name": self.name,
            "status": self.status,
            "model_loaded": self.loader._loaded
        }
