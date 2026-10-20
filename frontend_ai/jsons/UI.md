# 工作流研发 UI 与审核规范 v0.3.1


本文依据 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json`、
`fixed_hot_cache/cylinder2d_workflow_full_interaction_zh.json` 中阶段 A、B、C、D1、D2、D2.5、E
的真实完整链路整理，并针对原始协议中的重复字段和职责混杂给出优化设计及完整样例。


## 0. 前置条件
 - 根据真实链路记录，事件顺序如下：

```text
chat_start           # 前端提交本轮用户请求
-> chat_ack          # 后端已接收请求
-> agent_progress    # 后端报告运行过程进度
-> chat_final        # 后端返回本轮结构化最终结果
```
 - 相关运行过程进度统计：
```text
runtime.receive_agent：收到 CAX Agent 请求
engine.router_started：开始进行 Agent 路由
engine.router_completed：Agent 路由完成
engine.capability_started：开始执行 Agent 能力
engine.capability_completed：Agent 能力执行完成
runtime.agent_done：CAX Agent 请求处理完成

workflow_contract.generation_started：开始生成工作流详细研发合同
workflow_contract.node_started：开始规划节点详细合同
workflow_contract.node_attempt_started：正在调用模型生成节点详细合同
workflow_contract.node_validation_failed：节点详细合同未通过结构校验
workflow_contract.node_retrying：准备根据校验错误重试当前节点
workflow_contract.node_ready：节点详细合同已生成
workflow_contract.generation_completed：工作流详细研发合同生成完成
workflow_contract.review_ready：详细研发合同已生成，等待用户审核

workflow_contract.lock_ready：详细工作流研发合同已确认并锁定
 ```



## 1. 阶段 A 初始规划 （`A_initial_planning`）

### 1.1 实际记录的事件

后端报告运行过程进度：
```text
收到 CAX Agent 请求
开始进行 Agent 路由
Agent 路由完成
开始执行 Agent 能力
Agent 能力执行完成
CAX Agent 请求处理完成
```

### 1.2 `data` 的结构

当前`fixed_hot_cache/cylinder2d_workflow_full_interaction.json`的中文结构展示（已省略`payload`字段）
```json
      "类型": "chat_final",
      "请求编号": "req-real-a-initial-planning-847e486c3a",
      "会话编号": "real-cylinder2d-8acabfe3d998",
      "响应": {
        "任务类型": "workflow_authoring",
        "状态": "ready",
        "消息": "Workflow 规划已完成",
        "路由": {
          "任务类型": "workflow_authoring",
          "交互模式": "author_task",
          "置信度": 0.99,
          "原因": "用户明确要求从零构建二维圆柱绕流的完整最小 CFD 工作流，涵盖几何生成、网格划分、物性与边界设置、求解输入生成、CFD 执行及后处理，并要求自动生成相关节点与流程。",
          "目标能力": "workflow_authoring",
          "需要澄清": false,
          "澄清问题": null
        },
        "需要澄清": false,
        "澄清问题": null
      },
```


### 1.3 payload 对象

##### 当前 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json` 设计
```text
payload.execution_context           # 本轮运行上下文。运行追踪、审计和后端诊断。
payload.workflow_authoring_report   # 完整后端规划报告。调试、审计和后端完整结果保留。
payload.workflow_authoring_view     # 面向前端阶段交互的视图。用户审核、阶段判断及后续命令回传。
```

##### 分析
可以把阶段 A 理解为要发给前端两类东西：
- 给人看的“审核摘要”
- 给系统接力用的“完整工作流图”

当前的问题是：同一份工作流图和审核摘要，被装进了 `report` 和 `view` 两个大对象，发了两遍。

##### 哪些字段要删除或精简
| 当前字段 | 调整方式 | 原因 |
|---|---|---|
| `execution_context` | 从 payload 删除 | `request_id`、`session_id` 已在 `chat_final` 外层；`user_id`、`capability_context` 是后端运行信息，前端页面不需要。 |
| `workflow_authoring_report` | 不再下发给前端 | 它是后端审计、调试、记忆使用的完整报告，不是前端接口。保留在服务端即可。 |
| `workflow_authoring_view.status` | 删除 | 外层已有 `response.status`。 |
| `candidate_state` | 删除 | 当前固定为 `workflow_not_registered`，前端无法据此做新判断。 |
| `workflow_authoring_view.workflow` | 改为精简的 `workflow_draft` | 当前包含大量从 CGraph 图再次派生的内容，尤其节点、端口、缺失节点信息。 |
| `workflow.steps[].node_name` | 删除 | 与 `title` 表达同一个节点名称。 |
| `workflow.steps[].inputs/outputs` | 从摘要删除 | 完整端口信息已在 `workflow_design.node_specs`，用户摘要无需再列一遍。 |
| `workflow.steps[].risks` | 删除 | 阶段 A 应使用工作流级 `risks`；样例中每个步骤的该字段均为空。 |
| `workflow.required_nodes` | 删除 | 与步骤列表重复。 |
| `workflow.missing_nodes` | 删除 | 与步骤的 `node_status=missing` 重复。 |
| `missing_nodes[].suggested_authoring_prompt` | 删除 | 是后端后续节点研发的候选提示，不是用户确认工作流所需信息。 |
| `review.next_actions` | 删除 | 用 `allowed_commands` 表达确定性的下一步，不要让前端解析自然语言动作。 |
| `actions.*.enabled + command` | 改为 `allowed_commands` | 命令是否存在就表示服务端允许；不需要同时传 `enabled: true` 和同样的命令字符串。 |
| `revise_requirement`、`discard` | 不放入服务端动作协议 | 这是前端本地交互或重新发起会话，不是阶段 A 交给后端的确定性命令。 |


##### 推荐设计（优化之后完整内容：fixed_hot_cache/new.json）
tip：以下不是当前后端输出，而是待实现的 v2

