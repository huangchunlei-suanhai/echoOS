// Generated from fixed develop_updata commit; prior snapshot remains in real-data.js.
export const UPDATA_SNAPSHOT = {
  "snapshot": {
    "id": "3cb5173",
    "name": "develop_updata · 固定提交",
    "commit": "3cb5173064689c277d959dd315e3774112f32d06",
    "date": "2026-10-30",
    "description": "普通对话入口至 pipeline.py:53 执行前",
    "breakpointLine": 53,
    "scope": "仅普通对话入口至 pipeline.py:53 执行前；不是全仓覆盖",
    "repositoryPath": "/home/huangchunlei/workspace/echo/sftg_ai_backend"
  },
  "run": {
    "id": "cfo-prefix-1030-3cb5173",
    "snapshotId": "3cb5173",
    "name": "develop_updata · 8094 采集 · L53 前",
    "state": "断点前停止",
    "status": "breakpoint",
    "duration": "未计时",
    "date": "2026-10-30 15:39",
    "response": null,
    "result": "已收到 chat_ack；追踪器在 pipeline.py:53 执行前主动停止。没有最终回复。停止采集产生的 chat_error 不是业务故障。",
    "requestId": "cfo-prefix-1030-3cb5173",
    "sessionId": "debug-1030fco",
    "userId": "2113153353906343938",
    "uiContext": "采集时使用测试形状：page=workflow_canvas_page，visible.page_state={}；待用实际前端数据核对。",
    "accessMode": "restricted",
    "traceFile": "evidence/ordinary-chat-prefix-8094-develop-updata.json"
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
      "cardId": "context-boundary",
      "cardIds": [
        "context-boundary"
      ],
      "label": "停在 pipeline.py 第 53 行执行前",
      "event": "ContextPipeline.build · L53",
      "evidence": "断点现场 · 8094",
      "evidenceDetail": "追踪器在 L53 执行前主动停止；model_validate 未运行，后续 Agent 流程未采集。",
      "duration": "未计时",
      "status": "breakpoint"
    }
  ],
  "overrides": {
    "ws-entry": {
      "lineStart": 89,
      "lineEnd": 113,
      "focusLine": 112,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b",
      "source": "@app.websocket(\"/ws/sessions/{session_id}\")\nasync def ws_session(websocket: WebSocket, session_id: str) -> None:\n    \"\"\"\n    前端与 AI 后端的唯一 WebSocket 交互入口。\n\n    前端发送：\n    - ping: 连接保活\n    - chat_start: 提交一次用户 prompt，并携带当前页面的 ui_context\n    - chat_steer: 向指定活动 chat_start 请求追加自然语言指令\n    - agent_command: 提交一次自包含的前端控件结构化机械命令，不携带 ui_context\n    - chat_cancel: 取消当前或指定 request_id 的任务\n\n    chat_start 必须携带 prompt 和 ui_context，可选 access_mode 只对新任务生效；\n    agent_command 只携带场景写入审批 command。Gateway 只校验消息信封，命令的授权、版本\n    和审计上下文由 RuntimeCoordinator 创建。\n\n    后端返回：\n    - pong\n    - chat_ack\n    - chat_final\n    - chat_error    \n    - chat_cancel_ack\n    \"\"\"\n    await coordinator.ws_broker.connect(session_id, websocket)\n    logger.info(\"ws connected session=%s\", session_id)",
      "sourceHash": "0d7da865a4507134933ba656c7d1769e777e71e5cc050719f75d4b66d5cd876f",
      "note": "协议说明新增 chat_steer，但本次只发送 chat_start；其余消息类型未执行。"
    },
    "ws-receive": {
      "lineStart": 305,
      "lineEnd": 318,
      "focusLine": 308,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b"
    },
    "request-scope": {
      "lineStart": 161,
      "lineEnd": 166,
      "focusLine": 166,
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936"
    },
    "ensure-request": {
      "lineStart": 168,
      "lineEnd": 182,
      "focusLine": 179,
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936"
    },
    "ws-dispatch": {
      "lineStart": 333,
      "lineEnd": 361,
      "focusLine": 357,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b"
    },
    "register-task": {
      "lineStart": 115,
      "lineEnd": 126,
      "focusLine": 124,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b"
    },
    "run-after-register": {
      "lineStart": 352,
      "lineEnd": 355,
      "focusLine": 355,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b"
    },
    "chat-envelope": {
      "lineEnd": 22,
      "focusLine": 22,
      "fileHash": "8accd6cd7e412fc294109361fdd62d1029f97a3adaaf6186c56ebf0185219504",
      "source": "class ChatStartMessage(BaseModel):\n    \"\"\"自然语言请求信封；它不能携带机械命令，可选择新任务权限模式。\"\"\"\n\n    model_config = ConfigDict(extra=\"forbid\", str_strip_whitespace=True)\n\n    type: Literal[\"chat_start\"]\n    request_id: str = Field(min_length=1)\n    user_id: str = Field(default=\"anonymous\", min_length=1)\n    prompt: str = Field(min_length=1)\n    ui_context: dict[str, Any]\n    access_mode: Literal[\"restricted\", \"full\"] = \"restricted\"",
      "sourceHash": "f1e4e3296a67d720472c8dbec1f8730f56d3ca19656533ba05d3b5e1d0bafd83",
      "purpose": "定义 chat_start 必填字段，并允许指定新任务的 access_mode。",
      "input": "type、request_id、user_id、prompt、ui_context；access_mode 可选，默认 restricted",
      "note": "本次未显式发送 access_mode，协议默认值为 restricted；Pydantic 内部校验未单独追踪。"
    },
    "worker-validate": {
      "lineStart": 196,
      "lineEnd": 209,
      "focusLine": 206,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b"
    },
    "safe-send": {
      "lineStart": 177,
      "lineEnd": 194,
      "focusLine": 189,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b"
    },
    "worker-ack": {
      "lineStart": 234,
      "lineEnd": 259,
      "focusLine": 251,
      "fileHash": "ea8d5d6ee221088d88759fcb75af6082ce8460eb937ae0616eaf01685140564b",
      "source": "        ack_sent = await _safe_send_json(\n            {\n                \"type\": \"chat_ack\",\n                \"request_id\": request_id,\n                \"session_id\": session_id,\n                \"status\": \"accepted\",\n            }\n        )\n        if not ack_sent:\n            # ACK 发送失败时清理已登记的活动任务和 Runtime 请求状态。\n            coordinator.finish_request(request_id, session_id=session_id)\n            await _pop_active_task(request_id, asyncio.current_task())\n            active_tasks.pop(request_id, None)\n            return\n\n        try:\n            response = (\n                await coordinator.run_chat_entry(\n                    session_id=session_id,\n                    user_id=message.user_id,\n                    prompt=message.prompt,\n                    ui_context=message.ui_context,\n                    access_mode=message.access_mode,\n                    request_id=request_id,\n                )\n                if isinstance(message, ChatStartMessage)",
      "sourceHash": "88e9c585cdeab31cf145bfda326bde1d11db0c93ed3c3301266a805ff68bbb16",
      "purpose": "打开输入队列之后发送 chat_ack，再传递自然语言请求及 access_mode。",
      "input": "已校验的 ChatStartMessage，含默认 access_mode=restricted",
      "note": "本次已收到 ACK；它只表示请求被接受，不是 Agent 回复。"
    },
    "run-chat-entry": {
      "lineStart": 287,
      "lineEnd": 312,
      "focusLine": 305,
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936",
      "source": "    async def run_chat_entry(\n        self,\n        session_id: str,\n        user_id: str,\n        prompt: str,\n        ui_context: dict[str, Any] | None = None,\n        access_mode: Literal[\"restricted\", \"full\"] = \"restricted\",\n        request_id: str | None = None,\n    ) -> AgentResponse:\n        \"\"\"执行自然语言 CAX Agent 请求。\n\n        ``chat_start`` 只能进入这个入口，因而内部请求不可能同时携带机械命令。\n\n        请求先读取会话记忆并构造 ContextPack，再交给共享 Engine 路由和执行；完成后将\n        本轮对话写回短期记忆。\n        \"\"\"\n        rid = self.ensure_request(request_id, session_id=session_id)\n        try:\n            return await self._run_chat_agent_request(\n                session_id=session_id,\n                user_id=user_id,\n                prompt=prompt,\n                ui_context=ui_context,\n                access_mode=access_mode,\n                request_id=rid,\n            )",
      "sourceHash": "ee29615012245c3883a2a61dd26ce41019f204c3b09637fedae92bcd4ee0c872",
      "input": "session_id、user_id、prompt、ui_context、access_mode、request_id",
      "note": "本次 access_mode=restricted；finally 清理发生在主动停止采集后，不列入断点前流程。"
    },
    "chat-assembly": {
      "lineStart": 400,
      "lineEnd": 442,
      "focusLine": 434,
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936",
      "source": "    async def _run_chat_agent_request(\n        self,\n        *,\n        session_id: str,\n        user_id: str,\n        prompt: str,\n        ui_context: dict[str, Any] | None,\n        access_mode: Literal[\"restricted\", \"full\"],\n        request_id: str,\n    ) -> AgentResponse:\n        \"\"\"装配 chat 请求并进入共享执行核心。\"\"\"\n        session_memory = self.session_memory_builder.build(\n            self.session_memory_store.list_recent(\n                user_id=user_id,\n                session_id=session_id,\n            ),\n            events=self.session_memory_store.list_recent_events(\n                user_id=user_id,\n                session_id=session_id,\n            ),\n        )\n        self._append_memory_event(\n            user_id=user_id,\n            session_id=session_id,\n            event=self._memory_event_factory.build_user_message_event(\n                user_id=user_id,\n                session_id=session_id,\n                request_id=request_id,\n                occurred_at=now_utc_iso(),\n                prompt=prompt,\n            ),\n        )\n        # MemoryStore 只负责按会话读取原始记录，SessionMemoryBuilder 负责压缩为短期记忆；\n        # ContextPipeline 只接收强类型 SessionMemory，再把白名单摘要投影给后续链路。\n        context = self._context_pipeline.build(\n            request_id=request_id,\n            session_id=session_id,\n            user_id=user_id,\n            user_message=prompt,\n            raw_ui_context=ui_context or {},\n            session_memory=session_memory,\n            access_mode=access_mode,\n        )",
      "sourceHash": "087360f31f6ba08a6da732065feec1945bf3f38e38907a15442439d3470d180b",
      "purpose": "读取会话记忆，写入本轮用户事件，并带 access_mode 调用 ContextPipeline.build。",
      "input": "用户与会话标识、prompt、原始 ui_context、access_mode",
      "output": "调用 ContextPipeline.build 前的 SessionMemory 和用户消息事件",
      "note": "第 443 行之后的 AgentRequest 尚未构造，Engine 尚未进入。"
    },
    "memory-build": {
      "fileHash": "8cabfe38b29108e8b017037a3664cc390a7b54c0114da6bd7c40e95297bfc576"
    },
    "find-active-task": {
      "fileHash": "8cabfe38b29108e8b017037a3664cc390a7b54c0114da6bd7c40e95297bfc576"
    },
    "task-projection": {
      "lineEnd": 61,
      "focusLine": 61,
      "fileHash": "768589c3c3699a3607d61b8dd2f23d6e06feb94bd460d829b24234379b179429",
      "source": "    def build(self, events: list[MemoryEvent]) -> SessionTaskProjection | None:\n        \"\"\"只投影通用会话状态，不从旧能力名称推导动作或阶段。\"\"\"\n        projection = SessionTaskProjection()\n        has_task_signal = False\n\n        for event in events:\n            if event.event_type == \"user_message_received\":\n                continue\n            if event.stage:\n                projection.stage = event.stage\n            if event.status:\n                projection.status = event.status\n\n            references = {**projection.source_refs, **event.references}\n            payload_references = event.payload.get(\"references\")\n            if isinstance(payload_references, dict):\n                references.update(payload_references)\n            task_id = references.get(\"task_id\")\n            if isinstance(task_id, str) and task_id.strip():\n                has_task_signal = True\n                projection.active_task_id = task_id.strip()\n            update: dict[str, Any] = {\"source_refs\": references}\n            goal = event.payload.get(\"goal\")\n            if isinstance(goal, str) and goal.strip():\n                update[\"goal\"] = goal.strip()\n            if event.event_type == \"error_occurred\" or event.status in {\"blocked\", \"failed\"}:\n                update[\"last_error\"] = (\n                    event.payload.get(\"error\") or event.summary or None\n                )\n\n            questions = self._string_list(\n                event.payload.get(\"pending_questions\")\n                or event.payload.get(\"clarification_questions\")\n            )\n            if event.payload.get(\"clarifying_question\"):\n                questions.extend(self._string_list([event.payload[\"clarifying_question\"]]))\n            update[\"pending_questions\"] = list(dict.fromkeys(questions))\n            if self._is_terminal(event):\n                update[\"pending_questions\"] = []\n            if event.occurred_at:\n                update[\"updated_at\"] = event.occurred_at\n            projection = projection.model_copy(update=update)\n\n        return projection if has_task_signal else None",
      "sourceHash": "a22e906ca09e40e10127fcb7830c711aaf8a0744f0007fbc997dea8d98e7baad",
      "purpose": "从历史事件的 task_id 引用投影任务摘要；本次事件为空，返回 None。",
      "note": "新分支以事件引用的 task_id 判定任务信号；本次未进入事件循环。"
    },
    "utc-time": {
      "fileHash": "cbcf127b1625c964b2d29dd0f7e9ed5b1c8f8e0bcea4609e3a3ee1f69281a5db"
    },
    "user-event": {
      "fileHash": "d153b755e31039ca2517d41d77ad86aa8d89a69bd55a09e18a99d3f628b0478b"
    },
    "build-event": {
      "lineStart": 235,
      "lineEnd": 264,
      "focusLine": 251,
      "fileHash": "d153b755e31039ca2517d41d77ad86aa8d89a69bd55a09e18a99d3f628b0478b",
      "source": "    @staticmethod\n    def _build_event(\n        *,\n        event_type: MemoryEventType,\n        user_id: str,\n        session_id: str,\n        request_id: str,\n        occurred_at: str,\n        status: str | None = None,\n        command_name: str | None = None,\n        stage: str | None = None,\n        summary: str = \"\",\n        payload: dict[str, Any] | None = None,\n        references: dict[str, Any] | None = None,\n    ) -> MemoryEvent:\n        \"\"\"创建 MemoryEvent，统一事件 id 和空字典默认值。\"\"\"\n        return MemoryEvent(\n            event_id=f\"mem_{uuid.uuid4().hex}\",\n            event_type=event_type,\n            user_id=user_id,\n            session_id=session_id,\n            request_id=request_id,\n            occurred_at=occurred_at,\n            status=status,\n            command_name=command_name,\n            stage=stage,\n            summary=summary,\n            payload=payload or {},\n            references=references or {},\n        )",
      "sourceHash": "ebf9f5ce86540475aa0b99fe00291c9c7da3bf3332423041ff4e7dd4185f67ae",
      "purpose": "生成事件 ID，并填充当前 MemoryEvent 协议字段与空字典默认值。",
      "note": "新分支不再填写旧 task_type/capability 字段；本次只构造用户消息事件。"
    },
    "append-runtime": {
      "lineStart": 687,
      "lineEnd": 703,
      "focusLine": 699,
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936"
    },
    "context-boundary": {
      "lineEnd": 53,
      "focusLine": 53,
      "fileHash": "58b158d2db38b06e44083a2de3941a9f29ab402705c6304f221b3f4f2715c589",
      "source": "    def build(\n        self,\n        *,\n        request_id: str,\n        session_id: str,\n        user_id: str,\n        user_message: str,\n        raw_ui_context: dict[str, Any] | None,\n        session_memory: SessionMemory | None = None,\n        access_mode: Literal[\"restricted\", \"full\"] = \"restricted\",\n    ) -> AgentContext:\n        \"\"\"构建标准化 AgentContext。\n\n        RuntimeCoordinator 负责按 user_id + session_id 从 MemoryStore 读取短期记忆；本模块\n        负责把该记忆作为后端已知事实写入 AgentContext。工作流 Agent 按需通过\n        PromptContextBuilder 生成 PromptContext，避免 Pipeline 额外产出一份\n        会被重复传递的投影视图。\n        \"\"\"\n        try:\n            ui_context = AgentUIContext.model_validate(raw_ui_context or {})",
      "sourceHash": "4fdf437461512acc346860502b5f0e5ac8a663e6b98659c35b748df1c0ea22d6",
      "title": "ContextPipeline.build · L53 断点前",
      "purpose": "已进入上下文构建函数，停在第 53 行 UIContext 校验表达式执行前。",
      "input": "request_id、session_id、user_id、prompt、raw_ui_context、SessionMemory、access_mode",
      "output": "尚无 AgentContext；第 53 行尚未执行",
      "note": "第 53 行只作为断点定位；AgentUIContext.model_validate 尚未调用。"
    }
  },
  "additions": [
    {
      "id": "open-user-input-channel",
      "title": "打开请求输入通道",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/application/runtime/runtime_coordinator.py",
      "symbol": "RuntimeCoordinator.open_user_input_channel",
      "lineStart": 233,
      "lineEnd": 245,
      "focusLine": 241,
      "purpose": "信封校验通过后，为本次请求打开可接收后续用户指令的输入通道。",
      "input": "request_id、session_id、user_id",
      "output": "请求级输入通道已创建",
      "calls": "_run_agent_request → open_user_input_channel → UserInputInbox.open",
      "note": "本次只打开通道，没有发送或消费 chat_steer 追加输入。",
      "color": "blue",
      "source": "    def open_user_input_channel(\n        self,\n        *,\n        request_id: str,\n        session_id: str,\n        user_id: str,\n    ) -> None:\n        \"\"\"信封校验通过后，为原始请求用户打开运行中追加输入通道。\"\"\"\n        self._user_input_inbox.open(\n            request_id=request_id,\n            session_id=session_id,\n            user_id=user_id,\n        )",
      "sourceHash": "d984292759bc750605d28a71d20d39d07561d95a78afda972683c4bbef150493",
      "fileHash": "9bd0d389d0bf2812503a8f8c52f592c25ac71bc6334c20f50561c9786975b936",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "inbox-open",
      "title": "建立请求级输入队列",
      "type": "实例方法",
      "file": "src/shaofeng_ai_backend/application/runtime/user_input_inbox.py",
      "symbol": "UserInputInbox.open",
      "lineStart": 33,
      "lineEnd": 38,
      "focusLine": 38,
      "purpose": "按会话和请求 ID 建立队列，并绑定发起用户。",
      "input": "session_id、request_id、user_id",
      "output": "存入 _RequestInbox",
      "calls": "UserInputInbox.open → _RequestInbox.__init__",
      "note": "本次正常创建队列，同名通道异常分支未发生。",
      "color": "purple",
      "source": "    def open(self, *, session_id: str, request_id: str, user_id: str) -> None:\n        \"\"\"在发送 chat_ack 前打开请求队列并固定请求归属。\"\"\"\n        key = (session_id, request_id)\n        if key in self._requests:\n            raise ValueError(\"user input channel already exists\")\n        self._requests[key] = _RequestInbox(user_id=user_id)",
      "sourceHash": "57a5d91b670a8628524a1e1fff81cb1e8832310eae2c32233c61f1d48e2052c9",
      "fileHash": "f3fd478db9e510f73245dc689b6b4f03068de59a4bd101881b9aa567affb221c",
      "sourceKind": "fixed-commit-excerpt"
    },
    {
      "id": "request-inbox-init",
      "title": "初始化用户输入队列",
      "type": "构造方法",
      "file": "src/shaofeng_ai_backend/application/runtime/user_input_inbox.py",
      "symbol": "_RequestInbox.__init__",
      "lineStart": 12,
      "lineEnd": 19,
      "focusLine": 15,
      "purpose": "记录创建者，初始化待处理和已接受消息集合及关闭标志。",
      "input": "user_id",
      "output": "空的请求级队列对象",
      "calls": "UserInputInbox.open → _RequestInbox.__init__",
      "note": "只记录队列创建；本次没有追加用户输入。",
      "color": "mint",
      "source": "class _RequestInbox:\n    \"\"\"请求级队列同时绑定创建者；同步操作在同一事件循环内保持原子性。\"\"\"\n\n    def __init__(self, user_id: str) -> None:\n        self.user_id = user_id\n        self.pending: deque[UserSteeringInput] = deque()\n        self.accepted: list[UserSteeringInput] = []\n        self.closed = False",
      "sourceHash": "d8625dc7ce82d72e70d357063f9e7fb495722694e04df89b96628ca684f6a1b1",
      "fileHash": "f3fd478db9e510f73245dc689b6b4f03068de59a4bd101881b9aa567affb221c",
      "sourceKind": "fixed-commit-excerpt"
    }
  ],
  "changes": [
    {
      "id": "ws-entry",
      "summary": "入口协议说明新增 chat_steer 和 access_mode。"
    },
    {
      "id": "chat-envelope",
      "summary": "chat_start 新增 access_mode，默认为 restricted。"
    },
    {
      "id": "worker-ack",
      "summary": "ACK 前打开输入通道，聊天请求传入 access_mode。"
    },
    {
      "id": "run-chat-entry",
      "summary": "Runtime 聊天入口透传 access_mode。"
    },
    {
      "id": "chat-assembly",
      "summary": "上下文调用新增 access_mode，后续使用 AgentContext。"
    },
    {
      "id": "task-projection",
      "summary": "任务信号改由事件引用中的 task_id 判定。"
    },
    {
      "id": "build-event",
      "summary": "MemoryEvent 构造移除旧 task_type/capability 参数。"
    },
    {
      "id": "context-boundary",
      "summary": "断点移到 L53，返回模型变为 AgentContext。"
    },
    {
      "id": "open-user-input-channel",
      "summary": "新增 Runtime 输入通道入口。"
    },
    {
      "id": "inbox-open",
      "summary": "新增 UserInputInbox.open。"
    },
    {
      "id": "request-inbox-init",
      "summary": "新增 _RequestInbox 初始化。"
    }
  ]
};
