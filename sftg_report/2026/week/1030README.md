# 前端首次联调：真实录制与明确标记的回放样本

## 本次测试是什么

- 代码版本：`develop_echo` / `37467f44cba35cd23036af3530f861a398fb130d`。
- 真实后端：`ws://127.0.0.1:8091/ws/sessions/{session_id}`，本次录制会话为 `frontend-gearbox-bb52501c67ee4efeb30bc34936558773`，`user_id=2113153353906343938`，任务 ID 为 `adf7a1b1ce4648a8b636b5f0622fbcba`。
- 场景 `gearbox_e2e` 是位于本目录 `scene_library/` 的**隔离合成测试场景**。后端、模型、工作区工具、CGraph 校验、整图执行、场景写入确认与回读均真实运行；没有改动现有用户场景。
- 回放服务：`ws://127.0.0.1:8093/ws/sessions/{任意回放会话ID}`。它只按录制内容返回历史帧，**不会重新调用模型、运行工具或写文件**。前端使用此地址时应显示“录制回放”标记。

## 文件索引

| 文件 | 用途 |
|---|---|
| `setup.json` | 真实测试的代码版本、端口和隔离场景位置 |
| `capture/session_manifest.json` | 九轮请求 ID、请求类型及每轮终态 |
| `capture/websocket_transcript.jsonl` | 按时间追加的**原始**双向 WS 帧；`sent`、`received`、`client_wait` 明确区分 |
| `capture/ui_context_after_publish.json` | 第九轮使用的工作流列表页快照；从真实发布资产构造的**模拟前端页面**，不是浏览器采集 |
| `capture/approval_records/` | 四次确认的服务端快照副本，包含完整待写入内容与最终 `applied` 状态；仅供后端审计，不是前端可访问接口 |
| `replay/replay_bundle.json` | 已标记为 `recorded_replay_sample` 的回放输入和全部服务端帧，包含每一步准确的 prompt / command |
| `replay/replay_manifest.json` | 回放元数据、来源 SHA-256、适配规则 |
| `replay/smoke_result.json` | 九轮回放 WS 实测结果 |
| `scene_library/user_2113153353906343938/gearbox_e2e/` | 真实受限确认后发布的节点与工作流资产 |
| `traces/` | 本次真实运行的 Debug Trace；仅供后端排查 |

## 用户与前端的实际交互

准确的请求 JSON 在 `replay/replay_bundle.json` 的 `steps[].request`。前端按下表顺序发送；每次等对应 `request_id` 的 `chat_final` 或 `chat_error` 后再进入下一步。回放接受新的 `request_id`，但 prompt / command、`user_id` 必须与样本一致。

| 步骤 | 用户在前端做什么 | 真实终态 |
|---|---|---|
| `01_discuss` | 提出两齿轮传动工作流，仅讨论需求 | `ready`；Agent 询问传动比口径、方向、单位 |
| `02_implement` | 确认外啮合、20/40 齿、1200 rpm、传动比口径和约束，要求生成并验证 | `completed`；CGraph 实测 `2.0`、`600.0 rpm`、`-1` |
| `03_revise` | 要求补充从动轮角速度，继续测试与整图执行 | `completed`；新增 `62.83185307179586 rad/s`，32 项节点 pytest 通过 |
| `04_publish_request` | 请求将四个文件发布到隔离测试场景 | `ready`；返回第一个待确认写入 |
| `05_approve_node_manifest` | 点击确认 `nodes/external_gear_pair.json` | `ready`；已写入该文件，同时返回第二个待确认写入 |
| `06_approve_node_source` | 点击确认 `nodes/external_gear_pair.py` | `ready`；已写入，同时返回第三个待确认写入 |
| `07_approve_workflow_manifest` | 点击确认 `workflows/external_gear_pair/manifest.json` | `ready`；已写入，同时返回第四个待确认写入 |
| `08_approve_workflow_graph` | 点击确认 `workflows/external_gear_pair/graph.json` | `ready`；四个文件全部写入并回读 |
| `09_readback_from_workflow_list` | 在工作流列表页选中已发布工作流，询问输入输出和上次结果 | `ready`；只读回查，无文件修改 |

第 5–8 步发送的是 `agent_command`，不是在聊天框里输入 `approve_scene_write ...`。例如第一次确认的真实请求结构：

```json
{
  "type": "agent_command",
  "request_id": "45413eec247441cc95fece574159ea56",
  "user_id": "2113153353906343938",
  "command": {
    "command": "approve_scene_write",
    "task_id": "adf7a1b1ce4648a8b636b5f0622fbcba",
    "operation_id": "090244939cfd39a9c7c5b4fbceb9057a"
  }
}
```