这里允许保留三种内容，但职责必须不同：
| 内容 | 给谁用 | 为什么保留 |
|---|---|---|
| `workflow_draft` | 用户审核和编辑的业务规格。 | 用户不应直接阅读复杂的节点规格、端口和边定义。 |
| `workflow_design` | 画布技术图、端口、连线和绑定的唯一技术事实。 | 这是完整且精确的 CGraph 图，后续生成详细研发合同必须使用它。 |
|`review`|用户审核、前端阶段判断|集中提供静态校验结论、测试计划、待澄清问题和阻断项；前端据此展示技术审核信息，并结合 `allowed_commands` 决定是否可进入阶段 B。|

`payload` 字段示例：
```json
{
  "protocol_version": "2.0",
  "phase": "workflow_design",

  "workflow_draft": {
    "name": "二维圆柱绕流最小自动化工作流",
    "goal": "...",
    "inputs": [],
    "outputs": [],
    "steps": [],
    "assumptions": [],
    "risks": []
  },

  "workflow_design": {
    "...": "完整 CGraphWorkflowSpec，唯一的技术事实"
  },

  "review": {
    "validation": {},
    "test_plan": {},
    "clarification_questions": [],
    "blockers": []
  },
  "allowed_commands": [
    "generate_workflow_development_contract"
  ]
}
```

### 1.4 前端联调推荐展示审核

##### 用户审核的内容
字段 `workflow_draft`、`review` 内容：
- 工作流目标是否正确；
- 输入、输出是否齐全；
- 步骤顺序是否合理；
- 有哪些假设、风险、待澄清问题；
- 图校验是否通过；
- 测试计划是否可接受。


##### 前端联调实际需要
| 前端用途 | 需要的字段 |
|---|---|
| 判断该用哪个页面组件 | `protocol_version`、`phase` |
| 显示用户审核页面 | `workflow_draft` |
| 显示工作流画布或技术详情 | `workflow_design` |
| 判断能否进入下一阶段 | `review.validation.valid`、`review.blockers`、`allowed_commands` |
| 显示“生成详细研发合同”按钮 | `allowed_commands` 是否包含 `generate_workflow_development_contract` |


##### 前端下一阶段必须回传
以下为占位表示，不是实际 JSON：
```json
{
  "command": "generate_workflow_development_contract",
  "original_user_request": "<用户原始工程需求>",
  "workflow_draft": "<用户审核或编辑后的业务规格草案>",
  "workflow_contract_draft": {
    "workflow_design": "<用户审核或编辑后的完整 CGraph 技术规格>"
  }
}
```
解释：
 - 是用户修改过的业务审核结果，例如名称、目标、输入输出、步骤、假设、风险。应进入后续审核/锁定记录，不能在用户编辑后丢弃。
 - 是可校验的技术图，当前后端已强制要求，含节点、端口、边、绑定和数据类型；详细合同必须据此生成。前端编辑后，后端必须重新校验。


<span style="color:red">

## 2. 阶段 B 生成详细合同（`B_generate_detailed_contract`）

### 2.1 实际记录的事件

后端报告运行过程进度，其中每个节点均有`规划节点详细合同`的过程进度：

```text
  收到 CAX Agent 请求
  开始进行 Agent 路由
  Agent 路由完成
  开始执行 Agent 能力
  开始生成工作流详细研发合同

  开始规划节点详细合同
  正在调用模型生成节点详细合同
  节点详细合同已生成

  工作流详细研发合同生成完成
  详细研发合同已生成，等待用户审核
  Agent 能力执行完成
  CAX Agent 请求处理完成
```

出现需要重试时，节点部分`正在调用模型生成节点详细合同`添加对应重试进度：
```text
  正在调用模型生成节点详细合同
  节点详细合同未通过结构校验
  准备根据校验错误重试当前节点
```

### 2.2 `data` 的结构

当前中文结构说明（已省略`payload`字段）
```json
      "类型": "chat_final",
      "请求编号": "req-real-b-generate-detailed-contract-c853685aa7",
      "会话编号": "real-cylinder2d-8acabfe3d998",
      "响应": {
        "任务类型": "workflow_contract_lock",
        "状态": "development_contract_review_ready",
        "消息": "WorkflowContractLock 命令已处理",
        "路由": {
          "任务类型": "workflow_contract_lock",
          "交互模式": "continue_task",
          "置信度": 1.0,
          "原因": "前端发送 WorkflowContractLock 结构化命令",
          "目标能力": "workflow_contract_lock",
          "需要澄清": false,
          "澄清问题": null
        },
        "需要澄清": false,
        "澄清问题": null
      },
```

### 2.3 payload 对象

##### 当前 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json` 设计

```text
payload.workflow_contract_lock_report
payload.workflow_development_contract_review_view
```

两个对象重复携带 `development_contract_draft`、节点合同、假设和风险；审核视图还同时包含
`status`、`candidate_state` 和 `actions.*.enabled`。真实样例为 6 个节点、16 个外部输入合同、
3 个外部输出合同、5 个数据源合同、7 个数据边引用和 6 个节点合同哈希；原始合同中的
`edge_contracts` 为空，7 个可展示连接来自 `data_edge_references`，两者不能混为同一计数。

##### 分析

阶段 B 的系统事实只有一份“待锁定的详细研发合同”。用户审核的是合同身份、节点接口、
数据载体、样例、假设和风险；程序负责重新编译并校验哈希。完整合同必须保留，因为当前后端
尚未持久化待确认候选，阶段 C 必须把同一份合同原样回传；但阶段 B 不应再次回显阶段 A 的
`workflow_draft` 和 `workflow_design`，也不应在 `report`、`view`、节点摘要中重复合同正文。
阶段 A 已确认事实由前端任务状态保存，并在阶段 C 按既有命令字段回传。进度事件只用于运行
追踪，不能成为合同事实来源。

##### 哪些字段要删除或精简

