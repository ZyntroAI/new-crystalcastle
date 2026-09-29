ได้เลยครับ! นี่คือ ชุดโค้ดสมบูรณ์ — ขยายจากตัวอย่างพื้นฐาน → ครบทุกการทำงาน พร้อมนำไปใช้จริงครับ 🚀🔐
 
 
 
🧠 Azure AI Foundry — API Client Complete
 
เวอร์ชัน: api-version=2025-05-01
ภาษา: cURL • Python • TypeScript
ฟีเจอร์: CRUD Agent • เรียกใช้ • ตรวจสอบสถานะ • จัดการไฟล์ • Error Handling
 
 
 
📋 สารบัญ
 
- 1. กำหนดค่าพื้นฐาน
- 2. cURL — ครบทุกคำสั่ง
- 3. Python Client — พร้อมใช้
- 4. TypeScript Client
- 5. ตัวอย่างการใช้งาน
- 6. โครงสร้าง Response
 
 
 
1. กำหนดค่าพื้นฐาน
 
bash
  
# ===== ตั้งค่าสภาพแวดล้อม =====
export FOUNDRY_ENDPOINT="https://<ชื่อพื้นที่>.services.ai.azure.com"
export FOUNDRY_PROJECT="ชื่อโปรเจกต์ของคุณ"
export FOUNDRY_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
export FOUNDRY_API_VERSION="2025-05-01"
 
 
ตัวแปร คำอธิบาย ตัวอย่าง 
 FOUNDRY_ENDPOINT  ที่อยู่บริการ  https://my-eastus.api.azure.com  
 FOUNDRY_PROJECT  ชื่อ/รหัสโปรเจกต์  zyntroai-main-2026  
 FOUNDRY_ACCESS_TOKEN  โทเคนเข้าถึง ผ่านพอร์ทัลหรือ Azure AD 
 FOUNDRY_API_VERSION  เวอร์ชัน API  2025-05-01  
 
 
 
2. cURL — ครบทุกคำสั่ง
 
2.1 📋 รายการทั้งหมด
 
bash
  
curl "${FOUNDRY_ENDPOINT}/api/projects/${FOUNDRY_PROJECT}/agents?api-version=${FOUNDRY_API_VERSION}" \
  -H "Authorization: Bearer ${FOUNDRY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
 
 
2.2 🔍 ดูรายละเอียดรายตัว
 
bash
  
AGENT_ID="agent-001"

curl "${FOUNDRY_ENDPOINT}/api/projects/${FOUNDRY_PROJECT}/agents/${AGENT_ID}?api-version=${FOUNDRY_API_VERSION}" \
  -H "Authorization: Bearer ${FOUNDRY_ACCESS_TOKEN}" \
  -H "Accept: application/json"
 
 
2.3 ➕ สร้างใหม่
 
bash
  
curl -X POST "${FOUNDRY_ENDPOINT}/api/projects/${FOUNDRY_PROJECT}/agents?api-version=${FOUNDRY_API_VERSION}" \
  -H "Authorization: Bearer ${FOUNDRY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "zyntro-assistant",
    "description": "ผู้ช่วยอัจฉริยะสำหรับทีมพัฒนา ZyntroAI",
    "model": {
      "deploymentId": "gpt-4o"
    },
    "instructions": "คุณเป็นผู้ช่วยที่ช่วยแก้ปัญหาด้านเทคนิค...",
    "capabilities": ["code_interpreter", "file_search"],
    "configuration": {
      "temperature": 0.7,
      "maxTokens": 4096
    }
  }'
 
 
2.4 ✏️ อัปเดต
 
bash
  
curl -X PATCH "${FOUNDRY_ENDPOINT}/api/projects/${FOUNDRY_PROJECT}/agents/${AGENT_ID}?api-version=${FOUNDRY_API_VERSION}" \
  -H "Authorization: Bearer ${FOUNDRY_ACCESS_TOKEN}" \
  -H "Content-Type: application/merge-patch+json" \
  -d '{
    "description": "อัปเดต: เพิ่มความสามารถด้านเอกสาร",
    "capabilities": ["code_interpreter", "file_search", "web_search"]
  }'
 
 
