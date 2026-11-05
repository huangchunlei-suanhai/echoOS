// Generated from develop_updata at a fixed commit; earlier snapshots and runs stay intact.
export const UPDATA_CONTINUATION = {
  "snapshot": {
    "id": "3cb5173",
    "description": "普通对话入口至 debug_trace.py:178 执行前",
    "breakpointFile": "debug_trace.py",
    "breakpointLine": 178,
    "scope": "仅普通对话入口至 debug_trace.py:178 执行前；不是全仓覆盖"
  },
  "run": {
    "id": "cfo-segment-1030-3cb5173",
    "snapshotId": "3cb5173",
    "name": "develop_updata · 8094 采集 · debug_trace.py L178 前",
    "state": "断点前停止",
    "status": "breakpoint",
    "duration": "未计时",
    "date": "2026-10-30 16:35",
    "response": null,
    "result": "已收到 chat_ack；有效的最小页面输入通过校验，构建 AgentContext 和 AgentRequest，并绑定 Trace。追踪器在 debug_trace.py:178 执行前主动停止；没有调试事件、Agent Engine 执行或最终回复。随后 chat_error 由主动停止采集导致。",
    "requestId": "cfo-segment-1030-3cb5173",
    "sessionId": "debug-1030fco",
    "userId": "2113153353906343938",
    "uiContext": "采集时使用有效的最小测试页面：page=scene_center_page，visible.page_state={}；并非真实前端快照。",
    "accessMode": "restricted",
    "traceFile": "evidence/ordinary-chat-through-debug-trace-178-develop-updata.json"
  },
  "steps": [
    {
      "cardId": "auth-middleware",
      "cardIds": [
        "auth-middleware",
        "ws-entry",
        "broker-connect"
      ],
      "label": "WebSocket 握手进入服务",
      "event": "auth → ws_session → broker.connect",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "8094 临时服务的函数追踪记录了这三个入口；本次鉴权关闭。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "ws-receive",
      "cardIds": [
        "ws-receive",
        "ws-dispatch"
      ],
      "label": "接收 chat_start 消息",
      "event": "ws_session · receive_json",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "请求报文类型为 chat_start；接收循环进入对应分支。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "ensure-request",
      "cardIds": [
        "ensure-request",
        "request-scope"
      ],
      "label": "建立请求范围",
      "event": "ensure_request → _request_scope_key",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "Gateway 先登记请求 ID；Runtime 入口随后会再次确保它存在。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "ws-dispatch",
      "cardIds": [
        "ws-dispatch",
        "register-task",
        "run-after-register"
      ],
      "label": "创建并登记后台任务",
      "event": "create_task → _register_active_task → gate",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "登记与启动函数均在 8094 追踪中出现；异步协程恢复已归并。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "worker-validate",
      "cardIds": [
        "worker-validate",
        "chat-envelope"
      ],
      "label": "校验聊天信封",
      "event": "_run_agent_request → ChatStartMessage",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "客户端随后收到 ACK，说明此次信封校验成功；协议类属于源码关联。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "open-user-input-channel",
      "cardIds": [
        "open-user-input-channel",
        "inbox-open",
        "request-inbox-init"
      ],
      "label": "ACK 前打开用户输入队列",
      "event": "open_user_input_channel → inbox.open → _RequestInbox",
      "evidence": "函数追踪 · 8094",
      "duration": "未计时",
      "status": "observed",
      "evidenceDetail": "三处函数调用都在新分支追踪中出现；没有发送 chat_steer。"
    },
    {
      "cardId": "worker-ack",
      "cardIds": [
        "worker-ack",
        "safe-send"
      ],
      "label": "发送 chat_ack",
      "event": "_safe_send_json · chat_ack",
      "evidence": "WS 消息 + 函数追踪 · 8094",
      "evidenceDetail": "8094 客户端实际收到 status=accepted；它不是最终回复。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "run-chat-entry",
      "cardIds": [
        "run-chat-entry",
        "chat-assembly"
      ],
      "label": "进入 RuntimeCoordinator",
      "event": "run_chat_entry → _run_chat_agent_request",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "函数追踪记录了聊天入口与请求装配入口。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "memory-turns",
      "cardIds": [
        "memory-turns",
        "memory-events",
        "memory-key"
      ],
      "label": "读取历史记忆",
      "event": "list_recent → list_recent_events",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "新进程的本次会话无历史 turn；两类记录均在构建记忆前读取。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "memory-build",
      "cardIds": [
        "memory-build",
        "find-active-task",
        "task-projection"
      ],
      "label": "生成 SessionMemory",
      "event": "build → _find_active_task → projection.build",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "断点局部状态显示 recent_turn_count=0、无 active_task、无 task_projection。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "user-event",
      "cardIds": [
        "utc-time",
        "user-event",
        "build-event"
      ],
      "label": "形成用户消息事件",
      "event": "now_utc_iso → build_user_message_event → _build_event",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "本轮 prompt 被构造成 user_message_received 事件。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "append-runtime",
      "cardIds": [
        "append-runtime",
        "append-event",
        "memory-key",
        "event-bucket"
      ],
      "label": "保存用户消息事件",
      "event": "_append_memory_event → append_event",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "事件写入本次进程内的会话事件 deque。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "chat-assembly",
      "cardIds": [
        "chat-assembly"
      ],
      "label": "调用上下文管线",
      "event": "_run_chat_agent_request → ContextPipeline.build",
      "evidence": "函数追踪 · 8094",
      "evidenceDetail": "装配函数执行到第 434 行，调用 ContextPipeline.build；第 443 行 AgentRequest 尚未构造。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "pipeline-valid-context",
      "cardIds": [
        "pipeline-valid-context",
        "ui-context-contract",
        "ui-visible-contract",
        "ui-page-state",
        "ui-validate-page"
      ],
      "label": "执行 L53，校验页面现场",
      "event": "ContextPipeline.build → AgentUIContext.model_validate",
      "evidence": "函数与行追踪 · 8094",
      "evidenceDetail": "第 53 行执行；scene_center_page 无需 scene_id。Pydantic 内部构造不属于逐行追踪。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "ui-validate-visible",
      "cardIds": [
        "ui-validate-visible",
        "ui-validate-target"
      ],
      "label": "检查可见字段与目标",
      "event": "_validate_visible_scope → _validate_target_scope",
      "evidence": "函数与行追踪 · 8094",
      "evidenceDetail": "两种校验方法均进入；target=None 在第 380 行提前返回。嵌套 AgentContext 校验又触发一次。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "agent-context-contract",
      "cardIds": [
        "pipeline-valid-context",
        "runtime-identity-contract",
        "agent-context-contract"
      ],
      "label": "形成可信 AgentContext",
      "event": "RuntimeIdentity → AgentContext",
      "evidence": "函数与行追踪 · 8094",
      "evidenceDetail": "pipeline.py:65–72 走成功分支；ValidationError 分支未走。模型契约来自固定提交源码。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "agent-request-contract",
      "cardIds": [
        "runtime-chat-handoff",
        "agent-request-contract",
        "validate-input-channel"
      ],
      "label": "封装并校验聊天请求",
      "event": "AgentRequest(input_type=chat) → validate_input_channel",
      "evidence": "函数与行追踪 · 8094",
      "evidenceDetail": "runtime_coordinator.py:443–446 构造请求；validator 进入 chat 分支，未带命令字段。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "runtime-chat-handoff",
      "cardIds": [
        "runtime-chat-handoff",
        "agent-context-contract"
      ],
      "label": "判定阻断项并进入执行入口",
      "event": "context.issues → can_enter_llm → _execute_agent_request",
      "evidence": "函数与行追踪 · 8094",
      "evidenceDetail": "runtime_coordinator.py:447–457 检查 blocker 并调用共享入口；此时尚未进入 Agent Engine。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "bind-trace-context",
      "cardIds": [
        "runtime-execute-entry",
        "trace-context-contract",
        "bind-trace-context"
      ],
      "label": "绑定请求 Trace 上下文",
      "event": "_execute_agent_request → bind_trace_context",
      "evidence": "函数与行追踪 · 8094",
      "evidenceDetail": "TraceContext 已绑定；在记录器入口读取到匹配的 session_id 与 request_id。",
      "duration": "未计时",
      "status": "observed"
    },
    {
      "cardId": "trace-record-boundary",
      "cardIds": [
        "runtime-execute-entry",
        "trace-record-boundary"
      ],
      "label": "停在 debug_trace.py 第 178 行执行前",
      "event": "DebugTraceRecorder.record(request_started) · L178",
      "evidence": "断点现场 · 8094",
      "evidenceDetail": "追踪器在 mode 判断前主动停止；AGENT_DEBUG_MODE=off，未记录调试事件，也未进入 Engine。",
      "duration": "未计时",
      "status": "breakpoint"
    }
  ],
  "additions": [
    {
      "id": "ui-page-state",
      "title": "页面通用元素协议",
      "type": "数据模型",
      "file": "src/shaofeng_ai_backend/contracts/ui_context.py",
      "symbol": "AgentUIPageState",
      "lineStart": 58,
      "lineEnd": 68,
      "focusLine": 66,
      "purpose": "声明页面按钮、标题和文本的可定位列表；本次三类列表均为空。",
      "input": "visible.page_state={}",
      "output": "三个空元组的强类型页面状态",
      "calls": "AgentUIVisible.page_state → AgentUIPageState",
      "note": "这是 Pydantic 契约源码关联，构造过程未逐行追踪。",
      "color": "mint",
      "source": "class AgentUIPageState(BaseModel):\n    \"\"\"页面通用 UI 元素快照。\n\n    三类元素使用数组而不是单对象，保证页面存在多个按钮或提示时仍能保持统一形状。\n    \"\"\"\n\n    model_config = ConfigDict(extra=\"forbid\", str_strip_whitespace=True)\n\n    button: tuple[AgentUIPageElement, ...] = ()\n    title: tuple[AgentUIPageElement, ...] = ()\n    text: tuple[AgentUIPageElement, ...] = ()",
      "sourceHash": "0d3570b57fcda0fe4fbcc9fb158016e0063c057a355bfc638c878f4841cbbbaa",
      "fileHash": "365e39523c419c7a50d909211e08a9d08b207c6acdf1490bfa6a01afdda3dd12",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "ui-visible-contract",
      "title": "页面可见分组协议",
      "type": "数据模型",
      "file": "src/shaofeng_ai_backend/contracts/ui_context.py",
      "symbol": "AgentUIVisible",
      "lineStart": 315,
      "lineEnd": 330,
      "focusLine": 320,
      "purpose": "要求 page_state，并允许各页面使用自己的可见业务分组。",
      "input": "visible={page_state:{}}",
      "output": "无业务分组内容的 AgentUIVisible",
      "calls": "AgentUIContext.visible → AgentUIVisible",
      "note": "本次没有场景卡片、工作流、画布节点或目标对象。",
      "color": "blue",
      "source": "class AgentUIVisible(BaseModel):\n    \"\"\"十个页面共享的 visible 分组容器。\"\"\"\n\n    model_config = ConfigDict(extra=\"forbid\", str_strip_whitespace=True)\n\n    page_state: AgentUIPageState\n    scenes: tuple[AgentUISceneSnapshot, ...] = ()\n    apps: tuple[AgentUIAppSnapshot, ...] = ()\n    workflows: tuple[AgentUIWorkflowSnapshot, ...] = ()\n    library_nodes: tuple[AgentUILibraryNodeSnapshot, ...] = ()\n    canvas_detail: AgentUICanvasSnapshot | None = None\n    tasks: tuple[AgentUITaskSnapshot, ...] = ()\n    reports: tuple[AgentUIReportSnapshot, ...] = ()\n    knowledge_entries: tuple[AgentUIKnowledgeEntrySnapshot, ...] = ()\n    scene_packages: tuple[AgentUIScenePackageSnapshot, ...] = ()\n    account_applications: tuple[AgentUIAccountApplicationSnapshot, ...] = ()",
      "sourceHash": "50023af1f328e36514609b4023435e002daeb9dfbe400d4f50e26a1a041d1c52",
      "fileHash": "365e39523c419c7a50d909211e08a9d08b207c6acdf1490bfa6a01afdda3dd12",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "ui-context-contract",
      "title": "前端页面上下文协议",
      "type": "数据模型",
      "file": "src/shaofeng_ai_backend/contracts/ui_context.py",
      "symbol": "AgentUIContext",
      "lineStart": 333,
      "lineEnd": 341,
      "focusLine": 338,
      "purpose": "把页面标识、可见内容和可选目标约束为一个页面现场模型。",
      "input": "page=scene_center_page、visible.page_state={}",
      "output": "标准化 AgentUIContext",
      "calls": "ContextPipeline.build → AgentUIContext.model_validate",
      "note": "本次是有效的最小测试输入，不是用户真实前端页面快照。",
      "color": "purple",
      "source": "class AgentUIContext(BaseModel):\n    \"\"\"前端上报的十页面工作台现场索引。\"\"\"\n\n    model_config = ConfigDict(extra=\"forbid\", str_strip_whitespace=True)\n\n    page: AgentUIPage\n    scene_id: str | None = Field(default=None, min_length=1)\n    visible: AgentUIVisible\n    target: AgentUITarget | None = None",
      "sourceHash": "149b42e6f1ca42d90a9e9b1bb7e6c1b4c1039d4e047491782d9782ec1b8e0b11",
      "fileHash": "365e39523c419c7a50d909211e08a9d08b207c6acdf1490bfa6a01afdda3dd12",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "ui-validate-page",
      "title": "校验页面适用范围",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/contracts/ui_context.py",
      "symbol": "AgentUIContext.validate_page_scope",
      "lineStart": 343,
      "lineEnd": 351,
      "focusLine": 346,
      "purpose": "检查页面是否需要 scene_id，然后检查可见分组和目标。",
      "input": "标准化的 AgentUIContext",
      "output": "页面范围校验通过",
      "calls": "model_validate → validate_page_scope → _validate_visible_scope/_validate_target_scope",
      "note": "scene_center_page 不要求 scene_id；追踪中此校验调用两次，第二次来自嵌套 AgentContext 校验。",
      "color": "blue",
      "source": "    @model_validator(mode=\"after\")\n    def validate_page_scope(self) -> \"AgentUIContext\":\n        \"\"\"校验页面、scene_id、visible 分组和 target 的一致性。\"\"\"\n        if self.page not in {\"scene_center_page\", \"account_management_page\"}:\n            if self.scene_id is None:\n                raise ValueError(\"scene_id is required for this page\")\n        self._validate_visible_scope()\n        self._validate_target_scope()\n        return self",
      "sourceHash": "5c482236c4fb43a78515c07dc225792981701c167e7551b91d2cdf276b08eb96",
      "fileHash": "365e39523c419c7a50d909211e08a9d08b207c6acdf1490bfa6a01afdda3dd12",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "ui-validate-visible",
      "title": "校验可见业务分组",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/contracts/ui_context.py",
      "symbol": "AgentUIContext._validate_visible_scope",
      "lineStart": 353,
      "lineEnd": 376,
      "focusLine": 373,
      "purpose": "仅允许当前页面携带所属业务分组；空分组通过。",
      "input": "page=scene_center_page、visible 中业务分组均为空",
      "output": "无不支持的可见字段",
      "calls": "validate_page_scope → _validate_visible_scope",
      "note": "映射表列出所有页面，但本次只判断 scene_center_page；未走错误分支。",
      "color": "mint",
      "source": "    def _validate_visible_scope(self) -> None:\n        \"\"\"确保当前页面只携带自己的业务分组。\"\"\"\n        groups: dict[AgentUIPage, set[str]] = {\n            \"scene_center_page\": {\"scenes\"},\n            \"scene_app_list_page\": {\"apps\"},\n            \"workflow_list_page\": {\"workflows\"},\n            \"workflow_canvas_page\": {\"library_nodes\", \"canvas_detail\"},\n            \"node_library_page\": {\"library_nodes\"},\n            \"task_center_page\": {\"tasks\"},\n            \"report_page\": {\"reports\"},\n            \"knowledge_base_page\": {\"knowledge_entries\"},\n            \"scene_management_page\": {\"scene_packages\"},\n            \"account_management_page\": {\"account_applications\"},\n        }\n        values = self.visible.model_dump(mode=\"python\", exclude_none=True)\n        non_empty = {\n            name\n            for name, value in values.items()\n            if name != \"page_state\" and bool(value)\n        }\n        unsupported = non_empty - groups[self.page]\n        if unsupported:\n            ordered = \", \".join(sorted(unsupported))\n            raise ValueError(f\"visible fields are not allowed for this page: {ordered}\")",
      "sourceHash": "0e420e4d739560a119088272937038d87300eab312700a8ec014f4f67dcb01b1",
      "fileHash": "365e39523c419c7a50d909211e08a9d08b207c6acdf1490bfa6a01afdda3dd12",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "ui-validate-target",
      "title": "校验页面目标对象",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/contracts/ui_context.py",
      "symbol": "AgentUIContext._validate_target_scope",
      "lineStart": 378,
      "lineEnd": 403,
      "focusLine": 380,
      "purpose": "如果没有显式目标便提前返回；否则核验类型和可见 ID。",
      "input": "target=None",
      "output": "无需定位目标对象",
      "calls": "validate_page_scope → _validate_target_scope",
      "note": "本次在第 380 行提前返回，下面的目标类型/ID 分支未执行。",
      "color": "peach",
      "source": "    def _validate_target_scope(self) -> None:\n        \"\"\"校验 target 类型及其 ID 是否能在当前页面快照中定位。\"\"\"\n        if self.target is None:\n            return\n\n        allowed: dict[AgentUIPage, set[AgentUITargetType]] = {\n            \"scene_center_page\": {\"button\", \"title\", \"text\", \"scene\"},\n            \"scene_app_list_page\": {\"button\", \"title\", \"text\", \"app\"},\n            \"workflow_list_page\": {\"button\", \"title\", \"text\", \"workflow\"},\n            \"workflow_canvas_page\": {\n                \"button\", \"title\", \"text\", \"workflow\", \"library_node\",\n                \"canvas_node\", \"canvas_connection\",\n            },\n            \"node_library_page\": {\"button\", \"title\", \"text\", \"library_node\"},\n            \"task_center_page\": {\"button\", \"title\", \"text\", \"task\"},\n            \"report_page\": {\"button\", \"title\", \"text\", \"report\"},\n            \"knowledge_base_page\": {\"button\", \"title\", \"text\", \"knowledge_entry\"},\n            \"scene_management_page\": {\"button\", \"title\", \"text\", \"scene_package\"},\n            \"account_management_page\": {\"button\", \"title\", \"text\", \"account_application\"},\n        }\n        if self.target.type not in allowed[self.page]:\n            raise ValueError(\"target type is not allowed for this page\")\n\n        target_ids = self._target_ids(self.target.type)\n        if self.target.id not in target_ids:\n            raise ValueError(\"target id is not visible on this page\")",
      "sourceHash": "eff3e98d01b7852d012f3b4438d4dc7b46e7235e7a1a8c0d998680b76acf6546",
      "fileHash": "365e39523c419c7a50d909211e08a9d08b207c6acdf1490bfa6a01afdda3dd12",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "pipeline-valid-context",
      "title": "校验并构建 AgentContext",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/application/context/pipeline.py",
      "symbol": "ContextPipeline.build · L53–72",
      "lineStart": 52,
      "lineEnd": 72,
      "focusLine": 53,
      "purpose": "校验原始页面数据；成功后把请求身份、权限和短期记忆装入 AgentContext。",
      "input": "raw_ui_context、request_id、session_id、user_id、SessionMemory、access_mode",
      "output": "带有效 ui_context 的 AgentContext",
      "calls": "AgentUIContext.model_validate → RuntimeIdentity → AgentContext",
      "note": "本次未进入 ValidationError 分支；这里的 L53 已执行，与上一条采集的 L53 前停点不同。",
      "color": "blue",
      "source": "        try:\n            ui_context = AgentUIContext.model_validate(raw_ui_context or {})\n        except ValidationError as error:\n            return self._build_invalid_result(\n                request_id=request_id,\n                session_id=session_id,\n                user_id=user_id,\n                user_message=user_message,\n                session_memory=session_memory,\n                validation_error=error,\n                access_mode=access_mode,\n            )\n\n        return AgentContext(\n            request_id=request_id,\n            user_message=user_message,\n            access_mode=access_mode,\n            identity=RuntimeIdentity(user_id=user_id, session_id=session_id),\n            ui_context=ui_context,\n            session_memory=session_memory,\n        )",
      "sourceHash": "86e488ec742d84cf3cb5d2f2621262c1620527dd2ff683d62b1ccfc2acae27d6",
      "fileHash": "58b158d2db38b06e44083a2de3941a9f29ab402705c6304f221b3f4f2715c589",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "runtime-identity-contract",
      "title": "后端请求身份协议",
      "type": "数据模型",
      "file": "src/shaofeng_ai_backend/contracts/context.py",
      "symbol": "RuntimeIdentity",
      "lineStart": 13,
      "lineEnd": 19,
      "focusLine": 18,
      "purpose": "约束必须由运行时提供的用户 ID 与会话 ID。",
      "input": "user_id、session_id",
      "output": "非空 RuntimeIdentity",
      "calls": "ContextPipeline.build → RuntimeIdentity",
      "note": "Pydantic 模型构造是源码关联；调用点见 pipeline.py:69。",
      "color": "purple",
      "source": "class RuntimeIdentity(BaseModel):\n    \"\"\"Runtime 注入的请求身份，不属于前端实时现场 A。\"\"\"\n\n    model_config = ConfigDict(extra=\"forbid\", str_strip_whitespace=True)\n\n    user_id: str = Field(min_length=1)\n    session_id: str = Field(min_length=1)",
      "sourceHash": "ec644a543c47deb115d5e2afc92a67fd69e2f6548082f5708db90447ff4c1e22",
      "fileHash": "76848b57a1dbdb7b04168d7b949c69636370a09132bc290bcaca8427ae467589",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "agent-context-contract",
      "title": "Agent 标准上下文协议",
      "type": "数据模型",
      "file": "src/shaofeng_ai_backend/contracts/context.py",
      "symbol": "AgentContext",
      "lineStart": 34,
      "lineEnd": 48,
      "focusLine": 44,
      "purpose": "集中保存请求、访问模式、后端身份、页面现场、记忆与结构化问题。",
      "input": "user_message、access_mode、identity、ui_context、session_memory",
      "output": "可供后续 AgentRequest 使用的可信上下文",
      "calls": "ContextPipeline.build → AgentContext → AgentRequest",
      "note": "本次通过页面校验；issues 使用默认空元组，但尚未进入 Agent Engine。",
      "color": "mint",
      "source": "class AgentContext(BaseModel):\n    \"\"\"Agent 已标准化上下文：唯一可信的请求事实集合。\"\"\"\n\n    model_config = ConfigDict(extra=\"forbid\")\n\n    request_id: str\n    user_message: str\n    access_mode: Literal[\"restricted\", \"full\"] = \"restricted\"\n    # 身份必须由 Runtime 注入，不能由 ContextPack 自动生成匿名值。这样离线调用若\n    # 忘记提供身份会立即暴露契约错误，不会把未鉴权请求伪装成合法内部事实。\n    identity: RuntimeIdentity\n    # 合法请求保存完整 A；非法输入只保留 issue，避免下游消费未校验的原始 JSON。\n    ui_context: AgentUIContext | None = None\n    session_memory: SessionMemory | None = None\n    issues: tuple[ContextIssue, ...] = ()",
      "sourceHash": "6cf02970a5dc094888a650a4a85d93c6b6577657397f9f853525ddf5c479dfab",
      "fileHash": "76848b57a1dbdb7b04168d7b949c69636370a09132bc290bcaca8427ae467589",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "runtime-chat-handoff",
      "title": "聊天请求交给共享执行入口",
      "type": "代码片段",
      "file": "src/shaofeng_ai_backend/application/runtime/runtime_coordinator.py",
      "symbol": "RuntimeCoordinator._run_chat_agent_request · L443–457",
      "lineStart": 443,
      "lineEnd": 457,
      "focusLine": 451,
      "purpose": "封装聊天 AgentRequest，判断 blocker，并调用共享执行入口。",
      "input": "AgentContext、session_id、request_id",
      "output": "进入 _execute_agent_request",
      "calls": "ContextPipeline.build → AgentRequest → _execute_agent_request",
      "note": "第 458 行之后的响应、追加输入和记忆收尾均未运行。",
      "color": "peach",
      "source": "        agent_request = AgentRequest(\n            input_type=\"chat\",\n            context=context,\n        )\n        can_enter_llm = not any(\n            issue.severity == \"blocker\" for issue in context.issues\n        )\n\n        response = await self._execute_agent_request(\n            session_id=session_id,\n            request_id=request_id,\n            input_type=\"chat\",\n            agent_request=agent_request,\n            can_enter_llm=can_enter_llm,\n        )",
      "sourceHash": "44978d638779ed1fb99d40e72a63d1d6f6fd177d6e82f8c3100be0187ca32265",
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "agent-request-contract",
      "title": "统一 AgentRequest 协议",
      "type": "数据模型",
      "file": "src/shaofeng_ai_backend/contracts/agent_request.py",
      "symbol": "AgentRequest",
      "lineStart": 17,
      "lineEnd": 30,
      "focusLine": 28,
      "purpose": "把自然语言与结构化命令放入同一请求模型，并保留独立字段。",
      "input": "input_type=chat、context=AgentContext",
      "output": "聊天 AgentRequest",
      "calls": "RuntimeCoordinator._run_chat_agent_request → AgentRequest",
      "note": "本次 command 与 command_context 均为空；这是契约源码关联。",
      "color": "blue",
      "source": "class AgentRequest(BaseModel):\n    \"\"\"进入 CaxAgentEngine 的统一请求。\n\n    RuntimeCoordinator 只提供原始事实和结构化命令。\n    Engine 将聊天直送统一智能体，将已授权的场景写入审批命令交给同一能力处理。\n    \"\"\"\n\n    input_type: Literal[\"chat\", \"command\"] = \"chat\"\n    command: AgentCommand | None = None\n    # 只有 command 请求携带此上下文；chat 请求应使用 ContextPipeline 生成 context。\n    command_context: CommandContext | None = None\n    context: AgentContext\n\n    model_config = ConfigDict(arbitrary_types_allowed=True, extra=\"forbid\")",
      "sourceHash": "b23ecdff92e6151b1f976ed6cc9eb68e656d7e7fdc9075f1f3a7ed10d97b5d28",
      "fileHash": "f3ea1e7412bb90cdae927a41770019ebdfa0fdb8550750d9aa18302cbf12c55a",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "validate-input-channel",
      "title": "校验聊天与命令通道互斥",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/contracts/agent_request.py",
      "symbol": "AgentRequest.validate_input_channel",
      "lineStart": 32,
      "lineEnd": 60,
      "focusLine": 35,
      "purpose": "禁止 chat 请求混入命令字段；本次聊天信封通过。",
      "input": "input_type=chat、command=None、command_context=None",
      "output": "校验后的 AgentRequest",
      "calls": "AgentRequest 构造 → validate_input_channel",
      "note": "追踪只经过 chat 判断和最终返回；中间 command 分支未执行。",
      "color": "purple",
      "source": "    @model_validator(mode=\"after\")\n    def validate_input_channel(self) -> \"AgentRequest\":\n        \"\"\"保证自然语言和机械命令在内部请求中也不会重新混成双轨。\"\"\"\n        if self.input_type == \"chat\" and self.command is not None:\n            raise ValueError(\"chat AgentRequest must not contain command\")\n        if self.input_type == \"command\" and self.command is None:\n            raise ValueError(\"command AgentRequest requires command\")\n        if self.input_type == \"chat\" and self.command_context is not None:\n            raise ValueError(\"chat AgentRequest must not contain command_context\")\n        if self.input_type == \"command\" and self.command_context is None:\n            # 命令上下文必须由 Runtime 构造并携带身份、授权和审计结论。这里不能根据\n            # command 或 AgentContext 自动补造，否则离线调用会绕过真实授权边界，且会把\n            # “请求已被授权”误变成模型/Schema 层的默认事实。\n            raise ValueError(\"command AgentRequest requires command_context\")\n        if self.input_type == \"command\" and self.command_context is not None:\n            command_name = str(self.command.command) if self.command is not None else \"\"\n            if self.command_context.request_id != self.context.request_id:\n                raise ValueError(\"command_context request_id must match context\")\n            if self.command_context.identity != self.context.identity:\n                raise ValueError(\"command_context identity must match context\")\n            if self.command_context.command_name != command_name:\n                raise ValueError(\"command_context command_name must match command\")\n            if self.command_context.command_digest is not None:\n                expected_digest = command_payload_digest(self.command)\n                if self.command_context.command_digest != expected_digest:\n                    raise ValueError(\"command_context command_digest must match command\")\n        if self.input_type == \"command\" and self.context.ui_context is not None:\n            raise ValueError(\"command AgentRequest must not contain ui_context\")\n        return self",
      "sourceHash": "adf2551d0b70076c690d59537d44e28506e66b7d4f1edfe8ccb943fc9db718a1",
      "fileHash": "f3ea1e7412bb90cdae927a41770019ebdfa0fdb8550750d9aa18302cbf12c55a",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "runtime-execute-entry",
      "title": "进入共享请求执行层",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/application/runtime/runtime_coordinator.py",
      "symbol": "RuntimeCoordinator._execute_agent_request",
      "lineStart": 561,
      "lineEnd": 582,
      "focusLine": 579,
      "purpose": "绑定本次请求的 TraceContext，然后调用调试记录器记录 request_started。",
      "input": "AgentRequest、can_enter_llm、session_id、request_id",
      "output": "已绑定 Trace，并发起 debug_trace.record 调用",
      "calls": "_run_chat_agent_request → bind_trace_context → DebugTraceRecorder.record",
      "note": "第 583 行以后才会进入执行核心；本次在记录器 L178 前停止。",
      "color": "blue",
      "source": "    async def _execute_agent_request(\n        self,\n        *,\n        session_id: str,\n        request_id: str,\n        input_type: Literal[\"chat\", \"command\"],\n        agent_request: AgentRequest,\n        can_enter_llm: bool,\n    ) -> AgentResponse:\n        \"\"\"执行已装配好的 AgentRequest，并发布统一运行时事件。\n\n        该方法只负责运行时事件和 Engine 调用，不重新解析请求内容或参与业务路由。\n        \"\"\"\n        async with bind_trace_context(\n            session_id=session_id,\n            request_id=request_id,\n            recorder=self.debug_trace,\n        ):\n            await self.debug_trace.record(\n                \"request_started\",\n                {\"input_type\": input_type, \"can_enter_llm\": can_enter_llm},\n            )",
      "sourceHash": "38ca9066a425da5ba0d89b36141b2b0886c8b264726bfbea0b4393a0c07eb2fa",
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "trace-context-contract",
      "title": "异步请求 Trace 标识",
      "type": "数据模型",
      "file": "src/shaofeng_ai_backend/observability/debug_trace.py",
      "symbol": "TraceContext / ContextVar",
      "lineStart": 61,
      "lineEnd": 75,
      "focusLine": 65,
      "purpose": "保存 session_id、request_id、trace_id，并用 ContextVar 关联当前异步任务。",
      "input": "会话 ID、请求 ID、生成的 trace_id",
      "output": "异步上下文中的 TraceContext",
      "calls": "bind_trace_context → _current_context/_current_recorder",
      "note": "Trace ID 实际值未导出；只确认目标记录器能读取到匹配的身份。",
      "color": "mint",
      "source": "@dataclass(frozen=True)\nclass TraceContext:\n    \"\"\"当前异步请求的 Trace 标识；由 Runtime 设置，Dispatcher 读取。\"\"\"\n\n    session_id: str\n    request_id: str\n    trace_id: str\n\n\n_current_context: contextvars.ContextVar[TraceContext | None] = contextvars.ContextVar(\n    \"agent_trace_context\", default=None\n)\n_current_recorder: contextvars.ContextVar[\"DebugTraceRecorder | None\"] = contextvars.ContextVar(\n    \"agent_trace_recorder\", default=None\n)",
      "sourceHash": "2f84337c64200a69c053fd39d520fa6281281f9208d9161b86dfff2ebba97de2",
      "fileHash": "c93e7a97e8e5c0c86a1b22f07330553fc1b5bb087bdd9b06a82bb83333c6d8ff",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "bind-trace-context",
      "title": "绑定请求级调试上下文",
      "type": "异步函数",
      "file": "src/shaofeng_ai_backend/observability/debug_trace.py",
      "symbol": "bind_trace_context",
      "lineStart": 90,
      "lineEnd": 107,
      "focusLine": 104,
      "purpose": "创建 TraceContext，并把上下文和记录器绑定到当前异步任务。",
      "input": "session_id、request_id、DebugTraceRecorder",
      "output": "已进入绑定上下文",
      "calls": "_execute_agent_request → bind_trace_context",
      "note": "finally 清理属于异常中止后的收尾，不列入断点前正常流程。",
      "color": "purple",
      "source": "@asynccontextmanager\nasync def bind_trace_context(\n    *,\n    session_id: str,\n    request_id: str,\n    trace_id: str | None = None,\n    recorder: \"DebugTraceRecorder | None\" = None,\n) -> AsyncIterator[TraceContext]:\n    \"\"\"把请求标识绑定到当前异步任务，结束时恢复上层上下文。\"\"\"\n    context = TraceContext(\n        session_id=session_id,\n        request_id=request_id,\n        trace_id=trace_id or uuid.uuid4().hex,\n    )\n    token = _current_context.set(context)\n    recorder_token = _current_recorder.set(recorder)\n    try:\n        yield context",
      "sourceHash": "2e394d96079b1b2266f504ab55dab62f85d37bb334b8bfac5d26a12fa8dafef9",
      "fileHash": "c93e7a97e8e5c0c86a1b22f07330553fc1b5bb087bdd9b06a82bb83333c6d8ff",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "trace-record-boundary",
      "title": "调试记录器 L178 执行前",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/observability/debug_trace.py",
      "symbol": "DebugTraceRecorder.record",
      "lineStart": 161,
      "lineEnd": 178,
      "focusLine": 178,
      "purpose": "收到 request_started 调用，停在模式判断表达式执行前。",
      "input": "event=request_started、mode=off、当前 TraceContext",
      "output": "第 178 行未执行；未生成 agent_debug 事件",
      "calls": "_execute_agent_request → DebugTraceRecorder.record",
      "note": "本次临时服务使用 off 模式；即使继续运行，L178 的正常路径也会直接返回。",
      "color": "peach",
      "source": "    async def record(\n        self,\n        event: str,\n        payload: dict[str, Any] | None = None,\n        artifacts: dict[str, str] | None = None,\n        complete_artifact_names: tuple[str, ...] = (),\n        *,\n        phase: str | None = None,\n        operation: str | None = None,\n        status: str | None = None,\n        attempt: int | None = None,\n        issues: list[DiagnosticIssue | dict[str, Any]] | None = None,\n        input_refs: list[DiagnosticArtifactRef | dict[str, Any]] | None = None,\n        output_refs: list[DiagnosticArtifactRef | dict[str, Any]] | None = None,\n        metrics: dict[str, Any] | None = None,\n    ) -> None:\n        \"\"\"记录摘要；full 模式下把大字段另存为文件，不塞进 WS。\"\"\"\n        if self.mode == \"off\":",
      "sourceHash": "47603596f254ab002ce0669e2a7c66d716b58b75a9081bd170f410560a6db2eb",
      "fileHash": "c93e7a97e8e5c0c86a1b22f07330553fc1b5bb087bdd9b06a82bb83333c6d8ff",
      "sourceKind": "fixed-commit-excerpt"
    }
  ]
};
