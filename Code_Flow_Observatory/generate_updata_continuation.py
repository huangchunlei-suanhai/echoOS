"""Build the L53-to-debug_trace.py:178 continuation from the fixed commit and trace."""
from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

HERE = Path(__file__).resolve().parent
ROOT = Path("/home/huangchunlei/workspace/echo/sftg_ai_backend")
COMMIT = "3cb5173064689c277d959dd315e3774112f32d06"
EVIDENCE = "evidence/ordinary-chat-through-debug-trace-178-develop-updata.json"
PREFIX = "src/shaofeng_ai_backend/"


def spec(
    id: str, title: str, kind: str, file: str, symbol: str, start: int, end: int,
    focus: int, purpose: str, input: str, output: str, calls: str, note: str, color: str,
) -> dict[str, object]:
    return dict(id=id, title=title, type=kind, file=PREFIX + file, symbol=symbol,
                lineStart=start, lineEnd=end, focusLine=focus, purpose=purpose,
                input=input, output=output, calls=calls, note=note, color=color)


CARDS = [
    spec("ui-page-state", "页面通用元素协议", "数据模型", "contracts/ui_context.py",
         "AgentUIPageState", 58, 68, 66,
         "声明页面按钮、标题和文本的可定位列表；本次三类列表均为空。",
         "visible.page_state={}", "三个空元组的强类型页面状态",
         "AgentUIVisible.page_state → AgentUIPageState",
         "这是 Pydantic 契约源码关联，构造过程未逐行追踪。", "mint"),
    spec("ui-visible-contract", "页面可见分组协议", "数据模型", "contracts/ui_context.py",
         "AgentUIVisible", 315, 330, 320,
         "要求 page_state，并允许各页面使用自己的可见业务分组。",
         "visible={page_state:{}}", "无业务分组内容的 AgentUIVisible",
         "AgentUIContext.visible → AgentUIVisible",
         "本次没有场景卡片、工作流、画布节点或目标对象。", "blue"),
    spec("ui-context-contract", "前端页面上下文协议", "数据模型", "contracts/ui_context.py",
         "AgentUIContext", 333, 341, 338,
         "把页面标识、可见内容和可选目标约束为一个页面现场模型。",
         "page=scene_center_page、visible.page_state={}", "标准化 AgentUIContext",
         "ContextPipeline.build → AgentUIContext.model_validate",
         "本次是有效的最小测试输入，不是用户真实前端页面快照。", "purple"),
    spec("ui-validate-page", "校验页面适用范围", "实例方法", "contracts/ui_context.py",
         "AgentUIContext.validate_page_scope", 343, 351, 346,
         "检查页面是否需要 scene_id，然后检查可见分组和目标。",
         "标准化的 AgentUIContext", "页面范围校验通过",
         "model_validate → validate_page_scope → _validate_visible_scope/_validate_target_scope",
         "scene_center_page 不要求 scene_id；追踪中此校验调用两次，第二次来自嵌套 AgentContext 校验。", "blue"),
    spec("ui-validate-visible", "校验可见业务分组", "实例方法", "contracts/ui_context.py",
         "AgentUIContext._validate_visible_scope", 353, 376, 373,
         "仅允许当前页面携带所属业务分组；空分组通过。",
         "page=scene_center_page、visible 中业务分组均为空", "无不支持的可见字段",
         "validate_page_scope → _validate_visible_scope",
         "映射表列出所有页面，但本次只判断 scene_center_page；未走错误分支。", "mint"),
    spec("ui-validate-target", "校验页面目标对象", "实例方法", "contracts/ui_context.py",
         "AgentUIContext._validate_target_scope", 378, 403, 380,
         "如果没有显式目标便提前返回；否则核验类型和可见 ID。",
         "target=None", "无需定位目标对象",
         "validate_page_scope → _validate_target_scope",
         "本次在第 380 行提前返回，下面的目标类型/ID 分支未执行。", "peach"),
    spec("pipeline-valid-context", "校验并构建 AgentContext", "实例方法",
         "application/context/pipeline.py", "ContextPipeline.build · L53–72", 52, 72, 53,
         "校验原始页面数据；成功后把请求身份、权限和短期记忆装入 AgentContext。",
         "raw_ui_context、request_id、session_id、user_id、SessionMemory、access_mode",
         "带有效 ui_context 的 AgentContext",
         "AgentUIContext.model_validate → RuntimeIdentity → AgentContext",
         "本次未进入 ValidationError 分支；这里的 L53 已执行，与上一条采集的 L53 前停点不同。", "blue"),
    spec("runtime-identity-contract", "后端请求身份协议", "数据模型", "contracts/context.py",
         "RuntimeIdentity", 13, 19, 18,
         "约束必须由运行时提供的用户 ID 与会话 ID。",
         "user_id、session_id", "非空 RuntimeIdentity",
         "ContextPipeline.build → RuntimeIdentity",
         "Pydantic 模型构造是源码关联；调用点见 pipeline.py:69。", "purple"),
    spec("agent-context-contract", "Agent 标准上下文协议", "数据模型", "contracts/context.py",
         "AgentContext", 34, 48, 44,
         "集中保存请求、访问模式、后端身份、页面现场、记忆与结构化问题。",
         "user_message、access_mode、identity、ui_context、session_memory",
         "可供后续 AgentRequest 使用的可信上下文",
         "ContextPipeline.build → AgentContext → AgentRequest",
         "本次通过页面校验；issues 使用默认空元组，但尚未进入 Agent Engine。", "mint"),
    spec("runtime-chat-handoff", "聊天请求交给共享执行入口", "代码片段",
         "application/runtime/runtime_coordinator.py",
         "RuntimeCoordinator._run_chat_agent_request · L443–457", 443, 457, 451,
         "封装聊天 AgentRequest，判断 blocker，并调用共享执行入口。",
         "AgentContext、session_id、request_id", "进入 _execute_agent_request",
         "ContextPipeline.build → AgentRequest → _execute_agent_request",
         "第 458 行之后的响应、追加输入和记忆收尾均未运行。", "peach"),
    spec("agent-request-contract", "统一 AgentRequest 协议", "数据模型",
         "contracts/agent_request.py", "AgentRequest", 17, 30, 28,
         "把自然语言与结构化命令放入同一请求模型，并保留独立字段。",
         "input_type=chat、context=AgentContext", "聊天 AgentRequest",
         "RuntimeCoordinator._run_chat_agent_request → AgentRequest",
         "本次 command 与 command_context 均为空；这是契约源码关联。", "blue"),
    spec("validate-input-channel", "校验聊天与命令通道互斥", "实例方法",
         "contracts/agent_request.py", "AgentRequest.validate_input_channel", 32, 60, 35,
         "禁止 chat 请求混入命令字段；本次聊天信封通过。",
         "input_type=chat、command=None、command_context=None", "校验后的 AgentRequest",
         "AgentRequest 构造 → validate_input_channel",
         "追踪只经过 chat 判断和最终返回；中间 command 分支未执行。", "purple"),
    spec("runtime-execute-entry", "进入共享请求执行层", "实例方法",
         "application/runtime/runtime_coordinator.py",
         "RuntimeCoordinator._execute_agent_request", 561, 582, 579,
         "绑定本次请求的 TraceContext，然后调用调试记录器记录 request_started。",
         "AgentRequest、can_enter_llm、session_id、request_id",
         "已绑定 Trace，并发起 debug_trace.record 调用",
         "_run_chat_agent_request → bind_trace_context → DebugTraceRecorder.record",
         "第 583 行以后才会进入执行核心；本次在记录器 L178 前停止。", "blue"),
    spec("trace-context-contract", "异步请求 Trace 标识", "数据模型",
         "observability/debug_trace.py", "TraceContext / ContextVar", 61, 75, 65,
         "保存 session_id、request_id、trace_id，并用 ContextVar 关联当前异步任务。",
         "会话 ID、请求 ID、生成的 trace_id", "异步上下文中的 TraceContext",
         "bind_trace_context → _current_context/_current_recorder",
         "Trace ID 实际值未导出；只确认目标记录器能读取到匹配的身份。", "mint"),
    spec("bind-trace-context", "绑定请求级调试上下文", "异步函数",
         "observability/debug_trace.py", "bind_trace_context", 90, 107, 104,
         "创建 TraceContext，并把上下文和记录器绑定到当前异步任务。",
         "session_id、request_id、DebugTraceRecorder", "已进入绑定上下文",
         "_execute_agent_request → bind_trace_context",
         "finally 清理属于异常中止后的收尾，不列入断点前正常流程。", "purple"),
    spec("trace-record-boundary", "调试记录器 L178 执行前", "实例方法",
         "observability/debug_trace.py", "DebugTraceRecorder.record", 161, 178, 178,
         "收到 request_started 调用，停在模式判断表达式执行前。",
         "event=request_started、mode=off、当前 TraceContext",
         "第 178 行未执行；未生成 agent_debug 事件",
         "_execute_agent_request → DebugTraceRecorder.record",
         "本次临时服务使用 off 模式；即使继续运行，L178 的正常路径也会直接返回。", "peach"),
]


