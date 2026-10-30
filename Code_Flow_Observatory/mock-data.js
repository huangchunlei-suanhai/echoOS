const card = (id, title, type, file, symbol, lineStart, source, purpose, input, output, calls, note, color = "mint") => ({
  id, title, type, file, symbol, lineStart, source, purpose, input, output, calls, note, color,
});

const gatewayCards = [
  card("ws-session", "WebSocket · 会话入口", "入口函数", "src/shaofeng_ai_backend/presentation/fastapi_gateway/application.py", "ws_session", 112,
`async def ws_session(websocket: WebSocket, session_id: str):
    await websocket.accept()
    while True:
        ws_message = await websocket.receive_json()
        request_id = coordinator.ensure_request(
            ws_message.get("request_id"), session_id=session_id
        )
        ws_message["request_id"] = request_id
        task = asyncio.create_task(_run_agent_request(ws_message))
        active_tasks[request_id] = task`,
    "为一个 WebSocket 会话接收消息，并把耗时请求交给后台任务处理。", "WebSocket 连接、session_id、前端 JSON 消息", "启动后台请求任务，并保持接收循环可继续处理消息", "ensure_request → _run_agent_request", "实际入口细节需绑定真实仓库版本核对。", "mint"),
  card("request-worker", "请求校验与 ACK", "异步函数", "src/shaofeng_ai_backend/presentation/fastapi_gateway/application.py", "_run_agent_request", 181,
`async def _run_agent_request(ws_message: dict[str, Any]) -> None:
    request_id = str(ws_message["request_id"])
    msg_type = str(ws_message.get("type") or "")
    try:
        message = (
            ChatStartMessage.model_validate(ws_message)
            if msg_type == "chat_start"
            else AgentCommandMessage.model_validate(ws_message)
        )
    except ValidationError as exc:
        await _safe_send_json({"type": "chat_error", "message": str(exc)})
        return
    ack_sent = await _safe_send_json({"type": "chat_ack", "status": "accepted"})`,
    "按消息类型校验 WebSocket 信封；校验通过后先向客户端确认接收。", "包含 type、request_id 等字段的消息字典", "有效消息得到 ACK；无效消息返回错误并结束处理", "ChatStartMessage / AgentCommandMessage → _safe_send_json", "示例代码为设计占位，字段和异常处理以真实源码为准。", "blue"),
  card("safe-send", "连接状态 · 安全发送", "辅助函数", "src/shaofeng_ai_backend/presentation/fastapi_gateway/application.py", "_safe_send_json", 156,
`async def _safe_send_json(payload: dict[str, Any]) -> bool:
    nonlocal connection_closed
    if connection_closed:
        return False
    try:
        await websocket.send_json(payload)
        return True
    except (RuntimeError, WebSocketDisconnect):
        connection_closed = True
        logger.info("ws send skipped after disconnect session=%s", session_id)
        return False`,
    "封装 WebSocket JSON 发送，并记住当前连接是否已经断开。", "准备发送的 JSON payload", "返回发送是否成功；断连后跳过后续发送", "websocket.send_json → WebSocketDisconnect", "连接级状态示意。", "purple"),
  card("coordinator", "RuntimeCoordinator · 请求调度", "类方法", "src/shaofeng_ai_backend/application/runtime/runtime_coordinator.py", "RuntimeCoordinator.run_chat_entry", 94,
`async def run_chat_entry(
    self, session_id: str, user_id: str, prompt: str,
    ui_context: AgentUIContext | None = None,
    request_id: str | None = None,
) -> AgentResponse:
    rid = self.ensure_request(request_id, session_id=session_id)
    try:
        return await self._run_chat_agent_request(
            session_id=session_id, user_id=user_id,
            prompt=prompt, ui_context=ui_context, request_id=rid,
        )
    finally:
        self.finish_request(rid, session_id=session_id)`,
    "协调一次自然语言请求的生命周期，并在结束时清理请求状态。", "会话 ID、用户 ID、prompt、UI 上下文、request_id", "AgentResponse；请求状态在 finally 中清理", "ensure_request → _run_chat_agent_request → finish_request", "代码结构为演示占位。", "blue"),
  card("ensure-request", "ensure_request · 请求登记", "实例方法", "src/shaofeng_ai_backend/application/runtime/runtime_coordinator.py", "RuntimeCoordinator.ensure_request", 241,
`def ensure_request(
    self, request_id: str | None, session_id: str | None = None
) -> str:
    rid = (request_id or "").strip() or f"req_{uuid.uuid4().hex}"
    scope_key = self._request_scope_key(rid, session_id)
    if scope_key not in self._request_cancel_map:
        self._request_cancel_map[scope_key] = False
    return rid`,
    "确保请求有标准化 ID，并在取消状态表中登记初始状态。", "可选 request_id、可选 session_id", "标准化后的请求 ID 字符串", "_request_scope_key → _request_cancel_map", "示例根据需求草稿整理，需对照固定提交审核。", "orange"),
  card("memory-store", "InMemorySessionMemoryStore · 读取近期记忆", "实例方法", "src/shaofeng_ai_backend/application/runtime/memory/session_memory_store.py", "InMemorySessionMemoryStore.list_recent", 51,
`def list_recent(
    self, user_id: str, session_id: str, limit: int = 12
) -> list[SessionMemoryRecord]:
    records = list(
        self._records.get(self._key(user_id=user_id, session_id=session_id), [])
    )
    return records[-max(1, limit):]`,
    "按用户和会话取出最近的记忆记录，供本轮上下文构建使用。", "user_id、session_id、可选 limit", "最近 limit 条 SessionMemoryRecord", "_key → _records", "内存存储示意。", "mint"),
  card("context-build", "ContextPipeline · 组装上下文", "构建阶段", "src/shaofeng_ai_backend/application/context/context_pipeline.py", "ContextPipeline.build", 76,
`def build(self, request: AgentRequest) -> ContextPack:
    identity = self.identity_resolver.resolve(request.user_id)
    ui_facts = self.ui_context_collector.collect(request.ui_context)
    memory = self.memory_builder.build(request.memory_records)
    return ContextPack(
        identity=identity,
        ui_facts=ui_facts,
        memory=memory,
        user_message=request.prompt,
    )`,
    "把用户身份、界面事实、会话记忆和本轮输入整理成统一上下文。", "AgentRequest、UIContext、近期记忆", "可供路由与能力阶段使用的 ContextPack", "identity_resolver / ui_context_collector / memory_builder", "这是流程图中的占位步骤，尚无真实运行事件。", "purple"),
  card("router", "AgentTaskRouter · 意图路由", "路由阶段", "src/shaofeng_ai_backend/application/routing/agent_task_router.py", "AgentTaskRouter.route", 118,
`async def route(self, context: ContextPack) -> RouteDecision:
    prompt = self.prompt_builder.for_routing(context)
    raw_result = await self.model.ainvoke(
        prompt, task_type="intent"
    )
    decision = RouteDecision.model_validate_json(raw_result)
    return self.policy.validate(decision, context)`,
    "根据本轮上下文得到结构化路由结果，并由程序执行格式与策略校验。", "ContextPack、路由提示和模型配置", "RouteDecision，例如 platform_qa", "model.ainvoke → RouteDecision 校验", "请在真实链路接入后确认模型调用与分支。", "orange"),
  card("capability", "PlatformQACapability · 平台问答", "能力阶段", "src/shaofeng_ai_backend/application/capabilities/platform_qa.py", "PlatformQACapability.handle", 63,
`async def handle(self, context: ExecutionContext) -> AgentResponse:
    prompt_context = self.preparer.prepare(context)
    answer = await self.model.ainvoke(
        prompt_context, task_type="chat_reply"
    )
    return AgentResponse(
        status="succeeded",
        task_type="platform_qa",
        message=answer,
    )`,
    "承接平台问答任务，准备回答上下文并生成结构化响应。", "ExecutionContext、平台问答材料", "AgentResponse", "ExecutionPreparer → model.ainvoke → AgentResponse", "此代码只用于展示卡片布局。", "blue"),
  card("chat-final", "chat_final · 返回最终结果", "传输出口", "src/shaofeng_ai_backend/presentation/fastapi_gateway/application.py", "_run_agent_request", 228,
`final_payload = {
    "type": "chat_final",
    "request_id": request_id,
    "session_id": session_id,
    "response": response.model_dump(),
}
await _safe_send_json(final_payload)
coordinator.finish_request(request_id, session_id=session_id)
await _pop_active_task(request_id, asyncio.current_task())
active_tasks.pop(request_id, None)`,
    "把 AgentResponse 包装成 WebSocket 最终消息，并清理活动任务登记。", "AgentResponse、request_id、session_id", "chat_final 消息发往前端", "_safe_send_json → task cleanup", "把业务完成和客户端确实收到消息区分显示。", "mint"),
];

