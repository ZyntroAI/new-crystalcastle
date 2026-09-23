import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from models import ExecutionLog

async def execute_script(script: str) -> tuple[str, str, bool]:
    """รัน shell script และคืนค่า (stdout, stderr, success)"""
    try:
        process = await asyncio.create_subprocess_shell(
            script,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        success = process.returncode == 0
        return stdout.decode('utf-8', errors='ignore'), stderr.decode('utf-8', errors='ignore'), success
    except Exception as e:
        return "", str(e), False

async def log_execution(db: AsyncSession, entity_type: str, entity_id: int, output: str, error: str, success: bool):
    log = ExecutionLog(
        entity_type=entity_type,
        entity_id=entity_id,
        status="success" if success else "failed",
        output=output[:2000] if output else None,  # จำกัดขนาด log
        error=error[:2000] if error else None
    )
    db.add(log)
    await db.commit()
    return log.id
