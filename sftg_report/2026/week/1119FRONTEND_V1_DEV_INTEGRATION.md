# 正式前端 v1 开发联调入口

此入口供 `http://172.16.240.3:3008` 页面验证会话、票据、历史和记忆的新契约。
它只使用隔离测试身份，不验证正式平台登录 token，也不代表正式 Java 已接入。
完整消息和错误字段以《天枢长期记忆与上下文管理基础版正式前端联调协议 v1.0.0》为准。

## 当前开发地址

| 配置 | 地址 |
| --- | --- |
| `javaApiBase` | `http://172.20.163.11:8124` |
| `tianShuWsBase` | `ws://172.20.163.11:8124` |
| 页面 Origin 白名单 | `http://172.16.240.3:3008`、`http://172.16.240.56:3008` |

两个地址都指向开发网关。浏览器必须能访问 `172.20.163.11:8124`；前端页面所在
服务器可访问该地址，并不自动证明每位使用者的浏览器也可访问。当前页面使用 HTTP，
所以开发 WS 使用 `ws://`；若页面迁至 HTTPS，须改用 HTTPS/WSS 网关。

## 后端启动

在 AI 后端仓库根目录运行，保持进程运行：

```bash
PYTHONPATH=src .venv/bin/python scripts/debug/run_chat_stack.py mock_java \
  --data-root ../tian_shu_data/instances/frontend-v1-dev \
  --scene-root ../tian_shu_data/instances/frontend-v1-dev/scenes \
  --ssh-user-name huangchunlei \
  --ai-port 8194 --fake-java-port 8195 --page-port 8212 \
  --frontend-origin http://172.16.240.3:3008 \
  --frontend-origin http://172.16.240.56:3008 \
  --public-host 172.20.163.11 --public-port 8124
```

启动前需在隔离场景根下准备
`huangchunlei/sftg_cax_scene/uav_cax_scene`。当前副本位于
`../tian_shu_data/instances/frontend-v1-dev/scenes/huangchunlei/sftg_cax_scene/uav_cax_scene`，
由已有场景仓库的 `develop` 分支克隆而来。运行时只使用这个隔离副本，不直接指向
`/home/huangchunlei/sftg_cax_scene/uav_cax_scene`。启动器不创建场景资产，且公开
开发入口只允许使用 `--data-root` 内的 `--scene-root`；启用该入口时必须明确提供
`--ssh-user-name`，避免从目录列表中隐式选择场景身份。现有 `8094/8095/8112`
本地调试链路不受此实例影响。`Ctrl+C` 会关闭本命令启动的四个进程；日志在
`<data-root>/logs/`。启动器在 `<data-root>/frontend_dev_access_key` 生成权限为 `0600`
的开发登录访问密钥，后端负责人通过受控渠道交给前端联调人员；不要提交到仓库或写入
生产构建。服务重启后旧 Fake Java 登录 token 失效，前端须重新取测试 token。

## 前端开发适配

开发构建的认证适配层向 `POST <javaApiBase>/api/ai/debug-login` 发送 `{}`，并带
`X-Dev-Access: <开发登录访问密钥>` Header，取得
`{"user_id":"debug-<24位摘要>","token":"..."}`。当前 SSH 场景身份固定为
`huangchunlei`；未传 `--user-id` 时，启动器从 SSH 用户名生成稳定的调试 `user_id`。
两者分别表示平台测试主体和 SSH 场景目录名，不能混为一项。网关忽略该请求体中的身份字段，
仅使用后端启动时固定的隔离身份。后续 REST 请求使用 `token: <测试 token>` Header；
产品登录 token 不能代替它。正式 Java 模式不得调用 `debug-login`。

前端从 `POST /api/ai/sessions` 获取服务端会话 ID，每次 WS 建连先调用
`POST /api/ai/sessions/{session_id}/ws-ticket`。浏览器连接
`<tianShuWsBase>/ws/v1/sessions/{session_id}` 时必须传
`["tian-shu.v1", "ticket.<本次票据>"]` 子协议。聊天业务帧不携带 `user_id`。
历史、事件、请求状态、记忆和删除沿用正式联调协议中的公共 REST 路径。

开发网关仅转发所需的 `/api/ai/...` 公共路径和 v1 WS；不转发 `/internal/ai/`、
`/local/debug/` 或测试场景事实设置接口。Fake Java 与天枢继续监听 `127.0.0.1`。
网关仅接受上述 Origin，固定使用测试 `user_id` 和 SSH 用户 `huangchunlei`；这些限制
服务于开发联调，不能作为生产认证。场景仓库副本与账本均留在 `tian_shu_data` 隔离实例中，
不要改用真实用户运行数据或生产场景目录。

`--frontend-origin` 可以重复指定多个明确的分支地址。Origin 按 scheme、主机和端口
精确匹配；增加或移除前端开发地址时，调整启动参数并重启即可。不要使用 `*` 或通配
主机规则。

## 连通验收

浏览器开发者工具中应看到：`debug-login` 返回测试 token；`POST /sessions`
返回服务端 ID；`ws-ticket` 返回一次性票据；WS 握手成功并协商 `tian-shu.v1`；
发送 `{"type":"ping"}` 收到带相同 `session_id` 的 `pong`。随后按正式协议验收
`chat_start`、恢复历史与记忆。开发网关的自动测试覆盖上述 REST/WS 连通与 Origin、
路由边界；真实模型回答仍取决于模型配置与隔离的 `develop` 场景仓库副本。
