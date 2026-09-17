# Python Secure Sandbox Base Image
FROM python:3.12-slim-bookworm

# Hardening: dedicated non-root user + writable /tmp for python runtime.
# NOTE: do NOT make /workspace a VOLUME here — sandbox.py mounts it explicitly
# per-run (read-only) plus a --tmpfs /tmp, so the image stays small and the
# filesystem policy is set at launch, not baked in.
RUN useradd -m -u 1000 sandbox \
    && mkdir -p /workspace /output /tmp \
    && chown -R sandbox:sandbox /workspace /output /tmp

# Minimal dependencies only
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir requests==2.31.0 pydantic==2.5.2

WORKDIR /workspace
USER sandbox

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOME=/workspace \
    NETWORK_ISOLATED=true

# Command to run the provided script expression, e.g.:
#   docker run ... <image> "print(1+1)"
# ENTRYPOINT stays a single `python3 -c`; do NOT append extra `-c` at the call
# site (that would swallow the code string as argv).
ENTRYPOINT ["python3", "-c"]
