---
name: write-meeting-note
description: Turn a meeting recording or transcript plus repository context into a Tiangong meeting note, especially weekly meeting notes for `kb/meetings`. Use when the user asks to整理会议转写稿、生成会议纪要、参考历史纪要风格输出 Markdown、校正人名/项目名/术语、或按韶峰天工例会规范整理周会内容. Enforce repository-backed normalization of names, project titles, and terms; separate facts from decisions; and mark uncertainty instead of guessing homophone names or project names.
---

# Write Meeting Note

Use this skill when the user wants Codex to整理、改写或生成韶峰天工项目组会议纪要，尤其是周会纪要。

目标不是“把转写稿润色一下”，而是按仓库事实源约束输出，尽量减少以下错误：

- 人名同音错字。
- 项目名、平台名、术语写错。
- 把讨论误写成决定。
- 把模糊表述写成确定结论。
- 行动项缺负责人、缺时间或缺目标。

## Inputs

优先处理以下输入组合：

1. 会议转写文本 + 1 份历史纪要。
2. 会议转写文本 + 当前仓库上下文。
3. 音频文件 + 历史纪要。

如果只有音频但当前会话里没有可用的转写能力，先说明需要转写结果后再整理纪要；不要直接假装听懂音频内容。

## Source Priority

整理纪要前，先查本仓库中的事实源。优先级如下：

1. 用户本次明确提供的会议基础信息。
2. `templates/weekly_report_submission/member_registry.json`
   用于校验成员姓名、slug、方向等。
3. `kb/meetings/*.md`
   用于参考最近纪要的结构、措辞和常见参会成员/项目名称。
4. `kb/issues/4/tiangong_issue_4.md`
   用于统一核心术语。
5. `kb/reference/node_taxonomy_definition.md`
   用于统一 CAX 节点相关术语。
6. 其他 `kb/` 下与本次会议主题直接相关的项目文档。

对不确定的人名、术语、项目名，先检索仓库，再写纪要。

## Meeting Title and Date Defaults

- 对常规周会纪要，默认使用固定 H1 标题：
  `# 韶峰天工例会 | 会议纪要｜<YYYY-MM-DD>`
- 除非用户明确指定其他标题，否则周会纪要不要再生成专题式 H1 标题。
- 对常规周会纪要，H1 中的日期默认归一化为该次会议所在周的周五日期。
- `一、会议信息` 里的“会议时间”仍按转写稿、导出文件名或仓库上下文中的真实时间填写。
- 如果无法可靠判断会议属于哪一周，不要猜测周五日期，直接标注 `待确认`。

## Stable Weekly Meeting Defaults

- For regular weekly meetings, default the participant list to:
  `魏华祎、李焱林、田昊伦、肖瑶、李坚、刘琴、李本桢、黄春蕾、刘洋、刘思舜`
- Unless the user explicitly states a participant change for that week, prefer the fixed weekly participant list instead of writing `待确认`.
- For action items and direction-based work summaries, use these stable owner mappings when the transcript only mentions the direction and does not clearly name a person:
  - 前端：肖瑶
  - 后端：李坚
  - AI：黄春蕾、刘洋、刘思舜
  - 算法：刘琴、李本桢
- For scheduling / school timetable / 排课系统 related work, default the responsible people to:
  `李坚、刘汉彬`
- Only override the stable owner mapping when the transcript or user clearly names a different responsible person for that specific item.

## Workflow

### 1. Check Readiness

- 如果只有音频，先确认是否能获得转写文本。
- 如果已有转写文本，先快速判断内容是否足以提取会议主题、讨论点和行动项。
- 如果关键信息缺失，继续整理时必须显式标记 `待确认`。
- 在起草前，先判断这是常规周会还是专题讨论会。
- 如果是常规周会，先应用固定标题和“当周周五”日期规则，再写正文。

### 2. Extract Raw Facts First

先从转写文本中抽取原始事实，不要急着写 prose：

- 会议主题。
- 时间、形式、组织者、记录人。
- 参会人员候选。
- 议题列表。
- 已明确结论。
- 待确认问题。
- 风险。
- 行动项、负责人、时间节点。

优先区分：

