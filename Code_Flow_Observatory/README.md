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
- **假数据仓库**：EchoOS Agent，仅用于保留页面切换和界面演示。

真实记录来自 2026-10-23 17:05（北京时间）在 `ws://172.20.163.11:8094/ws/sessions/debug-cfo` 发起的一次真实 WebSocket 请求。临时采集服务仅本次关闭鉴权，发送了用户提供的用户 ID、会话 ID 和提示词，并使用测试形状的 `ui_context`：`{"page":"workflow_canvas_page","visible":{"page_state":{}}}`。客户端收到 `chat_ack`。追踪器在第 52 行执行前主动抛出停止异常；随后收到的 `chat_error` 是采集动作所致，**不是业务错误或 Agent 回复**。`AgentUIContext.model_validate`、`AgentRequest` 构造、Engine 和最终回复均不在本次记录中。

原始函数调用与断点局部摘要保存在 [采集证据](evidence/ordinary-chat-prefix-8094.json)。Python 的异步协程恢复可能产生重复的 `call` 事件；页面按学习步骤归并。函数进入记录不能证明卡片片段的每一行或分支都被执行。协议卡属于源码关联，页面将它与动态证据区分。

## 卡片和交互

- 在顶部切换仓库和固定代码快照；真实仓库当前只有一个快照，版本对比页会提示这一范围。
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