def step(card_id: str, label: str, event: str, card_ids: list[str], detail: str,
         evidence: str = "函数与行追踪 · 8094", status: str = "observed") -> dict[str, object]:
    return dict(cardId=card_id, cardIds=card_ids, label=label, event=event,
                evidence=evidence, evidenceDetail=detail, duration="未计时", status=status)


NEW_STEPS = [
    step("pipeline-valid-context", "执行 L53，校验页面现场",
         "ContextPipeline.build → AgentUIContext.model_validate",
         ["pipeline-valid-context", "ui-context-contract", "ui-visible-contract",
          "ui-page-state", "ui-validate-page"],
         "第 53 行执行；scene_center_page 无需 scene_id。Pydantic 内部构造不属于逐行追踪。"),
    step("ui-validate-visible", "检查可见字段与目标",
         "_validate_visible_scope → _validate_target_scope",
         ["ui-validate-visible", "ui-validate-target"],
         "两种校验方法均进入；target=None 在第 380 行提前返回。嵌套 AgentContext 校验又触发一次。"),
    step("agent-context-contract", "形成可信 AgentContext",
         "RuntimeIdentity → AgentContext",
         ["pipeline-valid-context", "runtime-identity-contract", "agent-context-contract"],
         "pipeline.py:65–72 走成功分支；ValidationError 分支未走。模型契约来自固定提交源码。"),
    step("agent-request-contract", "封装并校验聊天请求",
         "AgentRequest(input_type=chat) → validate_input_channel",
         ["runtime-chat-handoff", "agent-request-contract", "validate-input-channel"],
         "runtime_coordinator.py:443–446 构造请求；validator 进入 chat 分支，未带命令字段。"),
    step("runtime-chat-handoff", "判定阻断项并进入执行入口",
         "context.issues → can_enter_llm → _execute_agent_request",
         ["runtime-chat-handoff", "agent-context-contract"],
         "runtime_coordinator.py:447–457 检查 blocker 并调用共享入口；此时尚未进入 Agent Engine。"),
    step("bind-trace-context", "绑定请求 Trace 上下文",
         "_execute_agent_request → bind_trace_context",
         ["runtime-execute-entry", "trace-context-contract", "bind-trace-context"],
         "TraceContext 已绑定；在记录器入口读取到匹配的 session_id 与 request_id。"),
    step("trace-record-boundary", "停在 debug_trace.py 第 178 行执行前",
         "DebugTraceRecorder.record(request_started) · L178",
         ["runtime-execute-entry", "trace-record-boundary"],
         "追踪器在 mode 判断前主动停止；AGENT_DEBUG_MODE=off，未记录调试事件，也未进入 Engine。",
         evidence="断点现场 · 8094", status="breakpoint"),
]