- 事实：有人说了什么、当前进展是什么。
- 裁决：会议明确拍板了什么。
- 待确认问题：会中没有定论、会后还要补的内容。
- 风险：若不推进会造成什么问题。

### 3. Normalize People, Projects, and Terms

对每个关键实体做归一化：

- 人名：以成员表和历史纪要为准。
- 项目名：以仓库中已存在的稳定写法为准。
- 平台与术语：以相关 issue、reference、历史纪要为准。
- 同音词：只有在仓库里能找到明确对应候选且上下文匹配时才替换。
- 对常规周会的参会人员、方向负责人和排课负责人口径，优先使用本 skill 中的稳定默认值，再结合仓库事实源校正。

如果无法可靠确认，使用 `【待确认：...】` 标出，不要猜。

### 4. Draft in Stable Structure

默认按最近 `kb/meetings` 的稳定结构输出。

如果是专题讨论会而不是普通周会，可以调整“四、各方向进展与后续计划”的分组名称，但不要打乱大结构，除非用户明确要求换模板。

推荐骨架：

```markdown
# 韶峰天工例会 | 会议纪要｜<YYYY-MM-DD>

## 一、会议信息
- 会议主题：
- 会议时间：
- 会议形式：
- 组织者：
- 记录人：
- 参会人员：
- 关联项目：

## 二、会议目标
1. ...
2. ...

## 三、会议产出总览
### 1. 事实（Facts）
### 2. 裁决（Decisions）
### 3. 待确认问题（Open Questions）
### 4. 风险（Risks）

## 四、各方向进展与后续计划

## 五、跨方向协同与治理事项

## 六、行动项（Actions）

## 七、会后转化与跟进

## 八、治理声明
```

### 5. Self Check

最终输出前，至少自检以下几点：

- 人名是否能在仓库中找到一致写法。
- 项目名和术语是否与既有文档一致。
- 是否把“讨论”误写成“决议”。
- 每条行动项是否有负责人、目标、时间点；没有就写 `待确认`。
- 是否保留了必要的不确定性提示。
- 如果是周会，H1 是否已统一为 `韶峰天工例会 | 会议纪要｜<YYYY-MM-DD>`。
- 如果是周会，H1 日期是否已归一化到该周周五。
- 如果是周会，参会人员是否优先使用固定名单。
- 如果行动项只写了方向，是否已按稳定负责人映射补足到个人。
- 如果涉及排课系统，负责人是否优先写为 `李坚、刘汉彬`，除非有更明确的会中指定。

## Hard Rules

1. 不要把“讨论建议”写成“已定事项”。
2. 不要把“会后补充”写成“会议已确认”。
3. 不要虚构参会人员、负责人、截止时间或项目名称。
4. 不要为求流畅删除关键不确定性；不确定就标注 `待确认`。
5. 行动项缺少负责人时，不得补猜，直接写 `待确认`。
6. 如果转写文本表达口语化，可以整理语言，但不能改写原意。
7. 如果多个历史纪要格式有差异，优先参考最近两到三份同类型会议纪要。
8. 对常规周会纪要，H1 必须使用 `韶峰天工例会 | 会议纪要｜<YYYY-MM-DD>`，除非用户明确要求其他标题。
9. 对常规周会纪要，H1 日期必须归一化为该周周五，除非用户明确要求其他日期规则。
10. 对常规周会纪要，参会人员默认使用固定周会名单，除非用户明确说明当周有变化。
11. 对常规周会纪要，方向性行动项可按稳定负责人映射落到个人，不必因转写未点名而一律写 `待确认`。
12. 涉及排课系统的事项，负责人默认写 `李坚、刘汉彬`，除非用户或转写明确给出其他安排。

## Useful Search Pattern

需要核对时，优先使用 `rg`：

```powershell
rg -n "member_name_zh" templates/weekly_report_submission/member_registry.json
rg --files kb/meetings
rg -n "刘洋|刘琴|李本桢|韶峰天工|CAX|排课|无人机" kb
```

## Output Discipline

- 优先输出可直接入库的 Markdown。
- 如果存在未核实信息，集中留在对应字段中，不要额外长篇解释。
- 若本次结果依赖低质量转写，结尾可加 1 行简短说明：`本纪要根据转写稿整理，个别专有名词待人工复核。`
