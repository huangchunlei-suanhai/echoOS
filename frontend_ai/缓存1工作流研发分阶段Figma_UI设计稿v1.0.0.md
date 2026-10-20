<span style="color: red">

# 缓存1工作流研发分阶段 Figma UI 设计稿 v1.0.0

> 本稿沿用 .var/new_hot/工作流研发分阶段Figma_UI设计稿v1.0.0.md 的 14 个 Frame
> 和视觉/交互组织，仅把数据绑定改为运行时缓存1的真实结构。红色内容为本次新增。

## 1. 数据源边界

### 缓存1：前端实际收到的数据

- 文件：fixed_hot_cache/cylinder2d_workflow_full_interaction.json。
- 文件是原始 WebSocket 事件数组；阶段业务结果位于各阶段成功 chat_final 事件的
  data.response.payload。agent_progress 是过程事件，不是阶段最终业务对象。
- runtime/runtime_coordinator.py 默认加载该文件；runtime/fixed_hot_workflow.py 读取成功终态，
  回放 AgentResponse，并将缓存中完全匹配的 request_id、session_id、user_id 替换为当前值。
  阶段业务 payload 不重算。因此 UI 应绑定当前 chat_final 响应的 payload，而不是把原始事件数组
  当成页面对象。前端传输协议仍是 WebSocket 的进度/Agent 响应消息。
- 缓存1有 22 个成功阶段终态：A、B、C、D1-D6 每个节点的规格/文件生成/文件落盘阶段，以及 E。
  设计稿的 D1、D2、D2.5 是可复用 UI 视图；当前节点名称和队列状态必须从当前响应读取。

### 缓存2：原 UI 设计稿的数据素材

- 文件夹：.var/new_hot/ui_design_payloads/。
- 七个拆分快照：workflow_design.json、detailed_contract_review.json、locked_preview.json、
  node_draft.json、node_candidate_files.json、node_files_persisted.json、
  workflow_finalization.json。这些是按 UI 阶段组织的 payload 设计输入，不是 RuntimeCoordinator
  配置的回放文件，也不是前端运行时响应对象。
- 原设计稿的 7 个业务阶段仍可作为 UI 分组；字段路径、列表内容和值必须全部以缓存1为准。

## 2. 两套缓存字段异同

相同点：两者表达工作流方案、研发合同、锁定预览、节点研发、文件结果和最终装配；均包含
嵌套对象与列表；多数领域概念可以对应，但不代表字段同名或值相同。

不同点及规则：

- 容器不同：缓存2是七个独立阶段 JSON；缓存1是 WebSocket 原始事件，必须先定位阶段成功
  chat_final，再取 data.response.payload。
- 外壳不同：缓存2常以 protocol_version、phase 和阶段专属对象为顶层字段；缓存1的响应外层
  有 task_type/status/message/route/payload。
- 阶段对象名不同：缓存1 A 为 workflow_authoring_view / workflow_authoring_report；B 为
  workflow_development_contract_review_view / workflow_contract_lock_report；C 为
  workflow_contract_preview_view / workflow_contract_lock_report；D 为
  workflow_contract_node_authoring / workflow_contract_node_authoring_progress / execution_context；
  E 为 workflow_finalization_view / workflow_contract_lock_report。
- D 阶段形态不同：缓存2分开使用 node_draft、candidate_files、persistence_result；缓存1在
  三个阶段都使用 workflow_contract_node_authoring，内部字段随 status/stage 改变。
- B/C/E 的层级和命名不同：例如缓存2 C 的 workflow_preview 在缓存1对应
  workflow_contract_preview_view.preview_document；缓存2队列 node_development_queue 对应缓存1
  workflow_contract_preview_view.progress。B 合同草案位于缓存1
  workflow_contract_lock_report.development_contract_draft 或 review view 中对应草案。
- 值不可照搬：旧稿的统计数、节点名、hash、风险数量、路径和验证文案来自缓存2快照，不保证
  等于缓存1；按实时 payload 列表/字段取值。缓存1字段缺失显示“未提供”，null 和空数组分别处理。
- protocol_version 并非所有缓存1阶段都处于相同层级；不得固定显示 Payload v2.0。

## 3. 页面和通用渲染

保留原稿页面 AI 工作流研发 / Payload v2、7 组 Section、14 个 Frame、卡片宽 420 px、
弹窗宽 900 px、Auto Layout、滚动、固定 Header/Footer、视觉 token 及原型连接规则；Frame 名称
沿用原稿。具体视觉约束以原稿第 2、3、11 节为准。

- 卡片状态取 response.status 和对应 view/status；主按钮只由响应里的 actions、
  stage_transition.allowed_commands 或明确 allowed_commands 决定，不按阶段猜测。