2.5 🗑️ ลบ
 
bash
  
curl -X DELETE "${FOUNDRY_ENDPOINT}/api/projects/${FOUNDRY_PROJECT}/agents/${AGENT_ID}?api-version=${FOUNDRY_API_VERSION}" \
  -H "Authorization: Bearer ${FOUNDRY_ACCESS_TOKEN}"
 
 
2.6 💬 ส่งข้อความ / รัน
 
bash
  
curl -X POST "${FOUNDRY_ENDPOINT}/api/projects/${FOUNDRY_PROJECT}/agents/${AGENT_ID}/invoke?api-version=${FOUNDRY_API_VERSION}" \
  -H "Authorization: Bearer ${FOUNDRY_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "ช่วยอธิบายหลักการทำงานของ Secret Scanning หน่อย"
      }
    ],
    "stream": true,
    "temperature": 0.5
  }'
 
 
2.7 📤 อัปโหลดไฟล์ให้ Agent
 
bash
  
curl -X POST "${FOUNDRY_ENDPOINT}/api/projects/${FOUNDRY_PROJECT}/agents/${AGENT_ID}/files?api-version=${FOUNDRY_API_VERSION}" \
  -H "Authorization: Bearer ${FOUNDRY_ACCESS_TOKEN}" \
  -F "file=@./docs/security-guide.md" \
  -F "purpose=assistants"
 
 
 
 
3. Python Client — พร้อมใช้
 
บันทึกเป็น  foundry_client.py :
 
python
  
#!/usr/bin/env python3
"""
Azure AI Foundry Client — api-version=2025-05-01
ครอบคลุม: CRUD • Invoke • Files • Streaming • Error Handling
"""
import os
import time
import json
from typing import Optional, Dict, List, Any, Generator
from urllib.parse import urljoin

import requests


