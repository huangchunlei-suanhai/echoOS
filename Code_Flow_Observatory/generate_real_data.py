"""Regenerate the fixed source excerpts for the 8094 ordinary-chat prefix."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPOSITORY = Path("/home/huangchunlei/workspace/shaofeng_tiangong/sftg_ai_backend")
COMMIT = "37467f44cba35cd23036af3530f861a398fb130d"
PREFIX = "src/shaofeng_ai_backend/"


def spec(id, title, kind, file, symbol, start, end, focus, purpose, inputs, output, calls, note, color="mint"):
    return dict(id=id, title=title, type=kind, file=PREFIX + file, symbol=symbol,
                lineStart=start, lineEnd=end, focusLine=focus, purpose=purpose,
                input=inputs, output=output, calls=calls, note=note, color=color)


SPECS = [
    spec("auth-middleware", "握手鉴权入口", "中间件", "middleware/auth_middleware.py", "AuthMiddleware.__call__", 33, 37, 36,
         "ASGI 请求先经过鉴权中间件；本次临时服务将 ENABLE_AUTH 设为 false，因此走直接放行分支。", "WebSocket scope、receive、send", "请求继续进入 FastAPI 路由", "AuthMiddleware → FastAPI WebSocket 路由", "函数进入有追踪证据；鉴权关闭只适用于本次采集。", "blue"),
    spec("ws-entry", "WebSocket 会话入口", "入口函数", "presentation/fastapi_gateway/application.py", "ws_session", 95, 117, 116,
         "按 session_id 接收 WebSocket 连接，并将其交给会话广播中心接受连接。", "WebSocket、session_id=debug-cfo", "建立连接后进入消息接收循环", "ws_session → WSSessionBroker.connect", "展示的是固定提交源码；文档字符串列出协议，不代表所有消息类型都已执行。"),
    spec("broker-connect", "接受并登记连接", "异步方法", "integrations/realtime/ws_session_broker.py", "WSSessionBroker.connect", 21, 24, 22,
         "接受握手，再把 socket 记录到该 session 的连接集合。", "session_id、WebSocket", "连接处于已接受状态", "websocket.accept → _sockets[session_id].add", "本次 8094 客户端成功建立连接。", "purple"),
    spec("ws-receive", "读取前端消息", "入口片段", "presentation/fastapi_gateway/application.py", "ws_session · receive_json", 299, 312, 302,
         "循环读取 JSON 消息，并取得消息类型；本次输入是 chat_start。", "WebSocket JSON 报文", "msg_type=chat_start", "receive_json → 消息类型分支", "函数追踪不能证明片段中的每个分支；消息类型由本次发送内容和后续 ACK 佐证。", "blue"),
    spec("request-scope", "生成请求隔离键", "静态方法", "application/runtime/runtime_coordinator.py", "RuntimeCoordinator._request_scope_key", 181, 186, 186,
         "将 session_id 与 request_id 组成内部键，避免不同会话的同名请求相互影响。", "request_id、session_id", "会话范围内的请求键", "ensure_request → _request_scope_key", "函数进入由追踪记录证实；页面不展示内部键的原始 NUL 字符。", "purple"),
    spec("ensure-request", "登记 request_id", "实例方法", "application/runtime/runtime_coordinator.py", "RuntimeCoordinator.ensure_request", 188, 202, 199,
         "规范化请求 ID，并在取消状态表中登记；Gateway 和 Runtime 入口分别调用一次。", "请求 ID、session_id", "稳定的 request_id", "ensure_request → _request_scope_key → _request_cancel_map", "本次 ID 由采集请求显式提供，没有进入随机生成分支。", "orange"),
    spec("ws-dispatch", "创建后台任务", "入口片段", "presentation/fastapi_gateway/application.py", "ws_session · chat_start branch", 327, 355, 351,
         "chat_start 消息生成后台任务，先写本连接任务表，再登记到全局任务表。", "消息字典、request_id", "后台任务句柄和登记结果", "ensure_request → create_task → _register_active_task", "接收循环不等待 Agent 完成，才能继续处理后续取消消息。", "blue"),
    spec("register-task", "登记活动任务", "内部函数", "presentation/fastapi_gateway/application.py", "_register_active_task", 119, 130, 128,
         "在锁保护下按 session 和 request_id 登记任务，并记录当前会话的最新请求。", "request_id、asyncio.Task", "登记成功布尔值", "global_active_request_tasks / global_latest_request_by_session", "追踪证实函数进入；本次继续到 ACK，说明未走重复任务失败分支。", "orange"),
    spec("run-after-register", "等待登记后启动", "内部函数", "presentation/fastapi_gateway/application.py", "_run_after_registration", 346, 349, 349,
         "等待 start_gate 打开，再运行真正的请求处理函数，避免任务过快结束留下悬空句柄。", "start_gate、ws_message", "转入 _run_agent_request", "start_gate.wait → _run_agent_request", "异步协程恢复会在追踪中重复出现 call；页面已归并。", "purple"),
    spec("chat-envelope", "chat_start 输入协议", "数据结构", "presentation/fastapi_gateway/ws_protocol.py", "ChatStartMessage", 12, 21, 21,
         "定义 chat_start 的必填字段，并禁止额外字段；这是校验函数使用的协议源码。", "type、request_id、user_id、prompt、ui_context", "校验后的 ChatStartMessage", "ChatStartMessage.model_validate", "此卡为源码关联；Pydantic 内部校验没有出现在 Python 函数追踪中。", "mint"),
    spec("worker-validate", "校验请求信封", "内部函数片段", "presentation/fastapi_gateway/application.py", "_run_agent_request · validation", 200, 213, 210,
         "后台任务按消息类型选择 ChatStartMessage 校验；本次 chat_start 校验通过。", "ws_message", "ChatStartMessage 实例", "ChatStartMessage.model_validate → ACK", "ACK 已收到，能证明这次信封校验未走 ValidationError 返回分支。", "blue"),
    spec("safe-send", "安全发送 WebSocket JSON", "内部函数", "presentation/fastapi_gateway/application.py", "_safe_send_json", 181, 198, 193,
         "发送 JSON，同时处理连接关闭时的传输异常。", "待发送的 JSON payload", "发送成功布尔值", "websocket.send_json", "本次客户端收到 ACK；断连异常分支只是源码上下文，并未发生。", "purple"),
    spec("worker-ack", "发送 ACK 并进入聊天入口", "内部函数片段", "presentation/fastapi_gateway/application.py", "_run_agent_request · ack and dispatch", 230, 254, 247,
         "先发 chat_ack 确认接收，再将自然语言请求交给 RuntimeCoordinator。", "已校验的 ChatStartMessage", "ACK 和 Runtime 调用", "_safe_send_json → run_chat_entry", "ACK 表示服务端接受请求，不表示 Agent 已完成。", "mint"),
    spec("run-chat-entry", "进入 Runtime 聊天入口", "异步方法", "application/runtime/runtime_coordinator.py", "RuntimeCoordinator.run_chat_entry", 258, 281, 275,
         "再次确保 request_id，然后把自然语言请求交给内部装配函数。", "session_id、user_id、prompt、ui_context、request_id", "进入 _run_chat_agent_request", "ensure_request → _run_chat_agent_request", "本卡只显示停止采集前相关的主路径，不把 finally 清理当作断点前步骤。", "blue"),
    spec("chat-assembly", "装配聊天请求", "异步方法片段", "application/runtime/runtime_coordinator.py", "RuntimeCoordinator._run_chat_agent_request", 369, 409, 402,
         "先读取会话记忆，再写本轮用户消息事件，最后调用 ContextPipeline.build。", "用户与会话标识、prompt、原始 ui_context", "调用 ContextPipeline.build 前的 SessionMemory 和事件", "MemoryStore → SessionMemoryBuilder → MemoryEventFactory → ContextPipeline", "第 410 行之后尚未进入，不能把 AgentRequest 或 Engine 视为已执行。", "orange"),
    spec("memory-turns", "读取近期对话轮次", "实例方法", "application/runtime/memory/session_memory_store.py", "InMemorySessionMemoryStore.list_recent", 44, 53, 52,
         "按用户和会话读取最近的 turn；本次内存中没有历史轮次。", "user_id、session_id、limit=20", "空列表", "_key → _records.get", "该存储在进程内；新启动的临时服务不共享用户之前的会话历史。", "mint"),
    spec("memory-events", "读取近期任务事件", "实例方法", "application/runtime/memory/session_memory_store.py", "InMemorySessionMemoryStore.list_recent_events", 65, 74, 73,
         "按用户和会话读取已有 MemoryEvent，供任务摘要投影使用。", "user_id、session_id、limit=100", "空列表", "_key → _events.get", "本次读取发生在记录当前消息之前。", "mint"),
    spec("memory-key", "生成记忆存储键", "实例方法", "application/runtime/memory/session_memory_store.py", "InMemorySessionMemoryStore._key", 82, 84, 84,
         "用 user_id 和 session_id 共同定位进程内记忆桶。", "user_id、session_id", "二元组存储键", "list_recent / list_recent_events / append_event", "同一函数在读取与写入时重复调用。", "purple"),
    spec("event-bucket", "创建事件队列", "初始化片段", "application/runtime/memory/session_memory_store.py", "InMemorySessionMemoryStore._events · lambda", 25, 32, 31,
         "首次向此用户会话写事件时，由 defaultdict 的工厂函数创建有长度上限的 deque。", "此前不存在的用户会话键", "新的事件 deque", "append_event → _events[ key ] → lambda: deque(...) ", "第 31 行的 lambda 出现在 8094 函数追踪中；这是首次写入时的惰性初始化。", "purple"),
    spec("memory-build", "构建短期会话记忆", "实例方法", "application/memory/session_memory_builder.py", "SessionMemoryBuilder.build", 34, 52, 48,
         "把原始 turn 和事件转换为 SessionMemory；本次最近轮次、活动任务和任务投影均为空。", "空的 records 和 events", "SessionMemory(recent_turns=[], active_task=None, task_projection=None)", "_find_active_task → SessionTaskProjectionBuilder.build", "这些状态来自第 52 行前采集到的局部变量。", "blue"),
    spec("find-active-task", "查找待续接任务", "实例方法", "application/memory/session_memory_builder.py", "SessionMemoryBuilder._find_active_task", 54, 62, 59,
         "从最近记录逆序查找任务；空 records 直接返回 None。", "空的 records", "None", "SessionMemoryBuilder.build → _find_active_task", "追踪证实函数调用；无记录由本次断点局部状态佐证。", "orange"),
    spec("task-projection", "投影会话任务摘要", "实例方法", "application/memory/event_projector.py", "SessionTaskProjectionBuilder.build", 18, 63, 63,
         "扫描历史事件是否包含任务信号；本次空事件列表返回 None。", "空的 events", "None", "SessionMemoryBuilder.build → SessionTaskProjectionBuilder.build", "函数源码包含其他事件分支，不能解释为本次全部经过。", "purple"),
    spec("utc-time", "生成事件时间", "函数", "application/runtime/events.py", "now_utc_iso", 15, 17, 17,
         "为本轮用户消息事件生成 UTC 时间字符串。", "当前 UTC 时间", "ISO 格式字符串", "datetime.now(timezone.utc).isoformat", "追踪证实调用；本页不保存运行时生成的具体时间值。", "mint"),
    spec("user-event", "构造用户消息事件", "实例方法", "application/memory/event_factory.py", "MemoryEventFactory.build_user_message_event", 21, 39, 31,
         "将本轮 prompt 包装成 user_message_received 事件。", "用户、会话、请求 ID、时间、prompt", "MemoryEvent", "build_user_message_event → _build_event", "事件发生在 ContextPipeline.build 之前；它不是 Agent 回答。", "blue"),
    spec("build-event", "生成 MemoryEvent", "静态方法", "application/memory/event_factory.py", "MemoryEventFactory._build_event", 250, 283, 268,
         "生成事件 ID，统一填写 MemoryEvent 字段与空字典默认值。", "事件类型和身份、摘要、payload", "MemoryEvent 对象", "uuid.uuid4 → MemoryEvent", "事件 ID 为运行时随机值，页面只保留请求 ID。", "purple"),
    spec("append-runtime", "协调器写入事件", "实例方法", "application/runtime/runtime_coordinator.py", "RuntimeCoordinator._append_memory_event", 681, 697, 693,
         "把构造好的事件转交 SessionMemoryStore 保存。", "user_id、session_id、MemoryEvent", "写入调用完成", "_append_memory_event → append_event", "这里写的是结构化事件，不是完整 Agent 响应。", "orange"),
    spec("append-event", "事件进入进程内存储", "实例方法", "application/runtime/memory/session_memory_store.py", "InMemorySessionMemoryStore.append_event", 55, 63, 63,
         "将事件追加到当前用户会话的事件 deque。", "user_id、session_id、MemoryEvent", "内存事件列表新增一条", "_key → _events[...].append", "存储只在此次临时服务进程内有效；网页保存的是独立采集记录。", "mint"),
    spec("context-boundary", "ContextPipeline.build · 断点前", "断点边界", "application/context/pipeline.py", "ContextPipeline.build", 34, 52, 52,
         "已进入上下文构建函数，并停在 UIContext 校验表达式执行前。", "request_id、session_id、user_id、prompt、raw_ui_context、SessionMemory", "尚无 AgentContextPack；第 52 行尚未执行", "RuntimeCoordinator._run_chat_agent_request → ContextPipeline.build", "第 52 行只作为断点定位展示。AgentUIContext.model_validate 未调用。", "orange"),
]


def step(card_id, label, event, card_ids, detail, evidence="函数追踪 · 8094"):
    return dict(cardId=card_id, cardIds=card_ids, label=label, event=event,
                evidence=evidence, evidenceDetail=detail, duration="未计时", status="observed")


STEPS = [
    step("auth-middleware", "WebSocket 握手进入服务", "auth → ws_session → broker.connect",
         ["auth-middleware", "ws-entry", "broker-connect"], "8094 临时服务的函数追踪记录了这三个入口；本次鉴权关闭。"),
    step("ws-receive", "接收 chat_start 消息", "ws_session · receive_json",
         ["ws-receive", "ws-dispatch"], "请求报文类型为 chat_start；接收循环进入对应分支。"),
    step("ensure-request", "建立请求范围", "ensure_request → _request_scope_key",
         ["ensure-request", "request-scope"], "Gateway 先登记请求 ID；Runtime 入口随后会再次确保它存在。"),
    step("ws-dispatch", "创建并登记后台任务", "create_task → _register_active_task → gate",
         ["ws-dispatch", "register-task", "run-after-register"], "登记与启动函数均在 8094 追踪中出现；异步协程恢复已归并。"),
    step("worker-validate", "校验聊天信封", "_run_agent_request → ChatStartMessage",
         ["worker-validate", "chat-envelope"], "客户端随后收到 ACK，说明此次信封校验成功；协议类属于源码关联。"),
    step("worker-ack", "发送 chat_ack", "_safe_send_json · chat_ack",
         ["worker-ack", "safe-send"], "8094 客户端实际收到 status=accepted；它不是最终回复。", "WS 消息 + 函数追踪 · 8094"),
    step("run-chat-entry", "进入 RuntimeCoordinator", "run_chat_entry → _run_chat_agent_request",
         ["run-chat-entry", "chat-assembly"], "函数追踪记录了聊天入口与请求装配入口。"),
    step("memory-turns", "读取历史记忆", "list_recent → list_recent_events",
         ["memory-turns", "memory-events", "memory-key"], "新进程的本次会话无历史 turn；两类记录均在构建记忆前读取。"),
    step("memory-build", "生成 SessionMemory", "build → _find_active_task → projection.build",
         ["memory-build", "find-active-task", "task-projection"], "断点局部状态显示 recent_turn_count=0、无 active_task、无 task_projection。"),
    step("user-event", "形成用户消息事件", "now_utc_iso → build_user_message_event → _build_event",
         ["utc-time", "user-event", "build-event"], "本轮 prompt 被构造成 user_message_received 事件。"),
    step("append-runtime", "保存用户消息事件", "_append_memory_event → append_event",
         ["append-runtime", "append-event", "memory-key", "event-bucket"], "事件写入本次进程内的会话事件 deque。"),
    step("chat-assembly", "调用上下文管线", "_run_chat_agent_request → ContextPipeline.build",
         ["chat-assembly"], "装配函数执行到第 402 行，调用 ContextPipeline.build。"),
    step("context-boundary", "停在 pipeline.py 第 52 行执行前", "ContextPipeline.build · L52",
         ["context-boundary"], "追踪器在线事件 L52 主动停止；model_validate 尚未运行，后续 Agent 流程未采集。", "断点现场 · 8094"),
]


def git_show(path: str) -> str:
    return subprocess.check_output(["git", "show", f"{COMMIT}:{path}"], cwd=REPOSITORY).decode("utf-8")


def main() -> None:
    trace = json.loads((HERE / "evidence/ordinary-chat-prefix-8094.json").read_text(encoding="utf-8"))
    assert len(trace["hit"]) == 1 and trace["hit"][0]["line"] == 52
    assert trace["hit"][0]["request_id"] == "cfo-prefix-8094-37467f4"
    cache = {}
    cards = []
    for item in SPECS:
        source_file = cache.setdefault(item["file"], git_show(item["file"]))
        lines = source_file.splitlines()
        assert 1 <= item["lineStart"] <= item["focusLine"] <= item["lineEnd"] <= len(lines)
        source = "\n".join(lines[item["lineStart"] - 1:item["lineEnd"]])
        cards.append({**item, "source": source, "sourceHash": hashlib.sha256(source.encode()).hexdigest(),
                      "fileHash": hashlib.sha256(source_file.encode()).hexdigest(), "sourceKind": "fixed-commit-excerpt"})
    data = {
        "id": "sftg-backend-real", "name": "sftg_ai_backend · 真实仓库", "shortName": "sftg_ai_backend",
        "mark": "S", "language": "Python", "kind": "real", "repositoryPath": str(REPOSITORY),
        "scope": "仅普通对话入口至 pipeline.py:52 执行前；不是全仓覆盖",
        "snapshots": [{"id": "37467f4", "name": "develop_echo · 固定提交", "commit": COMMIT,
                       "date": "2026-10-23", "description": "用户指定的固定源码版本"}],
        "cards": cards,
        "scenarios": [{"id": "ordinary-chat-prefix", "name": "普通对话入口 · 断点前", "kind": "WebSocket 对话链路",
                       "prompt": trace["hit"][0]["prompt"], "response": None,
                       "runs": [{"id": "cfo-prefix-8094-37467f4", "snapshotId": "37467f4",
                                 "name": "8094 采集 · 停在 L52 前", "state": "断点前停止", "status": "breakpoint",
                                 "duration": "未计时", "date": "2026-10-23 17:05",
                                 "result": "已收到 chat_ack；追踪器在 pipeline.py:52 执行前主动停止。没有最终回复。停止采集产生的 chat_error 不是业务故障。",
                                 "requestId": trace["hit"][0]["request_id"], "sessionId": trace["hit"][0]["session_id"],
                                 "userId": trace["hit"][0]["user_id"], "uiContext": "采集时使用测试形状：page=workflow_canvas_page，visible.page_state={}；待用实际前端数据核对。",
                                 "traceFile": "evidence/ordinary-chat-prefix-8094.json"}],
                       "steps": STEPS}],
    }
    target = HERE / "real-data.js"
    target.write_text("// Generated by generate_real_data.py from fixed Git commit 37467f4.\n"
                      "export const REAL_REPOSITORY = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n",
                      encoding="utf-8")
    print(f"Wrote {target}: {len(cards)} cards, {len(STEPS)} steps, {len(cache)} files")


if __name__ == "__main__":
    main()