const workflowCards = [
  card("workflow-route", "WorkflowRequest · 识别工作流意图", "路由阶段", "src/shaofeng_ai_backend/application/routing/agent_task_router.py", "AgentTaskRouter.route", 118,
`decision = await task_router.route(context)
if decision.task_type == "workflow_create":
    plan = workflow_planner.build(context)
    return await workflow_capability.handle(plan)`,
  "识别创建类意图，并把请求交给工作流规划能力。", "用户请求和当前工作区上下文", "工作流创建计划", "TaskRouter → WorkflowPlanner", "仅为场景切换演示。", "orange"),
  card("workflow-plan", "WorkflowPlanner · 生成创建计划", "规划阶段", "src/shaofeng_ai_backend/application/workflows/workflow_planner.py", "WorkflowPlanner.build", 42,
`def build(self, context: ContextPack) -> WorkflowPlan:
    requirements = self.extract_requirements(context)
    nodes = self.select_node_templates(requirements)
    return WorkflowPlan(requirements=requirements, nodes=nodes)`,
  "把自然语言需求整理成节点和连线组成的计划。", "ContextPack、节点模板", "WorkflowPlan", "extract_requirements → select_node_templates", "仅为场景切换演示。", "purple"),
  card("workflow-save", "WorkflowStore · 保存工作流", "持久化", "src/shaofeng_ai_backend/infrastructure/workflow_store.py", "WorkflowStore.save", 88,
`async def save(self, plan: WorkflowPlan) -> WorkflowRecord:
    record = WorkflowRecord.from_plan(plan)
    await self.repository.insert(record)
    return record`,
  "将已确认的工作流计划保存到仓库。", "WorkflowPlan", "WorkflowRecord", "repository.insert", "仅为场景切换演示。", "mint"),
];

