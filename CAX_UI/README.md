# 天枢 · AI 助手界面设计作品站

韶峰天工中 AI 助手天枢聊天界面设计。设计师：echo；职责：独立完成；设计时间：2026 年 9 月至 10 月；设计版本：9.30。

## 当前状态

已接入用户提供的 **17 张真实 PNG**：研发阶段 8 张、执行进度 5 张、详情弹窗 4 张。已按流程排列，保留原始文件并生成顶部预览缩略图。长弹窗默认适应宽度，可滚动阅读，也可以切换为整图预览。

**尚未部署公网网址，也尚未直接读取指定 Figma 画布。** 已核对本地 17 张 PNG 全部接入；是否与 Figma 顶层页面完全一致，仍需对照画布清单核实，因此 `verifiedComplete` 保持 `false`。展示标题根据文件名和图片内容整理，原始文件名保留在清单中。

源画布：https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=399-5081

## 本次验证

- 17 个原始 PNG 与构建产物逐字节一致；17 个高清图和 17 个缩略图均可通过本地 HTTP 访问。
- 原图合计约 11.94 MB，WebP 缩略图合计约 393 KB；4 张长图使用顶部截取预览，打开后仍展示完整原图。
- DOM 环境已检查分类、搜索、空结果、筛选后的前后导航、方向键、缩放、适应宽度、关闭和直接访问单页链接。
- 根路径与 `/CAX_UI/` 子路径构建通过。
- 当前会话无可用浏览器，尚未完成真实浏览器的视觉及手机设备验收；DOM 检查不替代此项。

## 本地运行

需要 Node.js 20.19+ 或 22.12+（推荐当前 LTS）。在 `CAX_UI` 目录运行：

```powershell
npm ci
npm run dev
```

打开终端打印的本地网址。无需数据库、API 服务、在线字体或运行时 Figma 登录。

## 导入真实页面

1. 获取指定画布全部顶层页面 Frame 的 PNG；如用 Section 分组，核对 Section 内的页面 Frame。排除嵌套的组件及局部子 Frame，避免重复收录。
2. 保留 Frame 名称，将 PNG 放在 `source/9.30/` 中。可以用子目录表示业务分类，不做分类时直接放在该目录下。建议 2× 导出；尺寸过大的页面可调整倍率。
3. 运行 `npm run import`。程序保留原始 PNG，并生成 WebP 缩略图和 `public/pages.json`；没有素材时保留空状态，不生成示例页面。
4. 如需设置顺序、名称、分类和节点对应关系，创建 `source/catalog.json`，格式如下。`file` 相对 `source/9.30/`，路径分隔符使用 `/`。以下仅为格式说明，不是实际页面清单。

```json
{
  "verifiedComplete": false,
  "pages": [
    {
      "file": "模块名称/实际导出文件.png",
      "id": "stable-page-id",
      "title": "实际 Frame 名称",
      "category": "模块名称",
      "description": "可选的设计说明",
      "nodeId": "实际 Figma 节点 ID",
      "order": 1
    }
  ]
}
```

显式设置 `id` 可以在重命名素材文件后保留分享链接。未设置时使用相对路径生成稳定 ID。未登记的 PNG 仍会导入，避免无声遗漏；清单引用了不存在的文件则报错。

逐一核对 Frame 数量、名称、版本和图片后，将每个 PNG 登记进清单，再将 `verifiedComplete` 设为 `true`。程序会检查清单与图片数量，但不能代替人工或 Figma 数据核对。

图片必须存储在项目内，不使用会过期的 Figma 临时链接。更换图片后会生成新的内容指纹文件；历史生成素材不会自动删除，必要时可在确认无引用后清理。重新导入不会自动刷新已打开网页，需刷新浏览器。

## 浏览功能

模块筛选、名称和说明搜索、懒加载缩略图；原始 PNG 查看、适应窗口、适应宽度、原尺寸、缩放、滚动；上一页/下一页、方向键切换、Esc 关闭；独立哈希链接和 PNG 下载。筛选后从结果打开时，前后切换限定在该结果集合；直接访问分享链接时可浏览全部页面。

## 构建与部署

```powershell
npm run build
npm run preview
```

将 `dist/` 部署到支持 HTTPS 的静态托管平台，构建命令 `npm run build`、输出目录 `dist`，项目根目录设置为 `CAX_UI`。仓库内存放源码不会自动发布公网网址。

若部署在 `/CAX_UI/` 子路径：

```powershell
npm run build -- --base=/CAX_UI/
```

使用哈希保存页面链接，无需服务器路由重写。部署前必须确认真实素材已全部导入、完整性核对完成，且图片与清单一起上传。当前未配置任何托管账号或自动发布流程。

## 手动调整文件说明

| 需求 | 修改文件 | 说明 |
|---|---|---|
| 修改页面标题、项目介绍、署名、设计时间 | [index.html](/D:/Git_echo/echoOS/CAX_UI/index.html)、[src/main.js](/D:/Git_echo/echoOS/CAX_UI/src/main.js) | `main.js` 中搜索“天枢”“echo”“设计时间”等文字 |
| 修改颜色、字体、间距、布局 | [src/style.css](/D:/Git_echo/echoOS/CAX_UI/src/style.css) | 页面视觉样式都在这里 |
| 增加、删除或重新排序页面 | [source/catalog.json](/D:/Git_echo/echoOS/CAX_UI/source/catalog.json) | 修改 `title`、`category`、`description`、`order` |
| 替换设计稿图片 | [source/9.30/](/D:/Git_echo/echoOS/CAX_UI/source/9.30) | 替换 PNG 后运行 `npm run import` |
| 修改页面功能 | [src/main.js](/D:/Git_echo/echoOS/CAX_UI/src/main.js) | 搜索、筛选、缩放、上一页/下一页、分享链接等功能都在这里 |
| 修改网站说明 | [README.md](/D:/Git_echo/echoOS/CAX_UI/README.md) | 仅影响说明文档，不影响网站页面 |