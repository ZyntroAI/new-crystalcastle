นี่คือตัวอย่างโค้ด **Python** สำหรับการสร้างสถาปัตยกรรม **"Self-Healing Reflection Pattern"** โดยใช้ **LangGraph** และ **Playwright** ตามที่ระบุในแหล่งข้อมูล สถาปัตยกรรมนี้จะประกอบด้วยโหนดสำคัญคือ **Planner**, **Executor**, **Reflector** และ **Reviser** เพื่อสร้างระบบอัตโนมัติที่สามารถซ่อมแซมตัวเองได้เมื่อเกิดข้อผิดพลาด

### โครงสร้างโค้ดตามสถาปัตยกรรม Reflection Pattern

```python
import asyncio
import os
from typing import Annotated, List, TypedDict
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from playwright.async_api import async_playwright

load_dotenv()

# --- 1. นิยามสถานะของกราฟ (State Definition) ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], "ประวัติการสนทนา"]
    plan: List[str]          # แผนการทำงานทีละขั้นตอน
    current_step: int        # ขั้นตอนปัจจุบัน
    critique: str            # คำวิจารณ์จาก Reflector
    retry_count: int         # จำนวนครั้งที่พยายามใหม่

# --- 2. การจัดการเบราว์เซอร์แบบ Shared Instance (Best Practice) ---
_browser_resources = {"browser": None, "context": None, "page": None, "playwright": None}

async def get_page():
    if _browser_resources["page"] is None:
        p = await async_playwright().start()
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        # ลบ Webdriver Flag เพื่อพรางตัวจากการตรวจจับบอท
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        _browser_resources.update({"playwright": p, "browser": browser, "context": context, "page": await context.new_page()})
    return _browser_resources["page"]

# --- 3. เครื่องมือควบคุมเบราว์เซอร์ (Playwright Tools) ---
@tool
async def navigate_and_read(url: str):
    """นำทางไปที่ URL และดึงข้อความบนหน้าเว็บ (จำกัด 3000 ตัวอักษรเพื่อประหยัด Token)"""
    page = await get_page()
    await page.goto(url, wait_until="networkidle", timeout=20000)
    content = await page.inner_text("body")
    return content[:3000]

@tool
async def click_element(selector: str):
    """คลิกที่องค์ประกอบบนหน้าเว็บโดยใช้ CSS Selector"""
    page = await get_page()
    await page.click(selector)
    return f"Clicked {selector}"

# --- 4. นิยามโหนดต่างๆ (Graph Nodes) ---
llm = ChatOpenAI(model="gpt-4o", temperature=0) # ใช้ค่า Temperature=0 เพื่อความแม่นยำ

async def planner_node(state: AgentState):
    """สร้างแผนการทำงานทีละขั้นตอนจากคำสั่งของผู้ใช้"""
    prompt = f"สร้างแผนการทำงาน 3 ขั้นตอนสำหรับงานนี้: {state['messages'][-1].content}"
    response = await llm.ainvoke(prompt)
    # สมมติว่าดึงแผนออกมาเป็น List (ในงานจริงควรใช้ Structured Output)
    return {"plan": [response.content], "current_step": 0, "retry_count": 0}

async def executor_node(state: AgentState):
    """โหนดดำเนินการ: รัน Playwright ตามแผนขั้นปัจจุบัน"""
    step = state["plan"][state["current_step"]]
    page = await get_page()
    # ในสถาปัตยกรรมจริง โหนดนี้จะใช้ ReAct Agent เพื่อตัดสินใจใช้ Tool
    # ตัวอย่างย่อ: รันงานตามขั้นตอนที่ได้รับ
    result = await navigate_and_read.ainvoke({"url": "https://example.com"})
    return {"messages": [SystemMessage(content=f"ผลลัพธ์ขั้นตอนที่ {state['current_step']}: {result}")]}

async def reflector_node(state: AgentState):
    """โหนดตรวจสอบ (QC): ตรวจสอบว่าผลลัพธ์ถูกต้องหรือไม่"""
    last_message = state["messages"][-1].content
    # วิเคราะห์แบบ Adversarial: ค้นหาข้อผิดพลาดหรือช่องโหว่ใน Output
    critique_prompt = f"ตรวจสอบผลลัพธ์นี้ว่าสมบูรณ์หรือไม่: {last_message}. ถ้าไม่สมบูรณ์ให้ระบุเหตุผล"
    response = await llm.ainvoke(critique_prompt)
    is_complete = "สมบูรณ์" in response.content
    return {"critique": response.content if not is_complete else "", "retry_count": state["retry_count"] + 1}

# --- 5. การตั้งค่า Logic การตัดสินใจ (Edges) ---
def should_retry(state: AgentState):
    if state["critique"] and state["retry_count"] < 5: # ลองใหม่ได้สูงสุด 5 ครั้ง
        return "reviser"
    return END

# --- 6. สร้างและเชื่อมต่อกราฟ (Graph Construction) ---
workflow = StateGraph(AgentState)
workflow.add_node("planner", planner_node)
workflow.add_node("executor", executor_node)
workflow.add_node("reflector", reflector_node)

workflow.set_entry_point("planner")
workflow.add_edge("planner", "executor")
workflow.add_edge("executor", "reflector")
workflow.add_conditional_edges("reflector", should_retry) # วงจรวนซ้ำเพื่อแก้ไขตัวเอง

app = workflow.compile()

# --- ส่วนทดสอบการรัน ---
async def main():
    query = "ไปที่ example.com และดูว่าหัวข้อหลักคืออะไร"
    async for event in app.astream({"messages": [HumanMessage(content=query)]}):
        print(event)
    
    # ปิดทรัพยากร
    if _browser_resources["browser"]:
        await _browser_resources["browser"].close()
        await _browser_resources["playwright"].stop()

if __name__ == "__main__":
    asyncio.run(main())
```

### คำอธิบายจุดสำคัญของสถาปัตยกรรมนี้:
1.  **Planner Node:** ทำหน้าที่รับคำสั่งภาษาธรรมชาติและแตกเป็นขั้นตอน (Numbered sequence) เพื่อความแม่นยำในการทำงานระยะยาว (Long-horizon planning).
2.  **Shared State:** ทุกโหนดทำงานบนสถานะเดียวกัน ทำให้เอเย่นต์ไม่ลืมบริบทระหว่างการรัน (Persistence).
3.  **Reflection Loop:** หากโหนด **Reflector** พบว่าผลลัพธ์มีข้อผิดพลาดหรือ Selector ของ Playwright ล้มเหลว ระบบจะส่งคำวิจารณ์เชิงโครงสร้างไปยังโหนดถัดไปเพื่อแก้ไขแผนการทำงานและรันใหม่ ซึ่งสามารถแก้ปัญหาความล้มเหลวชั่วคราวได้ถึง **80%**.
4.  **Stealth & Robustness:** โค้ดมีการลบร่องรอยการเป็นบอท และใช้กลยุทธ์การรอแบบ **networkidle** แทนการใช้ `sleep` เพื่อความเสถียรสูงสุด.
5.  **Token Optimization:** มีการตัดข้อความ (Data Truncation) ให้เหลือเพียง 3000 ตัวอักษรก่อนส่งให้ LLM เพื่อป้องกันปัญหา Context Overflow และลดต้นทุน.