| 当前字段 | 调整方式 | 原因 |
|---|---|---|
| `workflow_contract_lock_report` | 从前端 payload 删除 | 属于后端审计报告，与审核视图重复。 |
| `status`、`candidate_state` | 删除 | 外层 `response.status` 与 `phase` 已足够判断页面。 |
| `development_contract_draft` | 更名为 `development_contract` | 它是待确认的唯一完整合同，不是另一份临时副本。 |
| `review` 中的完整合同数组 | 改为轻量 `review` | 每个节点只保留身份、哈希和合同数量；合同正文只存在于 `development_contract`。 |
| 阶段 A 的完整上下文 | 不在阶段 B 响应中回显 | 前端已在 A→B 请求中持有这些事实；再次下发只会放大报文。 |
| `actions.*.enabled` | 改为 `allowed_commands` | 命令存在即表示允许执行。 |
| `revise_workflow_contract` | 不放入服务端命令 | 返回修改是前端回到阶段 A 后重新提交，不是锁定状态迁移。 |
| 模型 attempt、重试与错误文本 | 仅留在 `agent_progress` | 它们是运行追踪，不是合同内容。 |
| `edge_contracts` 与 `data_edge_references` 混合计数 | 统一显示 `data_edges` | 新合同用“源合同 + 边引用”表达连接；不能把兼容投影误报为另一组合同。 |

##### 推荐设计（优化之后完整内容：fixed_hot_cache/new.json）
tip：以下不是当前后端输出，而是待实现的 v2

`payload` 字段示例：
```json
{
  "protocol_version": "2.0",
  "phase": "detailed_contract_review",
  "contract": {
    "workflow_name": "cylinder2d_flow_minimal_workflow",
    "contract_version": "1",
    "development_contract_sha256": "848be684...",
    "nodes": [
      {
        "node_instance_id": "geometry_1",
        "node_type_id": "cylinder2d_parametric_geometry",
        "node_contract_sha256": "776d9e82..."
      }
    ]
  },
  "development_contract": {},
  "review": {
    "counts": {
      "nodes": 6,
      "external_inputs": 16,
      "external_outputs": 3,
      "data_sources": 5,
      "data_edges": 7
    },
    "nodes": [],
    "assumptions": [],
    "risks": [],
    "blockers": []
  },
  "allowed_commands": [
    "confirm_detailed_workflow_contract_lock"
  ]
}
```

`contract` 把工作流级哈希和节点级哈希绑定到明确的节点身份；不能只传一个无节点映射的哈希
数组。`development_contract` 是锁定命令必须原样回传的唯一合同正文。`review` 只做展示，
不得从摘要反向拼装合同。`allowed_commands` 是按钮和状态迁移的唯一机器依据。

### 2.4 前端联调推荐展示审核

##### 用户审核的内容

阶段 B 的用户审核对象是字段 `contract`、`development_contract`、`review`
的内容；`allowed_commands` 只决定可用操作，不是用户审核的业务内容。

- 工作流名称、节点实例与节点类型是否正确；
- 外部输入、外部输出、数据源及数据边的语义和载体策略是否正确；
- canonical valid、invalid cases、语义不变量、artifact layout 是否可接受；
- 合同假设、风险和阻断项；
- 总合同哈希及各节点合同哈希是否对应当前审核版本。

| 用户审核内容 | 对应字段 |
|---|---|
| 工作流名称 | `contract.workflow_name` |
| 节点实例、节点类型 | `contract.nodes[].node_instance_id`、`contract.nodes[].node_type_id` |
| 外部输入合同 | `development_contract.external_input_contracts[]` |
| 外部输出合同 | `development_contract.external_output_contracts[]` |
| 节点输出数据源合同 | `development_contract.data_source_contracts[]` |
| 数据边的源合同引用和消费端 | `development_contract.data_edge_references[]` |
| 数据类型、Schema、canonical valid、invalid cases、语义不变量、载体策略和 artifact layout | 上述合同对象内的 `dtype`、`payload_schema`、`canonical_valid`、`invalid_cases`、`semantic_invariants`、`carrier_policy`、`artifact_layout` |
| 全局假设和风险 | `review.assumptions`、`review.risks` |
| 是否存在阻断 | `review.blockers` |
| 合同数量总览 | `review.counts` |
| 节点级导航摘要 | `review.nodes[]` |
| 总合同哈希 | `contract.development_contract_sha256` |
| 节点合同哈希 | `contract.nodes[].node_contract_sha256` |

`review.assumptions` 和 `review.risks` 是为审核页准备的轻量投影；其权威事实仍是
`development_contract.assumptions` 和 `development_contract.risks`。前端不能修改
`review` 后反向生成合同。数据边自身只保留引用和消费端，其 Schema、样例、
不变量和载体策略应通过 `data_contract_id` 关联到 `data_source_contracts[]` 审核。

##### 前端联调实际需要

| 前端用途 | 需要的字段 |
|---|---|
| 选择详细合同审核页 | `protocol_version`、`phase` |
| 确认当前审核版本 | `contract` |
| 展示摘要与风险 | `review` |
| 展开合同技术详情 | `development_contract` |
| 判断能否锁定 | `review.blockers`、`allowed_commands` |
| 展示生成过程 | 本轮 `agent_progress`，不得混入合同对象 |

##### 前端下一阶段必须回传

以下为占位表示，不是实际 JSON：
```json
{
  "command": "confirm_detailed_workflow_contract_lock",
  "workflow_draft": "<阶段 A 已确认的 workflow_draft>",
  "workflow_contract_draft": {
    "workflow_design": "<阶段 A 已确认的 workflow_design>"
  },
  "development_contract_draft": "<阶段 B 的 development_contract 原样值>",
  "confirmed_node_contract_hashes": [
    "<阶段 B contract.nodes[].node_contract_sha256>"
  ]
}
```
这是 v2 目标协议中的必填回传字段；
这组字段与当前 `WorkflowContractLockCommand` 一致。后端必须根据 `workflow_design` 和完整合同
重新编译，并逐项比对 `confirmed_node_contract_hashes` 后才能进入阶段 C。前端不得只回传摘要、
计数或展示文本，也不得把 `contract.nodes` 当作完整合同。未来若引入服务端候选仓储，可以再用
`candidate_id + development_contract_sha256` 替代大对象回传；本阶段不提前引入该状态。


## 3. 阶段 C 合同锁定结果（`C_confirm_detailed_contract`）

### 3.1 实际记录的事件

后端报告运行过程进度：

```text
  收到 CAX Agent 请求
  开始进行 Agent 路由
  Agent 路由完成
  开始执行 Agent 能力

  详细工作流研发合同已确认并锁定

  Agent 能力执行完成
  CAX Agent 请求处理完成
```

### 3.2 `data` 的结构