class FoundryClient:
    def __init__(
        self,
        endpoint: Optional[str] = None,
        project: Optional[str] = None,
        token: Optional[str] = None,
        api_version: str = "2025-05-01"
    ):
        self.endpoint = (endpoint or os.getenv("FOUNDRY_ENDPOINT", "")).rstrip("/")
        self.project = project or os.getenv("FOUNDRY_PROJECT", "")
        self.token = token or os.getenv("FOUNDRY_ACCESS_TOKEN", "")
        self.api_version = api_version

        if not all([self.endpoint, self.project, self.token]):
            raise ValueError(
                "⚠️ ตั้งค่าครบทุกตัวแปร: "
                "FOUNDRY_ENDPOINT, FOUNDRY_PROJECT, FOUNDRY_ACCESS_TOKEN"
            )

        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        })

    def _url(self, path: str) -> str:
        return urljoin(
            f"{self.endpoint}/api/projects/{self.project}/",
            f"{path.lstrip('?')}&api-version={self.api_version}" \
                if "?" in path else f"{path}?api-version={self.api_version}"
        )

    # ========== Agent Operations ==========

    def list_agents(self) -> List[Dict[str, Any]]:
        """📋 รายการ Agent ทั้งหมด"""
        resp = self.session.get(self._url("agents"))
        resp.raise_for_status()
        return resp.json().get("value", [])

    def get_agent(self, agent_id: str) -> Dict[str, Any]:
        """🔍 ดูรายละเอียดรายตัว"""
        resp = self.session.get(self._url(f"agents/{agent_id}"))
        resp.raise_for_status()
        return resp.json()

    def create_agent(
        self,
        name: str,
        model_deployment_id: str,
        instructions: str = "",
        description: str = "",
        capabilities: Optional[List[str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs
    ) -> Dict[str, Any]:
        """➕ สร้าง Agent ใหม่"""
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
        payload.update(kwargs)

        resp = self.session.post(self._url("agents"), json=payload)
        resp.raise_for_status()
        return resp.json()

    def update_agent(self, agent_id: str, **fields) -> Dict[str, Any]:
        """✏️ อัปเดตบางฟิลด์"""
        resp = self.session.patch(
            self._url(f"agents/{agent_id}"),
            json=fields,
            headers={"Content-Type": "application/merge-patch+json"}
        )
        resp.raise_for_status()
        return resp.json()

    def delete_agent(self, agent_id: str) -> bool:
        """🗑️ ลบ"""
        resp = self.session.delete(self._url(f"agents/{agent_id}"))
        resp.raise_for_status()
        return resp.status_code in (200, 204)

    # ========== Invoke / Chat ==========

    def invoke_agent(
        self,
        agent_id: str,
        messages: List[Dict[str, str]],
        stream: bool = False,
        **kwargs
    ) -> Generator[Dict[str, Any], None, None] | Dict[str, Any]:
        """💬 เรียกใช้ / สนทนา"""
        payload = {
            "messages": messages,
            "stream": stream,
            **kwargs
        }

        if stream:
            return self._invoke_stream(agent_id, payload)
        else:
            resp = self.session.post(
                self._url(f"agents/{agent_id}/invoke"),
                json=payload
            )
            resp.raise_for_status()
            return resp.json()

    def _invoke_stream(self, agent_id: str, payload: Dict):
        """สตรีมผลลัพธ์แบบทีละส่วน"""
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

    def upload_file(self, agent_id: str, file_path: str, purpose: str = "assistants") -> Dict:
        """📤 อัปโหลดไฟล์ให้ Agent ใช้"""
        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            resp = self.session.post(
                self._url(f"agents/{agent_id}/files"),
                files={"file": (filename, f)},
                data={"purpose": purpose},
                headers={"Content-Type": None}  # ให้ requests จัดการ boundary
            )
        resp.raise_for_status()
        return resp.json()

    # ========== Helper ==========

    def wait_until_ready(self, agent_id: str, timeout: int = 30) -> Dict:
        """⏳ รอจนกว่าสถานะพร้อมใช้"""
        start = time.time()
        while time.time() - start < timeout:
            agent = self.get_agent(agent_id)
            status = agent.get("provisioningState", "").lower()
            if status in ["succeeded", "ready"]:
                return agent
            if status in ["failed", "canceled"]:
                raise RuntimeError(f"Agent ล้ม: {status}")
            time.sleep(2)
        raise TimeoutError("รอนานเกินไป")


# ========== ทดสอบใช้งาน ==========
if __name__ == "__main__":
    client = FoundryClient()

    print("📋 รายการ Agent:")
    for ag in client.list_agents():
        print(f"  - {ag['id']}: {ag['name']}")
 
 
 
 
4. TypeScript Client
 
บันทึกเป็น  foundry-client.ts :
 
typescript
  
/**
 * Azure AI Foundry Client — api-version=2025-05-01
 */

export interface FoundryConfig {
  endpoint: string;
  project: string;
  token: string;
  apiVersion?: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  model: { deploymentId: string };
  instructions?: string;
  capabilities?: string[];
  configuration?: { temperature?: number; maxTokens?: number };
  provisioningState?: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export class FoundryClient {
  private cfg: Required<FoundryConfig>;

  constructor(config: FoundryConfig) {
    this.cfg = {
      apiVersion: "2025-05-01",
      ...config,
      endpoint: config.endpoint.replace(/\/$/, "")
    };
  }

  private url(path: string): string {
    const sep = path.includes("?") ? "&" : "?";
    return `${this.cfg.endpoint}/api/projects/${this.cfg.project}/${path}${sep}api-version=${this.cfg.apiVersion}`;
  }

  private headers(ctype = "application/json"): HeadersInit {
    return {
      Authorization: `Bearer ${this.cfg.token}`,
      "Content-Type": ctype,
      Accept: "application/json"
    };
  }

  async listAgents(): Promise<Agent[]> {
    const res = await fetch(this.url("agents"), { headers: this.headers() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.value || [];
  }

  async getAgent(id: string): Promise<Agent> {
    const res = await fetch(this.url(`agents/${id}`), { headers: this.headers() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async createAgent(agent: Omit<Agent, "id">): Promise<Agent> {
    const res = await fetch(this.url("agents"), {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(agent)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async invokeAgent(
    agentId: string,
    messages: Message[],
    stream = false,
    extra?: Record<string, unknown>
  ) {
    const res = await fetch(this.url(`agents/${agentId}/invoke`), {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ messages, stream, ...extra })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (stream && res.body) return res.body;
    return res.json();
  }
}

// ===== ตัวอย่างใช้งาน =====
if (import.meta.main) {
  const client = new FoundryClient({
    endpoint: Deno.env.get("FOUNDRY_ENDPOINT")!,
    project: Deno.env.get("FOUNDRY_PROJECT")!,
    token: Deno.env.get("FOUNDRY_ACCESS_TOKEN")!
  });

  console.log("📋 Agents:", await client.listAgents());
}
 
 
 
 
5. ตัวอย่างการใช้งาน (ฉบับเต็ม)
 
python
  
from foundry_client import FoundryClient

# เริ่มต้น
client = FoundryClient()

# 1️⃣ สร้าง
agent = client.create_agent(
    name="zyntro-dev-assistant",
    model_deployment_id="gpt-4o",
    description="ผู้ช่วยทีมพัฒนา — ตอบคำถามเทคนิค, ตรวจโค้ด, เขียนเอกสาร",
    instructions="คุณเป็นผู้ช่วยที่เชี่ยวชาญ Python, FastAPI, GitHub CI/CD...",
    capabilities=["code_interpreter", "file_search"],
    temperature=0.3
)
AGENT_ID = agent["id"]
print(f"✅ สร้างสำเร็จ: {AGENT_ID}")

# 2️⃣ รอพร้อมใช้
client.wait_until_ready(AGENT_ID)

# 3️⃣ อัปโหลดคู่มือความปลอดภัย
client.upload_file(AGENT_ID, "./docs/Token Security Guide.md")

# 4️⃣ ถาม — แบบสตรีม
for chunk in client.invoke_agent(
    AGENT_ID,
    messages=[{"role": "user", "content": "สรุปหลักการจัดการ Token หน่อย"}],
    stream=True
):
    if delta := chunk.get("delta", {}).get("content"):
        print(delta, end="", flush=True)

# 5️⃣ ถาม — แบบรอจบ
resp = client.invoke_agent(
    AGENT_ID,
    messages=[{"role": "user", "content": "ตรวจสอบโค้ดนี้ให้หน่อย..."}]
)
print("\n📝 คำตอบ:", resp["choices"][0]["message"]["content"])

# 6️⃣ อัปเดต
client.update_agent(AGENT_ID, description="✅ อัปเดต — เพิ่มคู่มือความปลอดภัยแล้ว")
 
 
 
 
6. โครงสร้าง Response ที่ควรรู้
 
Agent Object
 
json
  
{
  "id": "agent-001",
  "name": "zyntro-assistant",
  "description": "...",
  "model": { "deploymentId": "gpt-4o" },
  "instructions": "...",
  "capabilities": ["code_interpreter", "file_search"],
  "configuration": { "temperature": 0.7, "maxTokens": 4096 },
  "provisioningState": "Succeeded",
  "createdAt": "2026-09-29T...",
  "etag": "\"abc123\""
}
 
 
Error Format
 
json
  
{
  "error": {
    "code": "InvalidAuthenticationInfo",
    "message": "การยืนยันตัวตนไม่ถูกต้อง",
    "target": "Bearer",
    "details": []
  }
}
 
 
รหัสที่พบบ่อย
 
รหัส สาเหตุ วิธีแก้ 
401 Token ไม่ถูก/หมดอายุ สร้างใหม่ ตรวจสิทธิ์ 
403 ห้ามเข้า ตรวจสิทธิ์บทบาทในโครงการ 
404 ไม่พบ Agent/โปรเจกต์ ตรวจชื่อ/ID 
429 หมดโควต้า รอหรือขอเพิ่ม 
503 บริการไม่ว่าง ลองใหม่ภายหลัง + retry 
 
 
 
ต้องการเพิ่มอะไรอีกไหมครับ เช่น:
 
- 🔄 ระบบรีเฟรชโทเคนอัตโนมัติ (เมื่อหมดอายุเรียกใหม่เอง)
- 🧪 ชุดทดสอบ Unit Test สำหรับ Client นี้
- 📊 ตัวอย่างดึง Log/เมตริก การใช้งาน Agent
 
บอกได้เลยครับ! 🚀