- Modal 完整显示所绑定对象的业务字段及每个数组元素；可以分区/表格/代码区呈现，不得只显示
  数量或重复显示两个内容相同的完整对象。技术关联字段 execution_context 默认不作为业务详情。
- null 显示“未提供”，空数组显示“无”，布尔值显示“是/否”；字段缺失与空值不能混淆。
- 数量、当前节点、进度、hash、风险、文件路径均来自当前缓存1响应，不使用缓存2固定样例值。

## 4. A：工作流整体方案

缓存1阶段 A_initial_planning，成功状态 ready。主视图为
response.payload.workflow_authoring_view；报告为 response.payload.workflow_authoring_report。
卡片和 Modal 优先使用 view，仅在 view 没有等价字段时从 report 补齐，避免重复展示。

### A / Card / Workflow design / 420

- 标题/名称：workflow_authoring_view.workflow.name；状态：响应 status 与 view.status。
- 摘要：workflow.goal；指标由 cgraph_workflow_spec 的 nodes/inputs/outputs/edges 实际计数。
- 假设/风险：workflow.assumptions/risks；摘要计数按实际列表。
- 校验与阻断：review.cgraph_validation、blockers、clarification_questions、next_actions。
- 操作：actions 中真实启用的命令。

### A / Modal / Workflow design details / 900

完整呈现 view.workflow（name/goal/inputs/outputs/steps/required_nodes/missing_nodes/
assumptions/risks）、view.cgraph_workflow_spec 的实际全部业务字段、view.test_plan、
view.review 和 view.actions。大型图可由专用画布承载，但不得同时重复渲染完整图 JSON。
只从 report 补充 view 中没有的校验/结果信息。

## 5. B：详细研发合同

缓存1阶段 B_generate_detailed_contract，状态 development_contract_review_ready。主视图为
workflow_development_contract_review_view，报告为 workflow_contract_lock_report。

### B / Card / Development contract / 420

- 身份/hash：review_view.contract。
- 统计：从 development_contract_draft 的外部输入/输出合同、数据源、数据边引用、edge_contracts
  以及 review.nodes 逐一读取实际列表长度。卡片需标明计数取自 draft 还是 review，不混合统计。
- 节点摘要：review.nodes[] 的 node_instance_id/node_type_id/node_contract_sha256。
- 状态、假设、风险和按钮：review_view.status/candidate_state/review/actions 实际字段。

### B / Modal / Development contract details / 900

完整呈现 review_view.contract、development_contract_draft、review、actions。合同草案展示
contract_version/workflow_name/edge_contracts/external_input_contracts/
external_output_contracts/data_source_contracts/data_edge_references/assumptions/risks；
每项合同的 consumer/producer/payload_schema/canonical_valid/invalid_cases/
semantic_invariants/carrier_policy/artifact_layout 等字段按真实对象显示。Hash 展示完整值。
不得沿用旧稿 9/2/5/6 等固定数量。

## 6. C：合同锁定预览

缓存1阶段 C_confirm_detailed_contract，状态 detailed_contract_lock_ready。对象为
workflow_contract_preview_view 和 workflow_contract_lock_report。

### C / Card / Locked preview / 420

- 合同身份：preview_view.contract 的 contract_id/contract_version/lock_sha256/progress_revision。
- 图摘要：preview_view.preview_document 的 version/nodes/edges 等真实内容及列表长度。
- 进度队列：preview_view.progress 的 contract_id/revision/nodes/updated_at；只有响应明确提供
  next node 时才显示，不自行按队列顺序推断。
- 可执行性/阻断/操作：preview_view.review/actions。

### C / Modal / Locked preview details / 900

完整呈现 contract、preview_document、progress、review、actions。预览图含 graph/nodes/edges/
subgraphs/view/workflowContract；节点和边逐项显示对象实际字段。progress.nodes 每行显示其实际
字段（如 node_type_id/status/trusted_manifest_digest/error），不假设字段一定非空。

## 7. D1：节点规格/草案

缓存1阶段 Dn_1_spec_design，状态 spec_ready。主体
workflow_contract_node_authoring，队列 workflow_contract_node_authoring_progress。

### D1 / Card / Node draft / 420

- 名称/用途：authoring.spec.name/purpose；ID/版本/分类：authoring.cgraph_node_spec。
- 端口：spec.inputs/outputs；详情以 cgraph_node_spec.inputs/outputs 为端口结构。
- 测试数量：test_plan.unit_tests/smoke_tests/golden_cases/failure_samples 实际长度。
- 校验/阻断/动作：cgraph_validation_result/blockers/stage_transition。
- 当前节点和队列取 progress；不固定为缓存2中的几何节点。