当前结构（已省略`payload`字段）
```json
      "类型": "chat_final",
      "请求编号": "req-real-c-confirm-detailed-contract-e923b1efed",
      "会话编号": "real-cylinder2d-8acabfe3d998",
      "响应": {
        "任务类型": "workflow_contract_lock",
        "状态": "detailed_contract_lock_ready",
        "消息": "WorkflowContractLock 命令已处理",
        "路由": {
          "任务类型": "workflow_contract_lock",
          "交互模式": "continue_task",
          "置信度": 1.0,
          "原因": "前端发送 WorkflowContractLock 结构化命令",
          "目标能力": "workflow_contract_lock",
          "需要澄清": false,
          "澄清问题": null
        },
        "需要澄清": false,
        "澄清问题": null
      },
```

### 3.3 payload 对象

##### 当前 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json` 设计

```text
payload.workflow_contract_lock_report   # 合同编号、版本、锁哈希和阻断项
payload.workflow_contract_preview_view  # 合同身份、预览文档、研发进度、审核和动作
```

`workflow_contract_preview_view` 中包含 `status`、`candidate_state`、`contract`、
`preview_document`、`progress`、`review` 和 `actions`。真实样例锁定了 6 个节点，初始进度
`revision=1`，`review.executable=false`，允许启动第一个节点研发。

##### 分析

阶段 C 是阶段 B 锁定命令的确定性结果，不应让用户再次审核详细合同。前端需要确认锁哈希、
只读预览和节点研发队列，并清楚知道“已锁定但不可执行”：锁定成功只冻结契约，节点文件尚未
研发和注册。预览文档是后续画布基线，不能由前端根据阶段 A 的设计重新拼装。

##### 哪些字段要删除或精简

| 当前字段 | 调整方式 | 原因 |
|---|---|---|
| `workflow_contract_lock_report` | 合并为 `contract_lock` | 避免合同编号、版本和哈希重复下发。 |
| `status`、`candidate_state` | 删除 | 外层状态和 `phase` 已表达锁定结果。 |
| `preview_document.workflowContract` | 删除 | 与顶层 `contract_lock` 重复。 |
| `review.executable` | 删除 | 阶段 C 固定尚不可执行；最终可执行性由阶段 E 的装配与校验结果表达。 |
| `actions.replan_workflow` | 删除 | 前端导航行为不属于服务端命令协议。 |
| `actions.edit_locked_workflow` | 删除 | 锁定合同不可原地编辑；修改必须重新规划和锁定。 |
| `actions.*.enabled + command` | 改为 `allowed_commands` | 消除重复布尔状态和命令字符串。 |

##### 结果展示内容与字段路径

阶段 C 是阶段 B 确认命令的系统回执，不产生新的用户审核内容，也不显示“确认合同”弹窗。

| 结果展示内容 | 对应字段 |
|---|---|
| 锁定合同身份 | `contract_lock.contract_id`、`contract_lock.contract_version` |
| 锁定内容完整性 | `contract_lock.lock_sha256` |
| 只读工作流图 | `workflow_preview`（包括 `graph`、`nodes`、`edges` 和 `view`） |
| 节点研发队列 | `node_development_queue.revision`、`node_development_queue.total_nodes`、`node_development_queue.completed_nodes`、`node_development_queue.next_node_type_id`、`node_development_queue.nodes[]` |
| 是否允许进入 D1 | `allowed_commands[]` 包含 `start_locked_node_authoring` |

`workflow_preview` 是服务端根据 Lock 确定性生成的只读文档，前端不根据阶段 A 的图重新拼装。
`node_development_queue` 是可变研发状态，不参与 Lock 哈希。阶段 C 固定处于“合同已锁定、节点
尚未研发”状态，因此不再下发恒为 `false` 的 `readiness.executable`；工作流是否最终可执行由
阶段 E 的确定性装配与校验结果表达。

##### 推荐设计（优化之后完整内容：fixed_hot_cache/new.json）

`payload` 字段示例：
```json
{
  "protocol_version": "2.0",
  "phase": "contract_lock_result",
  "contract_lock": {
    "contract_id": "workflow_contract_840b8062248b4f25b2718e757d8da67a",
    "contract_version": 1,
    "lock_sha256": "afef332f..."
  },
  "workflow_preview": {},
  "node_development_queue": {
    "revision": 1,
    "total_nodes": 6,
    "completed_nodes": 0,
    "next_node_type_id": "cylinder2d_parametric_geometry",
    "nodes": []
  },
  "allowed_commands": [
    "start_locked_node_authoring"
  ]
}
```

### 3.4 前端联调结果展示

##### 需要展示给用户

阶段 C 是阶段 B 确认命令的系统回执，不产生新的用户审核内容，也不显示“确认合同”弹窗。
页面需要展示阶段 B 已确认合同的锁定结果、只读工作流预览和节点研发队列；用户点击“开始首个
节点研发”只是启动阶段 D1。

| 展示对象 | 字段 | 展示的业务内容 |
|---|---|---|
| 锁定合同 | `contract_lock` | 已锁定合同的编号、版本和锁定哈希，说明当前工作流合同已冻结。 |
| 只读工作流预览 | `workflow_preview` | 服务端根据 Lock 生成的工作流图、节点、控制流/数据流连接和画布视图，作为后续研发的统一基线。 |
| 节点研发队列 | `node_development_queue` | 队列版本、节点总数、已完成数量、下一个节点类型和每个节点的研发状态。 |
| 下一步操作 | `allowed_commands` | 当前是否允许启动 `start_locked_node_authoring`，允许时进入阶段 D1。 |

前端不得根据阶段 A 的 `workflow_design` 重建预览，不得在 C 阶段重新展示或要求确认阶段 B 的
详细合同，也不得把“节点尚未研发”展示为“合同锁定失败”。

##### 前端联调实际需要

| 前端用途 | 需要的字段 |
|---|---|
| 选择锁定预览页 | `protocol_version`、`phase` |
| 显示不可变合同身份 | `contract_lock` |
| 渲染只读画布 | `workflow_preview` |
| 展示研发队列 | `node_development_queue` |
| 显示“开始首个节点研发” | `allowed_commands` |

