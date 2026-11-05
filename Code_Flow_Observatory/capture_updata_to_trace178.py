"""Capture one develop_updata chat run through debug_trace.py:178.

The temporary server stops before line 178 executes. Only source locations and
small, explicit summaries are saved; no model call is made.
"""
from __future__ import annotations

import asyncio
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/huangchunlei/workspace/echo/sftg_ai_backend")
HERE = Path(__file__).resolve().parent
OUTPUT = HERE / "evidence/ordinary-chat-through-debug-trace-178-develop-updata.json"
COMMIT = "3cb5173064689c277d959dd315e3774112f32d06"
SESSION_ID = "debug-1030fco"
USER_ID = "2113153353906343938"
REQUEST_ID = "cfo-segment-1030-3cb5173"
PROMPT = "你好，请简要说明你能帮我做什么。"
UI_CONTEXT = {"page": "scene_center_page", "visible": {"page_state": {}}}
WS_URL = f"ws://172.20.163.11:8094/ws/sessions/{SESSION_ID}"
SOURCE_ROOT = ROOT / "src/shaofeng_ai_backend"
START_FILE = "presentation/fastapi_gateway/application.py"
END_FILE = "observability/debug_trace.py"


class StopAtDebugTrace(Exception):
    """Intentional break before DebugTraceRecorder.record line 178."""


def ensure_fixed_source() -> None:
    actual = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    branch = subprocess.check_output(["git", "branch", "--show-current"], cwd=ROOT, text=True).strip()
    if actual != COMMIT or branch != "develop_updata":
        raise RuntimeError(f"Expected develop_updata at {COMMIT}; found {branch} at {actual}")


def serve() -> None:
    import uvicorn
    from shaofeng_ai_backend.observability.debug_trace import current_trace_context
    from shaofeng_ai_backend.presentation.fastapi_gateway.application import app as gateway_app

    events: list[dict[str, object]] = []
    start: dict[str, object] | None = None
    checkpoint: dict[str, object] | None = None

    def trace(frame, kind, _argument):
        nonlocal start, checkpoint
        filename = frame.f_code.co_filename
        source_prefix = str(SOURCE_ROOT) + os.sep
        if not filename.startswith(source_prefix):
            return None
        relative = filename[len(source_prefix):]
        if (kind == "call" and relative == START_FILE
                and frame.f_code.co_name == "ws_session"
                and frame.f_locals.get("session_id") == SESSION_ID):
            start = {
                "file": relative, "line": frame.f_lineno, "function": "ws_session",
                "session_id": SESSION_ID, "request_id": REQUEST_ID,
            }
        if start is None or kind not in {"call", "line"}:
            return trace
        if (kind == "line" and relative == "application/context/pipeline.py"
                and frame.f_lineno == 53
                and frame.f_locals.get("request_id") == REQUEST_ID):
            checkpoint = {
                "file": relative, "line": 53, "event_index": len(events),
                "request_id": frame.f_locals.get("request_id"),
                "session_id": frame.f_locals.get("session_id"),
                "user_id": frame.f_locals.get("user_id"),
                "access_mode": frame.f_locals.get("access_mode"),
                "ui_context_keys": sorted((frame.f_locals.get("raw_ui_context") or {}).keys()),
            }
        if (kind == "line" and relative == END_FILE and frame.f_code.co_name == "record"
                and frame.f_lineno == 178 and checkpoint is not None):
            context = current_trace_context()
            hit = {
                "file": relative, "line": 178, "function": "DebugTraceRecorder.record",
                "record_event": frame.f_locals.get("event"),
                "mode": frame.f_locals["self"].mode,
                "trace_session_id": context.session_id if context else None,
                "trace_request_id": context.request_id if context else None,
            }
            sys.settrace(None)
            payload = {
                "start": start, "checkpoint": checkpoint, "hit": hit, "events": events,
                "capture": {
                    "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                    "source": WS_URL, "repository": str(ROOT),
                    "branch": "develop_updata", "commit": COMMIT,
                    "stopped_before": f"{END_FILE}:178",
                    "auth": "disabled only in temporary capture process",
                    "debug_mode": "off; stopped before the mode check",
                    "ui_context": UI_CONTEXT,
                    "trace_semantics": (
                        "Python call events may include async coroutine resumptions; "
                        "line events exclude the target line, which did not execute."
                    ),
                },
            }
            OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            raise StopAtDebugTrace("intentional stop before debug_trace.py:178")
        if len(events) < 20000:
            events.append({"kind": kind, "file": relative,
                           "function": frame.f_code.co_name, "line": frame.f_lineno})
        return trace

    sys.settrace(trace)
    uvicorn.run(gateway_app, host="0.0.0.0", port=8094,
                log_level="error", access_log=False)


async def send_request() -> list[dict[str, object]]:
    import websockets

    messages = []
    async with websockets.connect(WS_URL, open_timeout=8) as connection:
        await connection.send(json.dumps({
            "type": "chat_start", "request_id": REQUEST_ID,
            "user_id": USER_ID, "prompt": PROMPT, "ui_context": UI_CONTEXT,
        }, ensure_ascii=False))
        for _ in range(12):
            raw = await asyncio.wait_for(connection.recv(), timeout=12)
            message = json.loads(raw)
            messages.append({"type": message.get("type"),
                             "status": message.get("status"),
                             "error_code": message.get("error_code")})
            if message.get("type") in {"chat_error", "chat_final"}:
                break
    return messages


def main() -> None:
    ensure_fixed_source()
    if OUTPUT.exists():
        raise RuntimeError(f"Capture already exists; remove deliberately before recapturing: {OUTPUT}")
    with socket.socket() as probe:
        if probe.connect_ex(("127.0.0.1", 8094)) == 0:
            raise RuntimeError("Port 8094 is already in use")
    env = dict(os.environ, ENABLE_AUTH="false", AGENT_DEBUG_MODE="off",
               PYTHONPATH=str(ROOT / "src"))
    with tempfile.TemporaryFile(mode="w+t") as log:
        server = subprocess.Popen([sys.executable, __file__, "--serve"],
                                  cwd=ROOT, env=env, stdout=log, stderr=log)
        try:
            for _ in range(300):
                if server.poll() is not None:
                    raise RuntimeError("Temporary server stopped before listening")
                with socket.socket() as probe:
                    if probe.connect_ex(("127.0.0.1", 8094)) == 0:
                        break
                time.sleep(0.1)
            else:
                log.seek(0)
                raise RuntimeError("Temporary server did not listen on 8094. Server log tail:\n"
                                   + log.read()[-3000:])
            messages = asyncio.run(send_request())
        finally:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait(timeout=5)
        if not OUTPUT.exists():
            log.seek(0)
            raise RuntimeError("Breakpoint not hit. Server log tail:\n" + log.read()[-3000:])
    evidence = json.loads(OUTPUT.read_text(encoding="utf-8"))
    evidence["capture"]["client_messages"] = messages
    OUTPUT.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Captured {len(evidence['events'])} source events; stopped before {END_FILE}:178")
    print("Client message types:", [item["type"] for item in messages])


if __name__ == "__main__":
    if sys.argv[1:] == ["--serve"]:
        serve()
    else:
        main()