const nodeCards = [
  card("node-request", "NodeBuildRequest · 校验生成参数", "请求校验", "src/shaofeng_ai_backend/contracts/node_build.py", "NodeBuildRequest", 17,
`class NodeBuildRequest(BaseModel):
    node_type: str
    node_id: str
    config: dict[str, object]

    @field_validator("node_id")
    @classmethod
    def validate_node_id(cls, value: str) -> str:
        return value.strip()`,
  "校验节点生成所需的类型、标识和配置。", "node_type、node_id、config", "校验后的请求对象", "Pydantic model validation", "仅为场景切换演示。", "blue"),
  card("node-template", "TemplateResolver · 查找节点模板", "模板解析", "src/shaofeng_ai_backend/application/nodes/template_resolver.py", "TemplateResolver.resolve", 52,
`def resolve(self, node_type: str) -> NodeTemplate:
    template = self.registry.get(node_type)
    if template is None:
        raise UnknownNodeType(node_type)
    return template`,
  "按节点类型找到对应代码模板，并处理未知类型。", "node_type、模板注册表", "NodeTemplate", "registry.get → UnknownNodeType", "仅为场景切换演示。", "orange"),
  card("node-render", "NodeRenderer · 写出节点文件", "文件生成", "src/shaofeng_ai_backend/application/nodes/node_renderer.py", "NodeRenderer.render", 101,
`def render(self, template: NodeTemplate, config: dict) -> str:
    source = template.render(config)
    self.syntax_check(source)
    return source`,
  "根据模板和配置生成节点源码，并执行基础语法检查。", "NodeTemplate、节点配置", "节点源码文本", "template.render → syntax_check", "仅为场景切换演示。", "mint"),
];

const makeSteps = (ids, labels, events, durations, staticIndices = []) => ids.map((id, index) => ({
  cardId: id, label: labels[index], event: events[index], duration: durations[index], status: "success",
  evidence: staticIndices.includes(index) ? "源码关联 · 演示" : "运行事件 · 演示",
}));