##### 前端下一阶段必须回传

```json
{
  "command": "start_locked_node_authoring",
  "contract_id": "workflow_contract_840b8062248b4f25b2718e757d8da67a"
}
```

后端以 `contract_id` 从当前用户与会话隔离的服务端仓储加载 Lock，并从服务端队列选取首个节点；
`lock_sha256` 用于结果展示和完整性核对，不是当前 D1 命令字段。前端不回传可编辑预览文档，
也不指定任意节点跳过既定顺序。

## 4. 阶段 D1 规格设计（`D1_spec_design`）

### 4.1 实际记录的事件

后端报告运行过程进度：

```text
  收到 CAX Agent 请求
  开始进行 Agent 路由
  Agent 路由完成
  开始执行 Agent 能力
  Agent 能力执行完成
  CAX Agent 请求处理完成
```

### 4.2 `data` 的结构

当前结构（已省略`payload`字段）
```json
      "类型": "chat_final",
      "请求编号": "req-real-d1-1-spec-design-1bd709f03e",
      "会话编号": "real-cylinder2d-8acabfe3d998",
      "响应": {
        "任务类型": "workflow_contract_node_authoring",
        "状态": "spec_ready",
        "消息": "WorkflowContractLock 单节点研发阶段已处理",
        "路由": {
          "任务类型": "workflow_contract_node_authoring",
          "交互模式": "continue_task",
          "置信度": 1.0,
          "原因": "前端发送 WorkflowContractLock 单节点研发命令",
          "目标能力": "workflow_contract_node_authoring",
          "需要澄清": false,
          "澄清问题": null
        },
        "需要澄清": false,
        "澄清问题": null
      },
```

### 4.3 payload 对象

##### 当前 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json` 设计

```text
payload.workflow_contract_node_authoring           # 当前节点规格、计划、校验及状态迁移
payload.workflow_contract_node_authoring_progress  # 整体节点研发队列
payload.execution_context                          # 后端运行上下文
```

`workflow_contract_node_authoring` 同时包含 `status`、`stage`、`spec`、`cgraph_node_spec`、
`cgraph_validation_result`、`implementation_plan`、`test_plan`、`tool_results`、`blockers`、
`next_actions` 和 `stage_transition`。

##### 分析

阶段 D1 的审核单元必须是“当前锁定合同中的一个节点规格”。业务说明 `spec` 与可执行技术接口
`cgraph_node_spec` 职责不同，应同时保留；实现计划、测试计划和校验结果属于审核依据。整图合同
不应再次下发，只用不可变合同引用关联。队列进度只报告顺序和状态，不复制节点规格。

##### 哪些字段要删除或精简

| 当前字段 | 调整方式 | 原因 |
|---|---|---|
| `execution_context` | 从 payload 删除 | 请求与能力追踪属于后端诊断。 |
| `status`、`stage` | 删除 | 外层状态与 `phase` 已表达阶段。 |
| `tool_results` | 删除 | 当前为空；未来工具追踪应放运行详情。 |
| `next_actions` | 删除 | 自然语言不能驱动状态迁移。 |
| `stage_transition` | 拆成 `allowed_commands` | 前端只需确定性命令；原因写入 UI 文案而非协议。 |
| 完整 `workflow_contract_node_authoring_progress` | 精简为 `progress` | 只保留合同引用、计数、下一节点和节点状态。 |
| `cgraph_validation_result` | 收入 `review.validation` | 集中审核结论，避免散落字段。 |

##### 推荐设计（优化之后完整内容：fixed_hot_cache/new.json）

```json
{
  "protocol_version": "2.0",
  "phase": "node_spec_review",
  "contract_ref": {
    "contract_id": "workflow_contract_840b8062248b4f25b2718e757d8da67a",
    "lock_sha256": "afef332f..."
  },
  "node_ref": {
    "order": 1,
    "node_type_id": "cylinder2d_parametric_geometry",
    "instance_ids": ["geometry_1"]
  },
  "node_spec_draft": {
    "spec": {},
    "cgraph_node_spec": {}
  },
  "review": {
    "validation": {},
    "implementation_plan": {},
    "test_plan": {},
    "blockers": []
  },
  "progress": {},
  "allowed_commands": [
    "generate_node_candidate_files"
  ]
}
```

### 4.4 前端联调推荐展示审核

##### 用户审核的内容

- 当前节点是否对应锁定合同规定的实例、类型和顺序；
- 节点目的、输入输出、假设与风险是否正确；
- CGraph 节点 ID、版本、端口类型、artifact contract 与锁定合同是否一致；
- 实现文件计划、实现步骤和测试计划是否覆盖成功及失败路径；
- 结构校验是否通过、是否存在阻断项。

审核对象是 `contract_ref`、`node_ref`、`node_spec_draft` 和 `review`；其中：

| 用户审核内容 | 对应字段 |
|---|---|
| 合同与节点身份、研发顺序 | `contract_ref`、`node_ref.order`、`node_ref.node_type_id`、`node_ref.instance_ids` |
| 节点业务规格 | `node_spec_draft.spec` |
| CGraph 技术接口 | `node_spec_draft.cgraph_node_spec` |
| CGraph 结构校验 | `review.validation` |
| 实现计划 | `review.implementation_plan` |
| 测试计划 | `review.test_plan` |
| 阻断项 | `review.blockers` |

##### 前端联调实际需要

| 前端用途 | 需要的字段 |
|---|---|
| 选择节点规格审核页 | `protocol_version`、`phase` |
| 标识合同与当前节点 | `contract_ref`、`node_ref` |
| 展示业务规格和技术端口 | `node_spec_draft` |
| 展示校验、实现及测试依据 | `review` |
| 展示 1/6 研发进度 | `progress` |
| 判断能否生成候选文件 | `review.blockers`、`allowed_commands` |

##### 前端下一阶段必须回传

```json
{
  "command": "generate_node_candidate_files",
  "contract_ref": "<阶段 D1 原样返回的合同引用>",
  "node_ref": "<阶段 D1 原样返回的当前节点引用>",
  "node_spec_draft": "<用户确认后的完整节点规格候选>"
}
```

