# 工作流研发分阶段 Figma UI 设计稿 v1.0.0

## 1. 交付目标

请 Figma AI 依据本文档，在同一页面创建 14 个可编辑的真实 Frame：

- 7 个阶段卡片 Frame，宽度固定为 `420 px`。
- 7 个阶段详情弹窗 Frame，宽度固定为 `900 px`。
- 所有 Frame 使用 Auto Layout，所有文字、图标、分隔线、状态标记和按钮必须可编辑。
- 设计内容来自真实 `response.payload` 缓存，禁止使用 Lorem ipsum、“节点 1”、
  “更多内容”、“……”等占位内容。

源数据目录：

```text
.var/new_hot/ui_design_payloads/
```

| 业务阶段 | 真实数据文件 |
|---|---|
| A | `workflow_design.json` |
| B | `detailed_contract_review.json` |
| C | `locked_preview.json` |
| D1 | `node_draft.json` |
| D2 | `node_candidate_files.json` |
| D2.5 | `node_files_persisted.json` |
| E | `workflow_finalization.json` |

## 2. Figma 页面和 Frame 组织

页面命名：`AI 工作流研发 / Payload v2`。

横向放置 7 个 Section，每个 Section 内左侧是 420 卡片，右侧是 900 弹窗，两者间距
`48 px`；Section 之间纵向间距 `120 px`。

Frame 必须使用以下确切命名：

```text
A / Card / Workflow design / 420
A / Modal / Workflow design details / 900
B / Card / Development contract / 420
B / Modal / Development contract details / 900
C / Card / Locked preview / 420
C / Modal / Locked preview details / 900
D1 / Card / Node draft / 420
D1 / Modal / Node draft details / 900
D2 / Card / Candidate files / 420
D2 / Modal / Candidate files details / 900
D2.5 / Card / Persistence result / 420
D2.5 / Modal / Persistence result details / 900
E / Card / Workflow finalization / 420
E / Modal / Workflow finalization details / 900
```

## 3. 全局视觉规范

### 3.1 设计定位

这是 CAX 工程研发工作台，界面应安静、高密度、易扫描，不是营销页。不使用渐变、
光晕、大面积插画、悬浮装饰卡片或超大标题。页面不使用“卡片套卡片”；内部分组使用
标题、分隔线、表格、列表和浅色状态带。

### 3.2 色彩 Token

```text
Canvas/Base          #F4F6F7
Surface/Primary      #FFFFFF
Surface/Subtle       #F7F8F8
Border/Default       #D9DEDF
Border/Strong        #AEB8BA
Text/Primary         #172124
Text/Secondary       #526165
Text/Muted           #758286
Accent/Teal          #087F73
Accent/Teal/Subtle   #E7F5F2
Success              #18794E
Success/Subtle       #E9F6EF
Warning              #9A6700
Warning/Subtle       #FFF4CE
Danger               #C0362C
Danger/Subtle        #FCECEA
Info                 #2563A6
Info/Subtle          #EAF2FB
Code/Background      #1F2729
Code/Text            #E8EEEE
```

主要操作使用 Teal，成功使用 Green，风险使用 Amber，错误使用 Red，信息使用 Blue。
不要让界面被单一蓝色或深色主导。

### 3.3 字体和密度

```text
中文/UI: Inter, "Noto Sans SC", sans-serif
代码/ID: "JetBrains Mono", "SFMono-Regular", monospace
Modal title: 20 px / 28 px / 600
Card title: 17 px / 24 px / 600
Section title: 14 px / 20 px / 600
Body: 13 px / 20 px / 400
Meta: 12 px / 18 px / 400
Code: 11 px / 18 px / 400
```

字号不随视口缩放；字间距为 `0`。长 ID 和 SHA 使用等宽字体，允许换行，不得溢出。

### 3.4 尺寸与组件

- 卡片 Frame：`W=420`，`H=Hug contents`，白色，1 px 边框，8 px 圆角，内边距 20 px，
  纵向 Auto Layout，间距 16 px。
- 弹窗 Frame：`W=900`，`H=960`，白色，1 px 边框，8 px 圆角，Clip content。
- 弹窗 Header：`W=Fill`、`H=72`，左右内边距 24 px，底部 1 px 分隔线，固定在滚动容器顶部。
- 弹窗 Body：`W=Fill`、`H=816`，内边距 24 px，纵向 Auto Layout，间距 24 px，
  Clip content + Prototype `Vertical scrolling`。其内容容器必须 Hug contents，保留全部长内容。
