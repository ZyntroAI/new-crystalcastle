"""AST10 security gates — G2 (intent verification) + G3 (behavioral sandbox).

Layered on top of scripts/sandbox/sandbox.py's hardened executor.

Public API:
    get_g2_verification_prompt(...)   -> str
    G2IntentVerifier                   -> verify(script, task) -> dict
    g3_sandbox_node(state)             -> dict   (LangGraph node)
    ast10_security_flow(state)         -> dict   (G1 -> G2 -> G3)
"""