后端必须校验节点仍是服务端队列当前项，并重新校验 `cgraph_node_spec`；不能只根据
`node_type_id` 生成文件，也不能接受前端跳转到其他队列节点。

## 5. 阶段 D2 候选文件生成（`D2_file_generation`）

### 5.1 实际记录的事件

后端报告运行过程进度：

```text
  收到 CAX Agent 请求
  开始进行 Agent 路由
  Agent 路由完成
  开始执行 Agent 能力
  Agent 能力执行完成
  CAX Agent 请求处理完成
```

### 5.2 `data` 的结构

当前结构（已省略`payload`字段）
```json
      "类型": "chat_final",
      "请求编号": "req-real-d1-2-file-generation-c5b269e3af",
      "会话编号": "real-cylinder2d-8acabfe3d998",
      "响应": {
        "任务类型": "workflow_contract_node_authoring",
        "状态": "files_ready",
        "消息": "WorkflowContractLock 单节点研发阶段已处理",
        "路由": {
          "任务类型": "workflow_contract_node_authoring",
          "交互模式": "continue_task",
          "置信度": 1.0,
          "原因": "前端发送 WorkflowContractLock 单节点研发命令",
          "目标能力": "workflow_contract_node_authoring",
          "需要澄清": false,
          "澄清问题": null
        },
        "需要澄清": false,
        "澄清问题": null
      },
```

### 5.3 payload 对象

##### 当前 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json` 设计

```text
payload.workflow_contract_node_authoring           # 节点规格、候选文件、校验及状态迁移
payload.workflow_contract_node_authoring_progress  # 整体节点研发队列
payload.execution_context                          # 后端运行上下文
```

真实候选包含 `manifest.json`、执行器 Python 文件和 pytest 文件，每项含 `path`、`purpose`、
`content`、`language`、`write_mode`。当前 CGraph 与文件静态校验均通过，候选尚未写盘、执行或入库。

##### 分析

阶段 D2 审核的是“将要写入临时目录的确定文件集合”。候选内容必须完整下发并完整回传，否则
后端无法确认用户批准的字节与落盘内容一致。节点规格在 D1 已审核，本阶段只保留其身份和哈希，
不再次复制完整规格。静态校验通过也不代表代码执行或物理正确性验证通过。

##### 哪些字段要删除或精简

| 当前字段 | 调整方式 | 原因 |
|---|---|---|
| `execution_context` | 从 payload 删除 | 后端诊断信息不参与候选审核。 |
| `status`、`stage` | 删除 | 外层状态与 `phase` 已可判断。 |
| 完整 `cgraph_node_spec` | 改为 `node_ref.spec_sha256` | D1 已确认，本阶段只校验候选关联版本。 |
| `candidate_preflight_report` | 删除 | 当前为 `null`；有结果时归入 `review.preflight`。 |
| `next_actions` | 删除 | 不传自然语言动作。 |
| `stage_transition` | 改为 `allowed_commands` | 命令存在即表示可进入落盘。 |
| `workflow_contract_node_authoring_progress` | 精简为 `progress` | 去除与当前节点审核无关的合同重复信息。 |
| 分散的校验、假设、风险、说明 | 合并为 `review` | 前端只从一个审核对象读取结论。 |

##### 推荐设计（优化之后完整内容：fixed_hot_cache/new.json）

```json
{
  "protocol_version": "2.0",
  "phase": "node_candidate_files_review",
  "contract_ref": {},
  "node_ref": {
    "node_type_id": "cylinder2d_parametric_geometry",
    "spec_sha256": "..."
  },
  "candidate_files": [
    {
      "path": "manifest.json",
      "purpose": "后端确定性编译的 CGraph manifest",
      "content": "<完整文件内容>",
      "language": "json",
      "write_mode": "create",
      "content_sha256": "..."
    }
  ],
  "review": {
    "cgraph_validation": {},
    "file_validation": {},
    "preflight": null,
    "assumptions": [],
    "risks": [],
    "notes": [],
    "blockers": []
  },
  "progress": {},
  "allowed_commands": [
    "persist_node_candidate_files"
  ]
}
```

候选文件增加由后端对 UTF-8 文件内容计算的 `content_sha256`，用于阶段 D2.5 直接证明审核内容与
落盘内容一致；若还需要保护路径和写入模式，应另设 `approval_envelope_sha256`，不能复用同名字段。
文件内容不能用截断预览代替。

### 5.4 前端联调推荐展示审核

##### 用户审核的内容

- 候选文件清单、相对路径、用途和写入模式；
- manifest 的节点身份、端口和执行入口是否与 D1 规格一致；
- 执行器是否遵守锁定合同，测试是否覆盖 canonical、invalid 和失败恢复样例；
- CGraph 校验、文件静态校验、preflight 结论；
- 假设、风险、审核说明和阻断项；
- 本次确认只授权临时目录落盘，不授权执行、注册或正式入库。

审核对象是 `contract_ref`、`node_ref`、`candidate_files` 和 `review`；其中：

| 用户审核内容 | 对应字段 |
|---|---|
| 合同、节点和 D1 规格版本 | `contract_ref`、`node_ref` |
| 候选文件路径、用途、内容和写入方式 | `candidate_files[]` 的 `path`、`purpose`、`content`、`write_mode` |
| 文件内容完整性 | `candidate_files[].content_sha256` |
| CGraph 校验 | `review.cgraph_validation` |
| 文件静态校验 | `review.file_validation` |
| 预检、假设、风险和说明 | `review.preflight`、`review.assumptions`、`review.risks`、`review.notes` |
| 是否阻断落盘 | `review.blockers` |

##### 前端联调实际需要

| 前端用途 | 需要的字段 |
|---|---|
| 选择候选文件审核页 | `protocol_version`、`phase` |
| 标识合同与节点版本 | `contract_ref`、`node_ref` |
| 展示文件树、diff 和源码 | `candidate_files` |
| 展示校验边界与风险 | `review` |
| 显示节点队列进度 | `progress` |
| 判断能否落盘 | `review.blockers`、`allowed_commands` |

##### 前端下一阶段必须回传