- 弹窗 Footer：`W=Fill`、`H=72`，左右内边距 24 px，顶部 1 px 分隔线，按钮右对齐。
- 按钮：高 36 px，圆角 6 px，水平内边距 14 px。熟悉命令搭配 Lucide 图标。
- Icon-only 关闭按钮：32 × 32 px，使用 `X`图标，悬浮 tooltip 为“关闭”。
- 状态标记：高 24 px，圆角 4 px，不使用胶囊式超大圆角。
- 分组标题下使用 1 px 分隔线，内容不包在额外卡片中。

### 3.5 通用卡片结构

420 Frame 从上到下固定为：

1. `Header`：阶段编号 + 阶段名，右侧状态标记。
2. `Primary summary`：当前阶段最重要的真实结论。
3. `Metrics or current item`：2–4 个紧凑指标，或当前节点/文件。
4. `Review signal`：校验、风险、阻断项或队列进度。
5. `Actions`：左侧文字按钮“查看详情”，右侧主按钮严格来自
   `allowed_commands`。`allowed_commands=[]` 时不要伪造操作。

### 3.6 完整性硬规则

- 弹窗必须展示当前阶段 payload 的所有业务字段。
- 对象的每个属性都要有标签和值；数组的每个元素都要生成对应行。
- `null` 显示为灰色文字“未提供”；空数组显示“无”；布尔值使用“是/否”或明确状态，
  不显示 `true/false` 给普通用户。
- 禁止只显示计数却丢弃列表内容；计数是导航摘要，列表仍须在弹窗中完整展开。
- 只有两个例外：A 的 `workflow_design` 和 E 的 `workflow_result` 由已有专用 Frame 承载，
  本次 14 个 Frame 中不显示其内部详情。

---

## 4. 阶段 A：工作流整体方案

### 4.1 `A / Card / Workflow design / 420`

高度建议 `620 px`。

1. Header：
   - 左：小号文字“阶段 A”，标题“工作流整体方案”。
   - 右：绿色状态“图校验通过”，`CheckCircle2`。
2. 主摘要：
   - 名称：“二维圆柱绕流最小自动化工作流”。
   - 目标完整显示：“规划一个二维圆柱绕流 CFD 工作流草案，覆盖参数化几何、网格、
     物性与边界条件、求解输入、CFD 执行及后处理；运行时由用户绑定几何、流动、求解和
     输出目录参数。”
3. 紧凑指标行：`6 个节点`、`9 个输入`、`2 个输出`、`11 条边`。
4. “方案前提”：显示 4 条 assumptions，每条使用 `Dot`。
5. “主要风险”：只在卡片显示前 2 条，并标注“共 4 项”；不使用省略号。
6. 状态带：淡黄色，文字“6 个规划节点当前未入库，需要进入节点研发。”
7. Actions：
   - 左：`ExternalLink` + “打开工作流图”，跳转已有 `workflow_design` 专用 Frame。
   - 中：“查看详情”。
   - 右主按钮：`FileSignature` + “生成详细研发合同”。

### 4.2 `A / Modal / Workflow design details / 900`

Header 标题“工作流整体方案”，副标题“二维圆柱绕流最小自动化工作流”，右侧显示
`Payload v2.0`和关闭图标。

Body 按以下顺序：

1. `方案目标`：完整显示 `workflow_plan.name` 和 `workflow_plan.goal`。
2. `工作流图`：一条 Info 状态带：“图结构由专用 Workflow Design Frame 展示”；下方显示
   6/9/2/11 统计和“打开工作流图”按钮。不渲染 `workflow_design` 内部 JSON。
3. `前提假设`：完整显示 `workflow_plan.assumptions` 的 4 条文本。
4. `方案风险`：完整显示 `workflow_plan.risks` 的 4 条文本，使用 Amber 左边线。
5. `验证计划`：三个全宽分组，依次完整显示：
   - `review.test_plan.smoke_tests`：3 条。
   - `review.test_plan.validation_cases`：3 条。
   - `review.test_plan.failure_samples`：4 条。
6. `系统校验`：
   - `valid`：绿色“通过”。
   - `errors`：“无”。
   - `warnings`：完整显示真实警告：
     `workflow contains non-existing nodes: geometry_generation, mesh_generation, case_configuration, solver_input_generation, cfd_execution, postprocessing`。
7. `澄清与阻断`：`clarification_questions` 为“无”，`blockers` 为“无”。

