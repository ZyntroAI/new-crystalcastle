@app.post("/api/items/search", response_model=SearchResult)
def search_items(
    query: SearchQuery,
    current_user: User = Depends(get_current_user)
):
    # 🔒 เฉพาะรายการของผู้ใช้
    results = [i for i in items_db if i.owner_id == current_user.id]

    # ─── 1. ค้นหาแบบ Fuzzy ───
    scored = []
    if query.q:
        kw = query.q.lower()
        for item in results:
            # คำนวณคะแนนความคล้าย
            score_title = fuzz.partial_ratio(kw, item.title.lower())
            score_desc = fuzz.partial_ratio(kw, (item.description or "").lower())
            score = max(score_title, score_desc)

            if score >= query.fuzzy_threshold:
                scored.append({"item": item, "score": score})
        # แทนที่ results ด้วยรายการที่มีคะแนน
        results_scored = scored
    else:
        # ไม่มีคำค้นหา → ทุกรายการ คะแนนเต็ม 100
        results_scored = [{"item": i, "score": 100} for i in results]

    # ─── 2. กรองสถานะ ───
    if query.status:
        results_scored = [
            r for r in results_scored
            if r["item"].status == query.status
        ]

    # ─── 3. กรองช่วงวันที่ ───
    if query.created_after:
        try:
            after = datetime.strptime(query.created_after, "%Y-%m-%d")
            results_scored = [
                r for r in results_scored
                if r["item"].created_at
                and datetime.fromisoformat(r["item"].created_at) >= after
            ]
        except ValueError:
            pass

    if query.created_before:
        try:
            before = datetime.strptime(query.created_before, "%Y-%m-%d")
            results_scored = [
                r for r in results_scored
                if r["item"].created_at
                and datetime.fromisoformat(r["item"].created_at) <= before
            ]
        except ValueError:
            pass

    # ─── 4. เรียงลำดับ ───
    reverse = query.sort_order == "desc"
    if query.sort_by == "relevance":
        # ความตรงกับมากไปน้อย
        results_scored.sort(key=lambda r: r["score"], reverse=reverse)
    else:
        # เรียงตามฟิลด์ปกติ
        results_scored.sort(
            key=lambda r: getattr(r["item"], query.sort_by) or "",
            reverse=reverse
        )

    # ─── 5. แบ่งหน้า ───
    total = len(results_scored)
    start = (query.page - 1) * query.limit
    page_scored = results_scored[start : start + query.limit]

    # แปลงเป็นผลลัพธ์พร้อมคะแนน
    return SearchResult(
        total=total,
        page=query.page,
        limit=query.limit,
        total_pages=(total + query.limit - 1) // query.limit,
        items=[
            SearchResultItem(
                score=r["score"],
                title=r["item"].title,
                description=r["item"].description,
                status=r["item"].status,
                created_at=r["item"].created_at,
                owner_id=r["item"].owner_id,
                # ... ฟิลด์อื่นๆ
            )
            for r in page_scored
        ]
    )
