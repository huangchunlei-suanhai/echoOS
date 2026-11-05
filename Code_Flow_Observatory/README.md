# Code Flow Observatory

这是一个本地静态网页，用固定提交源码、说明卡片和已保存的运行证据复盘代码链路。

## 本地预览

```bash
cd /home/huangchunlei/workspace/echo/echoOS/Code_Flow_Observatory
python3 -m http.server 4173 --bind 0.0.0.0
```

在运行服务的机器上打开 <http://127.0.0.1:4173/>；同一网络的其他设备可打开 <http://172.20.163.11:4173/>。页面不依赖后端进程，8094 只在采集时临时使用。

## 当前收录

- **真实仓库**：`/home/huangchunlei/workspace/shaofeng_tiangong/sftg_ai_backend`，`develop_echo`，固定提交 `37467f44cba35cd23036af3530f861a398fb130d`。当前只收录“普通对话入口”至 `application/context/pipeline.py:52` **执行前**。已整理 13 个流程步骤和 28 张源码片段卡，涉及 11 个源码文件。这些数字不代表全仓覆盖率。
- **develop_updata 快照**：`/home/huangchunlei/workspace/echo/sftg_ai_backend`，固定提交 `3cb5173064689c277d959dd315e3774112f32d06`。现已延伸至 `observability/debug_trace.py:178` **执行前**，共 20 个流程步骤、47 张源码卡片。先前停在 `pipeline.py:53` 前的 14 步运行记录仍可选择；`develop_echo` 和假数据仓库不变。
- **假数据仓库**：EchoOS Agent，仅用于保留页面切换和界面演示。

真实记录来自 2026-10-23 17:05（北京时间）在 `ws://172.20.163.11:8094/ws/sessions/debug-cfo` 发起的一次真实 WebSocket 请求。临时采集服务仅本次关闭鉴权，发送了用户提供的用户 ID、会话 ID 和提示词，并使用测试形状的 `ui_context`：`{"page":"workflow_canvas_page","visible":{"page_state":{}}}`。客户端收到 `chat_ack`。追踪器在第 52 行执行前主动抛出停止异常；随后收到的 `chat_error` 是采集动作所致，**不是业务错误或 Agent 回复**。`AgentUIContext.model_validate`、`AgentRequest` 构造、Engine 和最终回复均不在本次记录中。

原始函数调用与断点局部摘要保存在 [采集证据](evidence/ordinary-chat-prefix-8094.json)。Python 的异步协程恢复可能产生重复的 `call` 事件；页面按学习步骤归并。函数进入记录不能证明卡片片段的每一行或分支都被执行。协议卡属于源码关联，页面将它与动态证据区分。

## develop_updata 采集说明

2026-10-30 15:39（北京时间），在 8094 端口运行新分支的临时服务，对会话 debug-1030fco 发起一次 chat_start 请求。用户 ID 和提示词沿用原场景；本次使用同样的测试形状 ui_context，未指定 access_mode，因此协议默认值为 restricted。客户端先收到 chat_ack，追踪器在 pipeline.py:53 执行前主动停止；随后收到的 chat_error 由采集器主动停止造成，不是业务结果。没有最终回复，也没有进入 Agent Engine。

新分支的函数追踪新增 RuntimeCoordinator.open_user_input_channel、UserInputInbox.open 和 _RequestInbox.__init__。它们在 ACK 前创建请求级输入队列；本次未发送 chat_steer。另有 8 张旧卡片的源码内容发生变化，其他卡片复用说明，只根据固定提交调整行号和文件哈希。当前范围不代表整个仓库源码覆盖率。

原始记录：`evidence/ordinary-chat-prefix-8094-develop-updata.json`。新数据由 `generate_updata_data.py` 生成 `updata-data.js`；旧的 `real-data.js` 和证据文件不被重写。

## develop_updata 后续链路

2026-10-30 16:35（北京时间），用相同的 WebSocket 地址、用户 ID `2113153353906343938`、会话 ID `debug-1030fco` 和提示词“你好，请简要说明你能帮我做什么。”重新采集了一条从 WebSocket 入口到 `debug_trace.py:178` 执行前的完整追踪。先前测试形状的 `workflow_canvas_page` 缺少必需的 `scene_id`，如果继续执行第 53 行会走校验失败分支。为了复盘正常对话分支，本次改用合法的最小测试页面 `{"page":"scene_center_page","visible":{"page_state":{}}}`。这仍不是用户真实前端快照；两次运行的页面输入不同。

本次收到 `chat_ack`；`AgentUIContext` 校验通过，创建了 `AgentContext` 和 `AgentRequest`，并绑定请求级 Trace。追踪器在 `DebugTraceRecorder.record` 的第 178 行执行前主动停止；临时服务使用 `AGENT_DEBUG_MODE=off`，故没有生成 `agent_debug` 事件，也没有进入 Agent Engine 或获得最终回复。随后 `chat_error` 是主动停止的结果。前 13 个步骤沿用已有卡片说明，新增 7 个步骤和 16 张不重复的后续卡片。

完整的函数进入与 Python 行事件记录保存在 [后续完整采集证据](evidence/ordinary-chat-through-debug-trace-178-develop-updata.json)。`generate_updata_continuation.py` 从固定 Git 提交提取源码、计算文件及片段 SHA-256，生成 `continuation-data.js`。源码卡中的契约类是源码关联，不等于 Pydantic 内部逐行执行证据。采集脚本 `capture_updata_to_trace178.py` 只在临时进程中关闭鉴权，并阻止请求越过目标断点。

## 卡片和交互

- 在顶部切换仓库和固定代码快照；真实仓库有两个固定快照；版本对比页列出当前范围内源码内容变化和新增函数卡片。
- 在流程中选择步骤，再选择该步骤的关联源码卡片。真实卡片源码直接从固定 Git 提交提取，记录原文件和片段的 SHA-256、行号与重点行。
- 在卡片库搜索源码、符号和说明，筛选类型与审核状态。说明可编辑、保存草稿、确认通过或撤回审核；源码保持只读。
- 审核、收藏和笔记保存在当前浏览器 `localStorage`。导出卡片清单可备份说明和审核记录；导出真实流程包含卡片源码与原始追踪。清除站点数据会删除浏览器内记录。
- 专注演示模式隐藏部分编辑操作。

## 重新生成固定源码

`generate_real_data.py` 根据固定提交和 `evidence/ordinary-chat-prefix-8094.json` 生成 `real-data.js`。执行：

```bash
python3 generate_real_data.py
```

生成器使用 `git show <commit>:<path>` 读取源码，不修改真实仓库。调整卡片说明或范围时修改生成器中的 `SPECS` 和 `STEPS` 后重新生成；网页中的人工修订仍只保存在浏览器本地。

新快照执行 `python3 generate_updata_data.py`。该脚本仅生成分支增量：复用旧卡片说明，对变化源码保存覆盖字段，并为实际新增的调用添加卡片。
后续延伸执行 `python3 generate_updata_continuation.py`；该脚本只生成新卡片和运行数据，不改写先前两个固定快照或前段记录。