Footer：“关闭”和主按钮“生成详细研发合同”。

---

## 5. 阶段 B：详细研发合同

### 5.1 `B / Card / Development contract / 420`

高度建议 `640 px`。

1. Header：“阶段 B / 详细研发合同”，右侧绿色“可确认”。
2. 工作流名：`cylinder2d_cfd_minimal_workflow`。
3. 统计网格：`6 个节点`、`9 个外部输入`、`2 个外部输出`、`5 个数据源`、
   `6 个数据边引用`。
4. “节点合同”：按顺序显示 6 行节点实例 ID，每行显示绿色 `Check`和 hash 前 8 位：
   - `geometry_generation`
   - `mesh_generation`
   - `case_configuration`
   - `solver_input_generation`
   - `cfd_execution`
   - `postprocessing`
5. 状态带：“阻断项 0；假设 14；风险 11”。
6. Actions：“查看完整合同”；主按钮 `LockKeyhole` + “确认并锁定合同”。

### 5.2 `B / Modal / Development contract details / 900`

Header：标题“详细研发合同”，副标题 `cylinder2d_cfd_minimal_workflow`，右侧“6 个节点”。

Body 顺序：

1. `合同身份`：显示工作流名、`contract_version`、完整
   `development_contract_sha256`、完整 `review_id`。所有 hash 右侧放 `Copy`图标。
2. `合同统计`：显示 6/9/2/5/6 五个指标。
3. `节点导航`：6 行表格，列为实例 ID、节点类型 ID、外部输入数、外部输出数、
   数据源数、数据边数、完整 SHA-256。必须完整生成 6 行，不得只展示前 3 行。
4. `外部输入合同`：从 JSON 的 `development_contract.external_input_contracts` 完整生成 9 个
   可展开行。每行默认展开，必须显示：
   `binding_name`、`consumer`、`dtype`、`payload_schema`、`canonical_valid`、
   `invalid_cases`、`semantic_invariants`、`carrier_policy`、`artifact_layout`。
5. `外部输出合同`：从 `external_output_contracts` 完整生成 2 个展开行，显示
   `binding_name`、`producer`、`dtype`、`payload_schema`、`canonical_valid`、
   `invalid_cases`、`semantic_invariants`、`carrier_policy`、`artifact_layout`。
6. `数据源合同`：从 `data_source_contracts` 完整生成 5 个展开行，显示
   `data_contract_id`、`producer`、`dtype`、`carrier_policy`、`payload_schema`、
   `canonical_valid`、`invalid_cases`、`semantic_invariants`、`artifact_layout`。
7. `数据边引用`：从 `data_edge_references` 完整生成 6 行，显示
   `graph_edge_id`、`data_contract_id`、`consumer`。
8. `编译边视图`：本次真实 `edge_contracts=[]`，显示“无”，不伪造边合同。
9. `假设`：完整显示 `development_contract.assumptions` 和 `review.assumptions`，
   若两处文本相同，UI 只展示一份去重列表，但标注“合同与评审一致”。
10. `风险`：同上，完整显示所有真实风险，不截断。
11. `阻断项`：“无”。

对 `payload_schema`、`canonical_valid`、`consumer`、`producer` 等嵌套对象，使用浅灰底的
Key/Value 树，保留每个键和完整值，不将整个弹窗做成一块 JSON 代码。

Footer：“关闭”；主按钮“确认并锁定合同”。

---

## 6. 阶段 C：合同锁定与研发队列

### 6.1 `C / Card / Locked preview / 420`

高度建议 `590 px`。

1. Header：“阶段 C / 合同已锁定”，右侧 Teal 状态“只读” + `LockKeyhole`。
2. 合同身份：`workflow_contract_14ac526c60b0418b8683f1f567cc558f`，版本 `1`，
   进度修订 `1`。
3. 图预览摘要：`6 个节点`、`5 条控制连线`、“不可执行：节点待研发”。
4. 研发进度：`0 / 6`，进度条 0%。
5. “下一节点”：`cylinder2d_geometry_generator`。
6. 队列预览：完整列出 6 个节点，全部为灰色“待研发”。
7. Actions：“查看锁定详情”；主按钮 `Play` + “开始研发下一节点”。

### 6.2 `C / Modal / Locked preview details / 900`

Header：“已锁定工作流”，副标题“只读预览与节点研发队列”。

Body：

1. `合同锁定信息`：完整显示 `contract_id`、`contract_version=1`、完整
   `lock_sha256`、`progress_revision=1`。