export const REPOSITORIES = [
  {
    id: "echoos-demo", name: "EchoOS Agent Platform", shortName: "EchoOS Agent", mark: "E", language: "Python",
    snapshots: [
      { id: "demo-main", name: "学习快照 · demo-main", commit: "a17c2df", date: "2026-10-22", description: "普通对话入口演示版本" },
      { id: "demo-previous", name: "学习快照 · demo-previous", commit: "7e90c4a", date: "2026-10-11", description: "前一版演示源码" },
    ],
    cards: [...gatewayCards, ...workflowCards, ...nodeCards],
    scenarios: [
      { id: "chat", name: "普通对话入口", kind: "对话链路", prompt: "你好，请简要说明你能帮我做什么。", response: "你好！我是 EchoOS 智能协作助手，可以帮助你了解工作台、梳理任务，并协助完成流程操作。", runs: [{ id: "chat-run-02", snapshotId: "demo-main", name: "成功运行 · 10:42", state: "已完成", duration: "8.42 s", date: "今天 10:42", status: "success" }, { id: "chat-run-01", snapshotId: "demo-main", name: "连接中断 · 10:16", state: "采集不完整", duration: "—", date: "今天 10:16", status: "partial", stepCount: 4, response: null }, { id: "chat-run-previous", snapshotId: "demo-previous", name: "旧版演示运行", state: "已完成", duration: "9.03 s", date: "2026-10-11", status: "success" }],
        steps: makeSteps(["ws-session", "request-worker", "safe-send", "coordinator", "memory-store", "context-build", "router", "capability", "chat-final"], ["接收 WebSocket 消息", "校验请求信封", "发送 chat_ack", "进入请求协调器", "读取近期会话记忆", "组装本轮上下文", "识别任务类型", "执行平台问答能力", "返回 chat_final"], ["gateway.message_received", "gateway.message_validated", "gateway.chat_ack_sent", "runtime.request_started", "memory.records_loaded", "context.build_source", "router.decision_ready", "capability.response_created", "gateway.chat_final_sent"], ["12 ms", "4 ms", "2 ms", "3 ms", "1 ms", "—", "2.11 s", "6.24 s", "5 ms"], [5]) },
      { id: "workflow", name: "工作流创建", kind: "创建链路", prompt: "帮我新建一个简单的数据清洗工作流。", response: "已生成一个包含输入、清洗和输出节点的工作流草案。", runs: [{ id: "workflow-run-01", snapshotId: "demo-main", name: "演示运行 · 09:35", state: "已完成", duration: "5.18 s", date: "今天 09:35", status: "success" }, { id: "workflow-run-previous", snapshotId: "demo-previous", name: "旧版演示运行", state: "已完成", duration: "5.44 s", date: "2026-10-11", status: "success" }],
        steps: makeSteps(["workflow-route", "workflow-plan", "workflow-save"], ["识别创建意图", "规划工作流节点", "保存工作流草案"], ["router.decision_ready", "workflow.plan_built", "workflow.saved"], ["1.8 s", "2.9 s", "480 ms"]) },
      { id: "node", name: "节点文件生成", kind: "生成链路", prompt: "生成一个 CSV 输入节点。", response: "节点文件已生成并通过基础语法检查。", runs: [{ id: "node-run-01", snapshotId: "demo-main", name: "演示运行 · 昨天", state: "已完成", duration: "1.36 s", date: "昨天 16:20", status: "success" }, { id: "node-run-previous", snapshotId: "demo-previous", name: "旧版演示运行", state: "已完成", duration: "1.52 s", date: "2026-10-11", status: "success" }],
        steps: makeSteps(["node-request", "node-template", "node-render"], ["校验节点请求", "解析节点模板", "渲染并检查源码"], ["node.request_validated", "node.template_resolved", "node.source_rendered"], ["3 ms", "17 ms", "1.34 s"]) },
    ],
  },
  {
    id: "flow-studio-demo", name: "Flow Studio 示例仓库", shortName: "Flow Studio", mark: "F", language: "TypeScript",
    snapshots: [
      { id: "studio-24", name: "学习快照 · 2.4.0", commit: "f4a920b", date: "2026-10-19", description: "画布保存流程演示版本" },
      { id: "studio-23", name: "学习快照 · 2.3.1", commit: "0917da3", date: "2026-10-02", description: "上一版画布源码" },
    ],
    cards: [
      card("canvas-save", "Canvas · 保存画布", "函数", "src/features/canvas/useCanvasSave.ts", "useCanvasSave", 24,
`export function useCanvasSave() {
  const save = async (graph: CanvasGraph) => {
    const payload = serializeGraph(graph);
    await workflowApi.save(payload);
    return { savedAt: Date.now(), nodeCount: graph.nodes.length };
  };
  return { save };
}`,
      "将画布状态序列化后提交给工作流 API。", "CanvasGraph", "保存时间和节点数量", "serializeGraph → workflowApi.save", "第二个假仓库，用于展示仓库切换。", "blue"),
      card("serialize-graph", "serializeGraph · 图数据序列化", "纯函数", "src/features/canvas/serializeGraph.ts", "serializeGraph", 10,
`export function serializeGraph(graph: CanvasGraph): SaveWorkflowPayload {
  return {
    nodes: graph.nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: graph.edges.map(({ id, source, target }) => ({ id, source, target })),
  };
}`,
      "挑选持久化所需字段，生成稳定的保存请求数据。", "CanvasGraph", "SaveWorkflowPayload", "graph.nodes.map / graph.edges.map", "第二个假仓库，用于展示仓库切换。", "mint"),
      card("workflow-api", "workflowApi.save · 请求接口", "API 函数", "src/services/workflowApi.ts", "workflowApi.save", 38,
`async function save(payload: SaveWorkflowPayload) {
  const response = await fetch("/api/workflows", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("保存失败");
  return response.json();
}`,
      "将序列化后的画布数据发送给后端接口。", "SaveWorkflowPayload", "服务端保存结果", "fetch → response.json", "第二个假仓库，用于展示仓库切换。", "orange"),
    ],
    scenarios: [{ id: "canvas-save-flow", name: "保存工作流画布", kind: "前端交互链路", prompt: "点击画布右上角的保存按钮。", response: "画布保存完成，3 个节点已写入工作流。", runs: [{ id: "canvas-run-01", snapshotId: "studio-24", name: "演示运行 · 14:08", state: "已完成", duration: "248 ms", date: "今天 14:08", status: "success" }, { id: "canvas-run-previous", snapshotId: "studio-23", name: "旧版演示运行", state: "已完成", duration: "301 ms", date: "2026-10-02", status: "success" }],
      steps: makeSteps(["canvas-save", "serialize-graph", "workflow-api"], ["触发画布保存", "整理请求数据", "发送保存请求"], ["ui.save_clicked", "canvas.serialized", "api.workflow_saved"], ["2 ms", "4 ms", "242 ms"]) }],
  },
];