### D1 / Modal / Node draft details / 900

完整呈现 authoring 的 status/stage/spec/cgraph_node_spec/cgraph_validation_result/
implementation_plan/test_plan/tool_results/blockers/next_actions/stage_transition 及 progress。
规格、接口、runtime_hints、extensions、计划列表、测试列表、校验和命令展示所有实际字段。

## 8. D2：候选文件

缓存1阶段 Dn_2_file_generation，状态 files_ready。文件数组是
workflow_contract_node_authoring.generated_files，不是缓存2的 candidate_files。

### D2 / Card / Candidate files / 420

- 节点：cgraph_node_spec.id；文件行：generated_files[] 的 path/purpose/language/write_mode。
- 校验、预检、假设、风险、审核和阻断：authoring.file_validation_result/
  candidate_preflight_report/assumptions/risks/review_notes/blockers。
- 缓存1不保证 default_file_path 存在；字段缺失时写“未提供”，不得推断数组首项为默认文件。

### D2 / Modal / Candidate files details / 900

完整呈现节点规格、校验、预检、generated_files、假设、风险、审核说明、阻断、后续动作及状态
转移。每个文件显示 path/purpose/language/write_mode/content；源码按原始换行缩进呈现。

## 9. D2.5：文件落盘与队列

缓存1阶段 Dn_2_5_file_persistence，状态 files_persisted。结果仍在
workflow_contract_node_authoring.written_files，队列在 progress；不是缓存2的
persistence_result/node_development_queue。

### D2.5 / Card / Persistence result / 420

- 结果/节点：authoring.status/cgraph_node_spec.id；文件：written_files[] 的 path/bytes_written/
  sha256/write_mode。
- 进度/下一节点：progress.total_nodes/completed_nodes/next_node_type_id/nodes。
- 操作仅由 stage_transition.allowed_commands/next_actions 决定；null 下一节点显示“无下一节点”。

### D2.5 / Modal / Persistence result details / 900

完整呈现 authoring.status/stage/cgraph_node_spec/校验/written_files/error_code/blockers/
next_actions/stage_transition 和 progress 全部字段/队列行。Hash 完整显示。节点总数、完成状态、
行数和下一分支全部按当前响应，不假设六节点或固定完成数。

## 10. E：最终工作流

缓存1阶段 E_finalize_workflow，状态 workflow_ready。对象为 workflow_finalization_view 和
workflow_contract_lock_report。

### E / Card / Workflow finalization / 420

- 合同身份：finalization_view.contract；状态：response.status、view.status/candidate_state/review。
- 交接：view.data_handoff.stage/report；操作：view.actions 中真实 enabled 的动作。
- 不从静态装配状态推导外部求解执行已完成。

### E / Modal / Workflow finalization details / 900

完整呈现 workflow_contract_lock_report 实际提供的字段及 finalization_view 的
contract/workflow_document/data_handoff/progress/review/actions。workflow_document 含 graph/
nodes/edges/subgraphs/view，可由专用画布渲染。交接、验证说明和 stage_3_completed 依实际响应，
不得复制缓存2固定 expose 名称或结论。

## 11. 字段对应速查

| UI 阶段 | 缓存1运行时字段 | 缓存2旧稿字段 |
|---|---|---|
| A | workflow_authoring_view / workflow_authoring_report | workflow_plan / workflow_design / review |
| B | workflow_development_contract_review_view / workflow_contract_lock_report | contract / development_contract / review |
| C | workflow_contract_preview_view / workflow_contract_lock_report | contract_lock / workflow_preview / node_development_queue |
| D1 | workflow_contract_node_authoring + workflow_contract_node_authoring_progress | node_draft |
| D2 | workflow_contract_node_authoring.generated_files + progress | candidate_files / default_file_path |
| D2.5 | workflow_contract_node_authoring.written_files + progress | persistence_result / node_development_queue |
| E | workflow_finalization_view / workflow_contract_lock_report | workflow_result / validation / data_handoff |

映射仅表示领域概念对应，不表示字段同名、结构相同或值相等。绑定时以当前阶段缓存1响应为准。

## 12. 验收

- 保留原稿 14 个 Frame 的名称、尺寸、视觉和交互规则。
- 每条业务字段路径都能在缓存1对应成功 chat_final.response.payload 找到；不得回退到缓存2值。
- 使用 A/B/C/D1/D2/D2.5/E 实际阶段响应核对绑定，并检查 D2-D6 复用时节点身份、文件和进度更新。
- 空值、缺失、空数组分别呈现；无允许命令时不显示虚构按钮；Modal 不遗漏长列表、源码和嵌套字段。

</span>