2. `只读工作流预览`：不允许编辑节点位置、连线、端口和属性。完整渲染
   `workflow_preview`：
   - 顶部属性行：`version`、`workflowContract.contractId`、`contractVersion`、
     `lockSha256`、`mode`、`executable`。
   - 中部画布：按 `view.forShowNodesConns` 的位置生成全部 6 个节点和全部连线，
     支持画布内缩放/平移，不允许拖拽修改。
   - 节点检查器：对 `workflow_preview.nodes` 的 6 个元素逐个创建可展开行，每个行完整
     显示其 `__type__`、`uid`、`source`、`args`、`kwargs`、`links`、`canvas_id`、
     `title`、`name`、`nodeType`、`description`、`category`、`categoryKey`、
     `definition`、`dslArgs`、`dslKwargs`、`nodeInfo`、`position`、`portConnections`、
     `outputPortConnections`、`sourceType`、`nodeDescriptionUser`、`style`、`factory`、
     `version`、`graphId`、`isGroup`、`isLoopNode`、`parentNode`、`receivers`。
   - 边检查器：完整列出 `workflow_preview.edges` 的 5 个元素，显示 `source`、
     `sourcePort`、`target`。
   - 图属性：完整显示 `graph.__type__`、`uid`、`starters`、`exposes`、`subgraphs`、
     `view.forShowNodesConns.viewport`。
3. `节点研发队列`：显示 `contract_id`、`revision=1`、`total_nodes=6`、
   `completed_nodes=0`、`next_node_type_id=cylinder2d_geometry_generator`。
4. 队列表必须完整显示 6 行，列为 `node_type_id`、`status`、
   `trusted_manifest_digest`、`error`。本快照全部 `status=pending`，后两列显示“未提供”。

Footer：“关闭”；主按钮“开始研发下一节点”。

---

## 7. 阶段 D1：当前节点草案

### 7.1 `D1 / Card / Node draft / 420`

高度建议 `680 px`。

1. Header：“阶段 D1 / 当前节点草案”，右侧绿色“规格就绪”。
2. 节点标题：“二维圆柱参数化几何生成”。
3. ID：`cylinder2d_geometry_generator`；版本 `0.1.0`；分类 `geometry.model`。
4. 用途完整显示：“实现冻结接口对应的二维圆柱流体域几何生成逻辑，依据圆柱直径、中心坐标和
   计算域尺寸生成可直接传递给网格节点的结构化几何定义及边界命名。”
5. 接口摘要：`3 个输入`、`1 个输出`；显示 3 个输入端口名和 `geometry_definition`。
6. 计划统计：`8 个实现步骤`、`8 个单元测试`、`4 个冒烟测试`、`3 个黄金样例`、
   `9 个失败样例`。
7. 校验带：绿色“结构校验通过，0 错误，0 警告”。
8. Actions：“查看节点详情”；主按钮 `Files` + “生成候选文件”。

### 7.2 `D1 / Modal / Node draft details / 900`

Header：“节点草案”，副标题“二维圆柱参数化几何生成”，显示版本 `0.1.0`。

Body：

1. `基本信息`：完整显示 `contract_id`、`node_draft.name`、`purpose`，以及
   `node_spec` 的 `id/version/kind/display_name/description/category/tags/icon/runtime_hints`。
2. `输入端口`：完整显示 3 个端口 `cylinder_diameter`、`cylinder_position`、
   `domain_dimensions`。每个端口显示 `name/display_name/description/dtype/tags/default/minimum/maximum/`
   `max_length/items/semantic_type/unit/extensions`。
3. `输出端口`：完整显示 `geometry_definition` 的同样全部端口属性。
4. `领域扩展`：完整显示 `extensions.semantic_role`、`physics_domains`、`constraints`。
5. `实现计划`：按顺序完整显示 `implementation_plan.steps` 8 条；显示
   `required_tools` 为“无”；完整显示 `files_to_create` 3 条和 `review_notes` 5 条。
6. `测试计划`：分为四个全宽分组，分别完整显示 8 个 `unit_tests`、4 个
   `smoke_tests`、3 个 `golden_cases`、9 个 `failure_samples`。
7. `评审`：显示 `review.validation.valid=通过`，错误和警告为“无”；完整显示
   `review.assumptions`、`review.risks`、`review.blockers`。

Footer：“关闭”；主按钮“生成候选文件”。

---

## 8. 阶段 D2：当前节点候选文件

### 8.1 `D2 / Card / Candidate files / 420`