def sha(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def main() -> None:
    prefix = json.loads((HERE / "updata-data.js").read_text(encoding="utf-8")
                        .split(" = ", 1)[1].rsplit(";", 1)[0])
    trace = json.loads((HERE / EVIDENCE).read_text(encoding="utf-8"))
    assert prefix["snapshot"]["commit"] == trace["capture"]["commit"] == COMMIT
    assert trace["checkpoint"]["file"] == "application/context/pipeline.py"
    assert trace["checkpoint"]["line"] == 53
    assert trace["hit"]["file"] == "observability/debug_trace.py"
    assert trace["hit"]["line"] == 178
    assert trace["hit"]["record_event"] == "request_started"
    assert trace["hit"]["trace_session_id"] == "debug-1030fco"
    assert trace["capture"]["stopped_before"] == "observability/debug_trace.py:178"
    assert not any(e["file"] == "observability/debug_trace.py" and
                   e["kind"] == "line" and e["line"] == 178 for e in trace["events"])
    assert [e["type"] for e in trace["capture"]["client_messages"]] == ["chat_ack", "chat_error"]

    cache: dict[str, str] = {}
    def source(path: str) -> str:
        if path not in cache:
            cache[path] = subprocess.check_output(["git", "show", f"{COMMIT}:{path}"],
                                                  cwd=ROOT, text=True)
        return cache[path]

    additions = []
    for item in CARDS:
        path = str(item["file"])
        full = source(path)
        excerpt = "\n".join(full.splitlines()[int(item["lineStart"])-1:int(item["lineEnd"])])
        assert excerpt and int(item["lineStart"]) <= int(item["focusLine"]) <= int(item["lineEnd"])
        additions.append({**item, "source": excerpt, "sourceHash": sha(excerpt),
                          "fileHash": sha(full), "sourceKind": "fixed-commit-excerpt"})
    assert len({item["id"] for item in additions}) == len(additions)
    prefix_steps = prefix["steps"]
    assert prefix_steps[-1]["cardId"] == "context-boundary"
    steps = prefix_steps[:-1] + NEW_STEPS
    all_ids = {item["id"] for item in additions}
    old = json.loads((HERE / "real-data.js").read_text(encoding="utf-8")
                     .split(" = ", 1)[1].rsplit(";", 1)[0])
    all_ids |= {item["id"] for item in old["cards"]}
    all_ids |= {item["id"] for item in prefix["additions"]}
    assert all(set(s["cardIds"]) <= all_ids for s in steps)
    captured_at = datetime.fromisoformat(trace["capture"]["timestamp_utc"])
    local_time = captured_at.astimezone(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d %H:%M")
    run = dict(
        id=trace["hit"]["trace_request_id"], snapshotId=prefix["snapshot"]["id"],
        name="develop_updata · 8094 采集 · debug_trace.py L178 前",
        state="断点前停止", status="breakpoint", duration="未计时", date=local_time,
        response=None,
        result=("已收到 chat_ack；有效的最小页面输入通过校验，构建 AgentContext 和 AgentRequest，"
                "并绑定 Trace。追踪器在 debug_trace.py:178 执行前主动停止；没有调试事件、"
                "Agent Engine 执行或最终回复。随后 chat_error 由主动停止采集导致。"),
        requestId=trace["hit"]["trace_request_id"],
        sessionId=trace["hit"]["trace_session_id"],
        userId=trace["checkpoint"]["user_id"],
        uiContext="采集时使用有效的最小测试页面：page=scene_center_page，visible.page_state={}；并非真实前端快照。",
        accessMode=trace["checkpoint"]["access_mode"], traceFile=EVIDENCE,
    )
    snapshot = dict(
        id=prefix["snapshot"]["id"],
        description="普通对话入口至 debug_trace.py:178 执行前",
        breakpointFile="debug_trace.py", breakpointLine=178,
        scope="仅普通对话入口至 debug_trace.py:178 执行前；不是全仓覆盖",
    )
    data = dict(snapshot=snapshot, run=run, steps=steps, additions=additions)
    (HERE / "continuation-data.js").write_text(
        "// Generated from develop_updata at a fixed commit; earlier snapshots and runs stay intact.\n"
        + "export const UPDATA_CONTINUATION = "
        + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"{len(steps)} steps, {len(additions)} new cards, {len(all_ids)} total cards")


if __name__ == "__main__":
    main()
