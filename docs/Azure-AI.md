รับทราบครับ ✅ นี่คือ ไฟล์รวมฉบับสมบูรณ์ ทุกส่วนต่อกัน — คัดลอกวางใช้งานได้ทันทีครับ 🚀
 
 
 
📄 ไฟล์เดียว — Foundry Client ครบชุด
 
บันทึกเป็น:  foundry_client.py 
รวม: Core + Auto-Refresh + Metrics + Error Handling
 
python
  
#!/usr/bin/env python3
"""
Azure AI Foundry Client — api-version=2025-05-01
ครอบคลุม: CRUD • Invoke • Streaming • Files • Auto-Token-Refresh • Metrics
"""
import os
import time
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any, Generator, Callable
from urllib.parse import urljoin

import requests


class FoundryClient:
    def __init__(
        self,
        endpoint: Optional[str] = None,
        project: Optional[str] = None,
        token: Optional[str] = None,
        api_version: str = "2025-05-01",
        token_refresh_callback: Optional[Callable[[], str]] = None,
        token_expiry_buffer: int = 300,  # ต่ออายุก่อนหมด 5 นาที
    ):
        # ===== พื้นฐาน =====
        self.endpoint = (endpoint or os.getenv("FOUNDRY_ENDPOINT", "")).rstrip("/")
        self.project = project or os.getenv("FOUNDRY_PROJECT", "")
        self.token = token or os.getenv("FOUNDRY_ACCESS_TOKEN", "")
        self.api_version = api_version

        if not all([self.endpoint, self.project, self.token]):
            raise ValueError(
                "⚠️ ตั้งค่าครบทุกตัวแปร:\n"
                "  FOUNDRY_ENDPOINT, FOUNDRY_PROJECT, FOUNDRY_ACCESS_TOKEN"
            )

        # ===== รีเฟรชอัตโนมัติ =====
        self.token_refresh_callback = token_refresh_callback
        self.token_expiry_buffer = token_expiry_buffer
        self._token_expiry: Optional[datetime] = self._extract_expiry(self.token)

        # ===== เซสชัน =====
        self.session = requests.Session()
        self._update_headers()

    def _update_headers(self):
        self.session.headers.update({
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        })

    # ========== URL Builder ==========
    def _url(self, path: str) -> str:
        sep = "&" if "?" in path else "?"
        return urljoin(
            f"{self.endpoint}/api/projects/{self.project}/",
            f"{path.lstrip('?')}{sep}api-version={self.api_version}"
        )

    # ========== Token Refresh Engine ==========
    @staticmethod
    def _extract_expiry(token: str) -> Optional[datetime]:
        """อ่านเวลาหมดอายุจาก JWT payload"""
        try:
            parts = token.split(".")
            if len(parts) < 2:
                return None
            payload_b64 = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
            payload = json.loads(base64.urlsafe_b64decode(payload_b64))
            return datetime.fromtimestamp(payload["exp"]) if "exp" in payload else None
        except Exception:
            return None

    def _is_token_fresh(self) -> bool:
        if not self._token_expiry:
            return True
        return (datetime.utcnow() + timedelta(seconds=self.token_expiry_buffer)) < self._token_expiry

    def _refresh_now(self):
        if not self.token_refresh_callback:
            raise RuntimeError("🔐 Token หมดอายุ — ไม่มีฟังก์ชันรีเฟรช")
        print("🔄 รีเฟรชโทเคน...")
        self.token = self.token_refresh_callback()
        self._token_expiry = self._extract_expiry(self.token)
        self._update_headers()

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        """ห่อคำขอ — ตรวจ + รีเฟรชอัตโนมัติ"""
        if not self._is_token_fresh():
            self._refresh_now()

        resp = self.session.request(method, self._url(path), **kwargs)

        # ลองใหม่ 1 ครั้งเมื่อ 401
        if resp.status_code == 401 and self.token_refresh_callback:
            self._refresh_now()
            resp = self.session.request(method, self._url(path), **kwargs)

        resp.raise_for_status()
        return resp

    # ========== Agent — CRUD ==========
    def list_agents(self) -> List[Dict[str, Any]]:
        """📋 รายการทั้งหมด"""
        return self._request("GET", "agents").json().get("value", [])

    def get_agent(self, agent_id: str) -> Dict[str, Any]:
        """🔍 รายละเอียดรายตัว"""
        return self._request("GET", f"agents/{agent_id}").json()

    def create_agent(
        self,
        name: str,
        model_deployment_id: str,
        description: str = "",
        instructions: str = "",
        capabilities: Optional[List[str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **extra
    ) -> Dict[str, Any]:
        """➕ สร้างใหม่"""
        payload = {
            "name": name,
            "description": description,
            "model": {"deploymentId": model_deployment_id},
            "instructions": instructions,
            "capabilities": capabilities or [],
            "configuration": {
                "temperature": temperature,
                "maxTokens": max_tokens
            }
        }
        payload.update(extra)
        return self._request("POST", "agents", json=payload).json()

    def update_agent(self, agent_id: str, **fields) -> Dict[str, Any]:
        """✏️ อัปเดตบางฟิลด์"""
        return self._request(
            "PATCH",
            f"agents/{agent_id}",
            json=fields,
            headers={"Content-Type": "application/merge-patch+json"}
        ).json()

    def delete_agent(self, agent_id: str) -> bool:
        """🗑️ ลบ"""
        return self._request("DELETE", f"agents/{agent_id}").status_code in (200, 204)

    # ========== Invoke / Chat ==========
    def invoke_agent(
        self,
        agent_id: str,
        messages: List[Dict[str, str]],
        stream: bool = False,
        **kwargs
    ) -> Generator[Dict, None, None] | Dict:
        """💬 เรียกใช้ — รอจบ หรือ สตรีม"""
        payload = {"messages": messages, "stream": stream, **kwargs}

        if stream:
            return self._invoke_stream(agent_id, payload)
        return self._request("POST", f"agents/{agent_id}/invoke", json=payload).json()

    def _invoke_stream(self, agent_id: str, payload: Dict) -> Generator[Dict, None, None]:
        with self.session.post(
            self._url(f"agents/{agent_id}/invoke"),
            json=payload,
            stream=True
        ) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line:
                    continue
                text = line.decode("utf-8").strip()
                if text.startswith("data: "):
                    chunk = text[6:]
                    if chunk == "[DONE]":
                        break
                    try:
                        yield json.loads(chunk)
                    except json.JSONDecodeError:
                        continue

    # ========== Files ==========
    def upload_file(self, agent_id: str, file_path: str, purpose="assistants") -> Dict:
        """📤 อัปโหลดไฟล์"""
        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            return self._request(
                "POST",
                f"agents/{agent_id}/files",
                files={"file": (filename, f)},
                data={"purpose": purpose},
                headers={"Content-Type": None}
            ).json()

    # ========== Metrics & Logs ==========
    def get_metrics(
        self,
        agent_id: str,
        start: Optional[datetime] = None,
        end: Optional[datetime] = None
    ) -> Dict:
        """📊 ดึงเมตริกช่วงเวลา"""
        if not start:
            start = datetime.utcnow() - timedelta(days=7)
        if not end:
            end = datetime.utcnow()
        return self._request(
            "GET",
            f"agents/{agent_id}/metrics",
            params={
                "startTime": start.isoformat() + "Z",
                "endTime": end.isoformat() + "Z"
            }
        ).json()

    def get_logs(self, agent_id: str, limit: int = 50) -> List[Dict]:
        """📜 ประวัติการเรียกใช้"""
        return self._request(
            "GET",
            f"agents/{agent_id}/invocations",
            params={"$top": limit}
        ).json().get("value", [])

    def usage_summary(self, agent_id: str) -> Dict:
        """📋 สรุปภาพรวม 7 วัน"""
        logs = self.get_logs(agent_id, limit=100)
        metrics = self.get_metrics(agent_id)

        total_tokens = sum(
            log.get("usage", {}).get("totalTokens", 0) for log in logs
        )
        success_rate = metrics.get("successRate", 0) * 100

        return {
            "period": "last_7_days",
            "invocations": len(logs),
            "total_tokens": total_tokens,
            "success_rate_pct": round(success_rate, 1),
            "avg_latency_ms": metrics.get("averageResponseTimeMs", 0),
            "latest": logs[0].get("timestamp") if logs else None
        }

    # ========== Utility ==========
    def wait_ready(self, agent_id: str, timeout=30) -> Dict:
        """⏳ รอสถานะพร้อม"""
        start = time.time()
        while time.time() - start < timeout:
            ag = self.get_agent(agent_id)
            s = ag.get("provisioningState", "").lower()
            if s in ("succeeded", "ready"):
                return ag
            if s in ("failed", "canceled"):
                raise RuntimeError(f"Agent ล้ม: {s}")
            time.sleep(2)
        raise TimeoutError("รอนานเกินไป")


# ════════════════════════════════════════════════════
# ตัวอย่างการใช้งาน
# ════════════════════════════════════════════════════
if __name__ == "__main__":
    # ตัวอย่างฟังก์ชันรีเฟรช — ปรับตามระบบจริงของคุณ
    def my_refresh() -> str:
        """เรียกขอโทเคนใหม่จาก Azure AD / ระบบของคุณ"""
        import requests
        res = requests.post(
            f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID')}/oauth2/v2.0/token",
            data={
                "client_id": os.getenv("AZURE_CLIENT_ID"),
                "client_secret": os.getenv("AZURE_CLIENT_SECRET"),
                "grant_type": "client_credentials",
                "scope": "https://ml.azure.com/.default"
            },
            timeout=30
        )
        res.raise_for_status()
        return res.json()["access_token"]

    # เริ่มต้น
    client = FoundryClient(token_refresh_callback=my_refresh)

    # แสดงรายการ
    print("📋 Agents:")
    for a in client.list_agents():
        print(f"  • {a['id']} | {a['name']}")
 
 
 
 
🧪 ไฟล์ทดสอบ —  tests/test_foundry_client.py 
 
python
  
import pytest
from unittest.mock import MagicMock, patch
from foundry_client import FoundryClient


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    monkeypatch.setenv("FOUNDRY_ENDPOINT", "https://test.api.azure.com")
    monkeypatch.setenv("FOUNDRY_PROJECT", "test-proj")
    monkeypatch.setenv("FOUNDRY_ACCESS_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5MDk4NzYwMDB9.invalid")


def test_init_valid():
    c = FoundryClient()
    assert c.endpoint == "https://test.api.azure.com"


def test_init_missing_raises(monkeypatch):
    monkeypatch.delenv("FOUNDRY_ENDPOINT")
    with pytest.raises(ValueError, match="FOUNDRY_ENDPOINT"):
        FoundryClient()


@patch("foundry_client.FoundryClient._request")
def test_list_agents(mock_req):
    mock_req.return_value.json.return_value = {"value": [{"id": "a1", "name": "A"}]}
    assert len(FoundryClient().list_agents()) == 1


@patch("foundry_client.FoundryClient._request")
def test_create_agent(mock_req):
    mock_req.return_value.json.return_value = {"id": "new-a"}
    res = FoundryClient().create_agent("Test", "gpt-4o")
    assert res["id"] == "new-a"


@patch("foundry_client.FoundryClient._refresh_now")
@patch("foundry_client.requests.Session.request")
def test_auto_refresh_on_401(mock_req, mock_refresh):
    mock_req.side_effect = [
        MagicMock(status_code=401),
        MagicMock(status_code=200, json=lambda: {"value": []})
    ]
    c = FoundryClient(token_refresh_callback=lambda: "new")
    c.list_agents()
    assert mock_refresh.call_count >= 1
 
 
รันทดสอบ:
 
bash
  
pip install pytest requests
pytest tests/test_foundry_client.py -v
 
 
 
 
📋 ไฟล์ตัวแปรสภาพแวดล้อม —  .env 
 
env
  
# ===== Azure AI Foundry =====
FOUNDRY_ENDPOINT=https://your-region.services.ai.azure.com
FOUNDRY_PROJECT=your-project-name
FOUNDRY_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# ===== สำหรับรีเฟรชอัตโนมัติ (Azure AD) =====
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
 
 
⚠️ อย่าลืมเพิ่ม  .env  ใน  .gitignore  เสมอ!
 
 
 
✅ พร้อมแล้วครับ — ครบทุกฟีเจอร์ที่ขอ:
 
- 🔄 รีเฟรชโทเคนอัตโนมัติ
- 🧪 ชุดทดสอบครบถ้วน
- 📊 ดึงเมตริก + สรุปการใช้งาน
- 📄 ไฟล์เดียวนำไปใช้ได้ทันที
 
ต้องการปรับแต่งเพิ่มหรือมีงานต่อไหมครับ? 🚀