高度建议 `620 px`。

1. Header：“阶段 D2 / 候选文件”，右侧绿色“预检通过”。
2. 节点 ID：`cylinder2d_geometry_generator`。
3. 默认文件：`executor/cylinder2d_geometry_generator.py`。
4. 文件列表完整显示 3 行：
   - `manifest.json` / JSON / create / 后端确定性编译的 CGraph manifest。
   - `executor/cylinder2d_geometry_generator.py` / Python / create / CGraph 节点执行入口。
   - `tests/test_cylinder2d_geometry_generator.py` / Python / create / pytest 单元测试。
5. 校验带：“文件校验通过，0 错误，0 警告”；`candidate_preflight` 显示“未提供”。
6. 审核摘要：`2 项假设`、`2 项风险`、`3 条审核说明`、`0 阻断`。
7. Actions：“审查全部文件”；主按钮 `Save` + “确认并落盘”。

### 8.2 `D2 / Modal / Candidate files details / 900`

Header：“审查候选文件”，副标题 `cylinder2d_geometry_generator`，显示“3 个文件”。

Body：

1. `基本信息`：完整显示 `contract_id`、`node_id`、`default_file_path`。
2. `文件导航`：顶部粘性 Tab 显示 3 个完整路径，默认选中
   `executor/cylinder2d_geometry_generator.py`。
3. `全部候选文件`：不论 Tab 默认选中项，滚动主体中都必须按以下顺序放入
   3 个完整文件区块，确保静态设计稿也包含全部内容：
   - `manifest.json`：显示 path、purpose、language、write_mode，代码区完整绑定 `content`。
   - `executor/cylinder2d_geometry_generator.py`：同上，代码区完整绑定 Python 源码。
   - `tests/test_cylinder2d_geometry_generator.py`：同上，代码区完整绑定测试源码。
4. 代码区使用 `Code/Background`，等宽 11 px，保留换行和缩进，显示行号；不得使用
   “代码过长”、“详见附件”或省略号取代 `content`。
5. `文件校验`：完整显示 `file_validation.valid/errors/warnings`和
   `candidate_preflight=未提供`。
6. `生成评审`：完整显示 `review.assumptions` 2 条、`risks` 2 条、
   `review_notes` 3 条和 `blockers=无`。

Footer：左侧警告文字“确认后将写入服务端工作区”；右侧“关闭”和主按钮
“确认 3 个文件并落盘”。

---

## 9. 阶段 D2.5：文件落盘与队列状态

### 9.1 `D2.5 / Card / Persistence result / 420`

高度建议 `590 px`。

1. Header：“阶段 D2.5 / 文件已落盘”，右侧绿色 `CheckCircle2` + “成功”。
2. 节点 ID：`cylinder2d_geometry_generator`。
3. 文件结果：“3 个文件已写入”，完整显示 3 个相对路径和字节数。
4. 队列进度：`1 / 6`，进度条 16.7%。
5. 下一节点：`cylinder2d_mesh_generator`。
6. 队列摘要：“几何节点已落盘；其余 5 个节点待研发”。
7. Actions：“查看落盘详情”；主按钮 `ArrowRight` + “继续下一节点”。

此卡片展示的是真实缓存中的“非最后节点”分支。另创建一个同 Frame 内的 Component Variant
`Last node`：`next_node_type_id=null`时，主按钮改为“生成最终工作流”，命令为
`finalize_workflow_contract`。

### 9.2 `D2.5 / Modal / Persistence result details / 900`

Header：“节点文件已落盘”，副标题 `cylinder2d_geometry_generator`。

Body：

1. `落盘结论`：显示 `status=files_persisted`、`node_id`、`error_code=未提供`、
   `blockers=无`。
2. `已写入文件`：完整显示 3 行表格，列为 `path`、`bytes_written`、完整 `sha256`、
   `write_mode`。每个 hash 右侧有 `Copy`图标；不显示服务器绝对路径。
3. `研发队列摘要`：显示 `contract_id`、`total_nodes=6`、`completed_nodes=1`、
   `next_node_type_id=cylinder2d_mesh_generator`和 16.7% 进度条。
4. `完整队列`：生成 6 行，列为 `order`、`node_type_id`、`instance_ids`、
   `contract_status`、`authoring_stage`。第 1 行绿色“文件已落盘”，第 2 行标记“下一节点”，
   其余行灰色“待研发”。
5. `后续分支`：信息带明确写“队列存在下一节点，允许继续 D1”。