```json
{
  "command": "persist_node_candidate_files",
  "contract_ref": "<阶段 D2 原样返回的合同引用>",
  "node_ref": "<阶段 D2 原样返回的节点引用与规格哈希>",
  "confirmed_candidate_files": "<阶段 D2 用户确认的完整候选文件数组>"
}
```

后端应逐项重算候选文件哈希、校验安全相对路径和写入模式，再写入受控临时目录。前端不能只回传
文件名或哈希，因为服务端需要以用户确认的完整内容作为落盘输入。

## 6. 阶段 D2.5 文件落盘持久化（`D2.5_file_persistence`）

### 6.1 实际记录的事件

后端报告运行过程进度：

```text
  收到 CAX Agent 请求
  开始进行 Agent 路由
  Agent 路由完成
  开始执行 Agent 能力
  Agent 能力执行完成
  CAX Agent 请求处理完成
```

### 6.2 `data` 的结构

当前结构（已省略`payload`字段）
```json
      "类型": "chat_final",
      "请求编号": "req-real-d1-2-5-file-persistence-c87a303e42",
      "会话编号": "real-cylinder2d-8acabfe3d998",
      "响应": {
        "任务类型": "workflow_contract_node_authoring",
        "状态": "files_persisted",
        "消息": "WorkflowContractLock 单节点研发阶段已处理",
        "路由": {
          "任务类型": "workflow_contract_node_authoring",
          "交互模式": "continue_task",
          "置信度": 1.0,
          "原因": "前端发送 WorkflowContractLock 单节点研发命令",
          "目标能力": "workflow_contract_node_authoring",
          "需要澄清": false,
          "澄清问题": null
        },
        "需要澄清": false,
        "澄清问题": null
      },
```

### 6.3 payload 对象

##### 当前 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json` 设计

```text
payload.workflow_contract_node_authoring           # 节点规格、落盘结果、校验及状态迁移
payload.workflow_contract_node_authoring_progress  # 更新后的节点研发队列
payload.execution_context                          # 后端运行上下文
```

真实落盘结果为 3 个文件，每项包含 `path`、`bytes_written`、`content_sha256`、`write_mode`。完成后首节点
状态变为 `files_persisted`，`completed_nodes=1`，下一节点为 `cylinder2d_cfd_mesher`；当前链路不执行
节点测试、代码运行或正式入库。

##### 分析

阶段 D2.5 是 D2 确认命令的确定性写入回执，不是新的用户审核点。前端需要核对落盘文件摘要和
队列推进结果，并展示能力边界。响应不应再携带完整节点规格；候选内容已在 D2 审核，此处以路径、
字节数和哈希证明实际写入结果。

##### 哪些字段要删除或精简

| 当前字段 | 调整方式 | 原因 |
|---|---|---|
| `execution_context` | 从 payload 删除 | 属于运行追踪。 |
| `status`、`stage` | 删除 | 外层状态与 `phase` 已表达。 |
| `cgraph_node_spec` | 删除 | D1/D2 已确定，本阶段只返回节点引用。 |
| `cgraph_validation_result`、`file_validation_result` | 删除 | D2 已审核，落盘阶段不重复静态结论。 |
| `error_code: null` | 删除 | 成功响应不携带空错误；失败用 `chat_error` 的结构化错误。 |
| `next_actions` | 删除 | 当前自然语言容易被误解为后续阶段已接入。 |
| `stage_transition` | 删除 | 当前响应明确无用户确认和允许命令。 |
| 完整 progress | 精简计数与节点状态 | 保留前端进度展示所需的最小事实。 |
| `sha256` | 统一为 `content_sha256` | D2 与 D2.5 必须能直接核对文件内容未被替换。 |

##### 推荐设计（优化之后完整内容：fixed_hot_cache/new.json）

```json
{
  "protocol_version": "2.0",
  "phase": "node_files_persisted",
  "contract_ref": {},
  "node_ref": {},
  "persistence_result": {
    "temporary_only": true,
    "written_files": [],
    "execution_performed": false,
    "tests_performed": false,
    "registered": false
  },
  "progress": {
    "total_nodes": 6,
    "completed_nodes": 1,
    "next_node_type_id": "cylinder2d_cfd_mesher",
    "nodes": []
  },
  "allowed_commands": [
    "start_locked_node_authoring"
  ],
  "next_action": {
    "command": "start_locked_node_authoring",
    "target_stage": "spec_design",
    "target_node_type_id": "cylinder2d_cfd_mesher"
  },
}
```

D2.5 根据队列是否还有节点返回不同命令：非最后节点允许继续研发下一节点；最后节点允许生成最终
工作流。两种命令都只推进后端状态，不重新审核已落盘文件。

### 6.4 前端联调结果展示

##### 需要展示给用户

阶段 D2.5 是 D2 确认命令的系统回执，不弹出新的确认框。页面展示写入成功回执：节点名称、临时
落盘标识、文件路径、字节数、内容 SHA-256、队列进度，以及“未执行、未测试、未注册”的明确边界。

| 展示对象 | 字段 | 展示的业务内容 |
|---|---|---|
| 落盘关联 | `contract_ref`、`node_ref` | 当前合同、节点和 D2 候选版本。 |
| 写入结果 | `persistence_result` | 是否仅写入临时目录、写入文件、执行/测试/注册边界。 |
| 队列状态 | `progress` | 已完成节点数、下一节点和各节点状态。 |
| 下一步 | `allowed_commands`、`next_action` | 非最后节点进入下一个 D1；最后节点进入 E。 |

##### 前端联调实际需要

| 前端用途 | 需要的字段 |
|---|---|
| 选择落盘结果页 | `protocol_version`、`phase` |
| 关联合同与节点 | `contract_ref`、`node_ref` |
| 显示实际写入清单 | `persistence_result.written_files` |
| 防止误显示测试或入库成功 | `persistence_result` 的四个边界字段 |
| 更新队列和下一节点提示 | `progress` |
| 显示下一节点或最终化操作 | `allowed_commands` |

##### 前端下一阶段必须回传

非最后节点时，前端回传后端明确下发的 `start_locked_node_authoring`；最后节点时，前端回传后端
明确下发的 `finalize_workflow_contract`。前端不得根据 `next_node_type_id` 猜测命令，也不得把
阶段 D2 的候选文件再次回传。

