"""Ingest runbooks & docs into RAG knowledge base"""
import asyncio
from pathlib import Path
from app.core.rag import add_document
from app.db.session import get_db

DOCS_ROOT = Path(__file__).parent.parent.parent / "docs"

async def ingest_all():
    db = await anext(get_db())
    
    md_files = list(DOCS_ROOT.rglob("*.md"))
    if not md_files:
        print(f"⚠️ No .md files found in {DOCS_ROOT}")
        return

    total_chunks = 0
    for path in md_files:
        try:
            content = path.read_text(encoding="utf-8")
            rel_path = path.relative_to(DOCS_ROOT).as_posix()
            
            chunks = await add_document(
                db,
                content=content,
                source=f"docs/{rel_path}",
                title=path.stem.replace("_", " ").title()
            )
            total_chunks += chunks
            print(f"✅ {rel_path} → {chunks} chunks")
        except Exception as e:
            print(f"❌ Failed {path}: {e}")

    print(f"\n🎉 Total ingested: {total_chunks} chunks across {len(md_files)} files")

if __name__ == "__main__":
    asyncio.run(ingest_all())