Footer：“关闭”；主按钮“继续下一节点”。同样创建 `Last node` Footer Variant，
主按钮为“生成最终工作流”。

---

## 10. 阶段 E：最终工作流结果

### 10.1 `E / Card / Workflow finalization / 420`

高度建议 `540 px`。

1. Header：“阶段 E / 工作流已生成”，右侧绿色 `CheckCircle2` + “已确认”。
2. 结论：“工作流静态装配完成”。
3. 合同身份：`workflow_contract_14ac526c60b0418b8683f1f567cc558f`，版本 `1`，
   进度修订 `19`。
4. 验证状态：Amber 状态“阶段 2.5 已确认”；明确文字“阶段 3 尚未执行”。
5. DATA 交接：“未执行”，原因“阶段 3 整图 DATA 边交接尚未执行。”
6. Actions：`ExternalLink` + “打开最终工作流”，跳转已有 `workflow_result` 专用 Frame；
   “查看结果详情”。因 `allowed_commands=[]`，不得显示任何推进主按钮。

### 10.2 `E / Modal / Workflow finalization details / 900`

Header：“最终工作流结果”，副标题“静态装配与验证状态”。

Body：

1. `最终工作流`：Info 状态带：“最终 workflow JSON 由专用 Workflow Result Frame 展示”；
   显示“打开最终工作流”按钮。不渲染 `workflow_result` 的节点、边或 JSON 详情。
2. `合同溯源`：完整显示 `contract_id`、`contract_version=1`、完整 `lock_sha256`、
   `progress_revision=19`。
3. `验证状态`：
   - `validation_status=phase_2_5_confirmed` 翻译为“阶段 2.5 已确认”。
   - `stage_3_completed=false` 翻译为“阶段 3 未完成”。
   - 完整显示 2 条 `validation_notes`：
     1. “已完成阶段 2.5 人工确认、候选摘要复核和静态接口复核。”
     2. “未执行阶段 3 外部求解器、物理正确性或性能验证。”
4. `DATA 合同交接`：完整显示
   `stage=phase_2_5_contract_handoff`、`report.valid=否`、`report.status=not_executed`、
   `report.reason=阶段 3 整图 DATA 边交接尚未执行。`
5. `后续边界`：Amber 说明带：“当前结果可用于预览与静态审核，不代表 CFD 物理结果已验证。”

Footer：只显示“关闭”和次要按钮“打开最终工作流”，不显示主推进按钮。

---

## 11. 原型交互连接

1. 每个卡片的“查看详情”连接对应 900 Frame，Interaction 为 `Open overlay`。
2. Overlay 居中，背景遮罩 `#172124` / 40%，点击遮罩不自动关闭，避免长内容审核时误触。
3. Header 的 `X` 和 Footer 的“关闭”都执行 `Close overlay`。
4. 详情 Body 纵向滚动，Header/Footer 固定。
5. A 的“打开工作流图”连接现有 `workflow_design` 专用 Frame。
6. E 的“打开最终工作流”连接现有 `workflow_result` 专用 Frame。
7. 本设计稿中主按钮只展示命令意图，不需要伪造下一阶段 Frame 跳转；真实交互由前端根据
   `allowed_commands` 发起 WebSocket 命令。

## 12. Figma AI 完成后自检

- [ ] 恰好 14 个顶层 Frame，7 个宽 420，7 个宽 900。
- [ ] 每个 Frame 都使用 Auto Layout，文字不溢出。
- [ ] 900 Frame 均为 960 高的滚动弹窗，内容容器 Hug contents。
- [ ] 每个阶段的真实列表项数与 JSON 一致。
- [ ] B 弹窗包含 9 个外部输入、2 个外部输出、5 个数据源、6 个边引用的完整属性。
- [ ] C 弹窗包含 6 个节点的完整预览属性、5 条边和 6 行研发队列。
- [ ] D1 弹窗包含全部端口属性、8 个实现步骤和全部测试条目。
- [ ] D2 弹窗的 3 个文件 `content` 全部存在于设计稿，没有省略。
- [ ] D2.5 弹窗包含 3 个文件的完整 SHA-256 和 6 行队列。
- [ ] A 不展开 `workflow_design`，E 不展开 `workflow_result`。
- [ ] E 没有伪造后续命令，且没有把阶段 2.5 显示成阶段 3 已验证。
- [ ] 页面无渐变、无装饰光晕、无嵌套卡片、无超过 8 px 的卡片圆角。