export const SNAPSHOT_DIFFS = {
  "echoos-demo": [
    { file: "runtime_coordinator.py", kind: "修改", summary: "请求结束清理逻辑从主路径移至 finally。", change: "+ finally: finish_request(rid, session_id=session_id)" },
    { file: "session_memory_store.py", kind: "修改", summary: "近期记忆查询的默认 limit 从 8 改为 12。", change: "+ limit: int = 12" },
    { file: "application.py", kind: "修改", summary: "WebSocket 断连后的重复发送会被跳过。", change: "+ if connection_closed: return False" },
  ],
  "flow-studio-demo": [
    { file: "useCanvasSave.ts", kind: "修改", summary: "保存结果新增节点数量，便于界面展示。", change: "+ return { savedAt: Date.now(), nodeCount: graph.nodes.length };" },
  ],
};

export const SNAPSHOT_SOURCE_VARIANTS = {
  "echoos-demo": {
    "demo-previous": {
      "coordinator": `async def run_chat_entry(
    self, session_id: str, user_id: str, prompt: str,
    ui_context: AgentUIContext | None = None,
    request_id: str | None = None,
) -> AgentResponse:
    rid = self.ensure_request(request_id, session_id=session_id)
    response = await self._run_chat_agent_request(
        session_id=session_id, user_id=user_id,
        prompt=prompt, ui_context=ui_context, request_id=rid,
    )
    self.finish_request(rid, session_id=session_id)
    return response`,
      "memory-store": `def list_recent(
    self, user_id: str, session_id: str, limit: int = 8
) -> list[SessionMemoryRecord]:
    records = list(
        self._records.get(self._key(user_id=user_id, session_id=session_id), [])
    )
    return records[-max(1, limit):]`,
      "safe-send": `async def _safe_send_json(payload: dict[str, Any]) -> bool:
    nonlocal connection_closed
    try:
        await websocket.send_json(payload)
        return True
    except (RuntimeError, WebSocketDisconnect):
        connection_closed = True
        logger.info("ws send skipped after disconnect session=%s", session_id)
        return False`,
    },
  },
  "flow-studio-demo": {
    "studio-23": {
      "canvas-save": `export function useCanvasSave() {
  const save = async (graph: CanvasGraph) => {
    const payload = serializeGraph(graph);
    await workflowApi.save(payload);
    return { savedAt: Date.now() };
  };
  return { save };
}`,
    },
  },
};