首次联调页面可依次呈现：用户问题与澄清、阶段进度、工具执行结果、整图输出、修订结果、逐文件差异确认、发布后列表与详情。第九轮 `ui_context` 展示了前端应回传的页面、场景 ID、可见工作流摘要和所选 `target`；确认按钮只回传上面的结构化命令。

## 服务端事件和前端显示

真实录制共有 **837 个收到的 WS 帧**：`chat_ack` 9、`agent_progress` 348、`agent_debug` 471、`chat_final` 9。每一轮都保留了完整事件顺序；没有收到 `chat_error`，所以回放包没有伪造错误事件。`client_wait` 是录制客户端的等待记录，不是服务端帧。

| 类型 | 本次可用字段 | 建议呈现 |
|---|---|---|
| `chat_ack` | `request_id`、`status=accepted` | 标记请求已受理；继续等待终态 |
| `agent_progress` | `stage`、`message`、`payload` | 时间线与进度；`workflow_agent.tool_completed` 为 `requires_confirmation` 时展示 `path`、`diff`、`operation_id`；`workflow_agent.scene_write_approved` 展示已应用 |
| `agent_debug` | `trace_id`、`seq`、`event`、`payload` | 调试面板和问题定位，按原序记录；不要当作普通用户回复 |
| `chat_final` | `response.status`、`response.message`、`response.payload.task_status` 等 | 展示本轮回复与任务状态；`status=ready` 也可能伴随 `task_status=completed`，例如等待下一次逐文件确认 |
| `chat_error` | 本次真实样本未出现 | 前端仍应按协议处理错误；不能从本次样本推断错误样式的具体业务文案 |

`chat_final.response.payload.tool_results` 包含任务累计工具结果，可能重复出现先前的待确认记录；前端应以当前进度事件中的 `operation_id` 和本轮最新状态识别新的确认卡片，不要仅遍历累计列表就重新弹出旧确认。`workspace_files` 也包含测试环境依赖，不能原样当成交付文件列表。

## 回放使用

当前回放端口是 **8093**，因为 8092 已被其他进程占用。服务停止后可从仓库根目录重新启动：

```bash
PYTHONPATH=src .venv/bin/python scripts/debug/replay_frontend_session.py serve \
  --bundle .var/frontend_joint_debug/2026-10-26_gearbox_8091/replay/replay_bundle.json \
  --host 127.0.0.1 --port 8093 --speed 20
```

回放会话从第一步开始；重连同一个会话 ID 会继续下一步。需跳到指定步骤时在 WS URL 加 `?start_step=04_publish_request`，但该步骤仍只回答其录制过的请求。`--speed 0` 可立即发送全部帧，`--speed 20` 以 20 倍速重现帧间时间并对长间隔设上限。回放帧只重映射 `request_id` / `session_id`，将录制时的本机仓库绝对路径替换为 `${SOURCE_REPO}`；其他业务结果保留录制值。回放来源 SHA-256 在 `replay_manifest.json`。

## 已核验与已知边界

- 真实工作区：节点注册、图加载、整图执行、工作区校验通过；修订后 32 项节点 pytest 通过。实际场景清单可读取 1 个节点和 1 个工作流，四个发布文件均存在。独立比对确认场景节点源码与已验证工作区源码字节相同，发布的 `graph.json` 与已真实执行的编译图 JSON 结构相同。
- 回放服务：九轮共 837 帧完整往返测试通过，所有类型顺序与录制一致，关联 ID 重映射正确；对不属于样本的 prompt 返回回放服务自己的 `chat_error`，不会冒充真实录制错误。
- 第四个待确认文件 `graph.json` 的 `diff_truncated=true`：本次 WS 只展示差异前 20,000 字符和完整内容的 SHA-256。首次页面必须标明“差异已截断”；若产品要求批准前阅读全文，后端尚需提供完整待确认内容读取能力。本次在隔离测试场景中通过服务端缓存核对完整内容及哈希后确认。
- 本次验证了后端资产列表与详情读取，未验证真实浏览器中的画布渲染、拖拽或页面交互。第九轮页面快照是明确标记的模拟前端输入。
- 新增录制与回放脚本的 6 项 pytest 全通过；连同场景写入和资产读取测试共 16 项通过。执行整个 `tests/agent` 得到 308 通过、1 跳过、4 失败；失败分别是 3 个既有 Skill 文案断言与 1 个既有 WS 取消用例的场景访问配置，均不涉及本次新增脚本，未为联调任务改动这些生产模块或测试。