非最后节点：

```json
{
  "command": "start_locked_node_authoring",
  "contract_id": "workflow_contract_840b8062248b4f25b2718e757d8da67a",
  "lock_sha256": "afef332f0ff384afe8f01f6e51521fe86d9e4f5dfad8b4770506befa47254ceb"
}
```

最后节点：

```json
{
  "command": "finalize_workflow_contract",
  "contract_id": "workflow_contract_840b8062248b4f25b2718e757d8da67a",
  "lock_sha256": "afef332f0ff384afe8f01f6e51521fe86d9e4f5dfad8b4770506befa47254ceb"
}
```

## 7. 阶段 E 终化工作流（`E_finalize_workflow`）

### 7.1 实际记录的事件

后端报告运行过程进度：

```text
  收到 CAX Agent 请求
  开始进行 Agent 路由
  Agent 路由完成
  开始执行 Agent 能力
  Agent 能力执行完成
  CAX Agent 请求处理完成
```

### 7.2 `data` 的结构

当前结构（已省略`payload`字段）
```json
      "类型": "chat_final",
      "请求编号": "req-real-e-finalize-workflow-8dad323ec6",
      "会话编号": "real-cylinder2d-8acabfe3d998",
      "响应": {
        "任务类型": "workflow_contract_lock",
        "状态": "workflow_ready",
        "消息": "WorkflowContractLock 命令已处理",
        "路由": {
          "任务类型": "workflow_contract_lock",
          "交互模式": "continue_task",
          "置信度": 1.0,
          "原因": "前端发送 WorkflowContractLock 结构化命令",
          "目标能力": "workflow_contract_lock",
          "需要澄清": false,
          "澄清问题": null
        },
        "需要澄清": false,
        "澄清问题": null
      },
```

### 7.3 payload 对象

##### 当前 `fixed_hot_cache/cylinder2d_workflow_full_interaction.json` 设计

```text
payload.workflow_contract_lock_report  # 合同身份与验证状态
payload.workflow_finalization_view     # 最终文档、交接、进度、审核和动作
```

真实结果的 `status=workflow_ready`、`candidate_state=workflow_materialized`，6 个节点均为
`files_persisted`。但 `validation_status=phase_2_5_confirmed`、`stage_3_completed=false`，且
`data_handoff.report.status=not_executed`，因此不能解释为工作流执行或物理验证成功。

##### 分析

阶段 E 是最终结果展示，不新增用户审核合同、节点草案或候选文件。它只展示最终物化工作流文档、
合同来源、节点完成状态和验证边界。`workflow_ready` 只表示文档装配完成；前端必须把“可交付文档”
和“尚未完成阶段 3 整图 DATA 边验证”同时展示。

##### 哪些字段要删除或精简

| 当前字段 | 调整方式 | 原因 |
|---|---|---|
| `workflow_contract_lock_report` | 合并为 `contract_ref` 与 `validation` | 去除合同身份及验证说明重复。 |
| `status`、`candidate_state` | 删除 | 外层状态与 `phase` 已足够。 |
| `workflow_document.workflowContract` | 删除 | 与 `contract_ref` 重复。 |
| `progress` 中重复合同字段、时间戳 | 精简为节点计数与状态 | 合同引用已有唯一位置，时间戳放审计记录。 |
| `data_handoff.stage` | 合并到 `validation.next_stage` | 避免另建只含阶段名的包装对象。 |
| `actions.replan_workflow` | 删除 | 它是前端导航，不是后端状态命令。 |
| `allowed_commands` | 明确为空数组 | 当前真实链路没有阶段 3 执行命令。 |

##### 推荐设计（优化之后完整内容：fixed_hot_cache/new.json）

```json
{
  "protocol_version": "2.0",
  "phase": "workflow_materialized",
  "contract_ref": {
    "contract_id": "workflow_contract_840b8062248b4f25b2718e757d8da67a",
    "contract_version": 1,
    "lock_sha256": "afef332f..."
  },
  "workflow_document": {},
  "progress": {
    "total_nodes": 6,
    "completed_nodes": 6,
    "nodes": []
  },
  "validation": {
    "status": "phase_2_5_confirmed",
    "notes": [],
    "stage_3_completed": false,
    "next_stage": "phase_3_workflow_handoff",
    "handoff_status": "not_executed",
    "handoff_reason": "阶段 3 整图 DATA 边交接尚未执行。"
  },
  "allowed_commands": []
}
```

### 7.4 前端联调结果展示

##### 需要展示给用户

阶段 E 是最终工作流结果回执，不新增审核内容。页面展示最终工作流名称、文档版本、6/6 节点落盘
状态、合同来源以及验证边界；用户不需要重新审核 A 的工作流方案、B 的详细合同或 D 阶段文件。

| 展示对象 | 字段 | 展示的业务内容 |
|---|---|---|
| 合同来源 | `contract_ref` | 最终工作流来源的 Lock 身份、版本和哈希。 |
| 最终工作流 | `workflow_document` | 服务端装配后的完整工作流文档，作为导出/后续运行输入。 |
| 节点完成状态 | `progress` | 总节点、已完成节点和各节点状态。 |
| 验证边界 | `validation` | 阶段 2.5 已确认、阶段 3 是否完成、下一阶段和未执行原因。 |
| 后续命令 | `allowed_commands` | 当前是否存在后续系统命令；空数组表示当前链路结束。 |

##### 前端联调实际需要

| 前端用途 | 需要的字段 |
|---|---|
| 选择最终交付页 | `protocol_version`、`phase` |
| 标识不可变合同来源 | `contract_ref` |
| 渲染最终画布与导出文档 | `workflow_document` |
| 展示 6/6 文件落盘状态 | `progress` |
| 区分物化完成与运行验证完成 | `validation` |
| 显示当前可用的后续操作 | `allowed_commands` |

##### 前端下一阶段必须回传

当前真实链路没有阶段 3 执行命令，因此 `allowed_commands=[]`。用户选择重新规划时，由前端导航回
阶段 A 并创建新的规划请求；不能携带旧合同 ID 伪装成阶段 E 的继续命令。未来阶段 3 接入后，必须
由后端显式增加新命令及其请求 Schema。

</span>
