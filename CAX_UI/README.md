# 天枢 · AI 助手界面设计作品站

韶峰天工中 AI 助手天枢聊天界面设计。设计师：echo；职责：独立完成；设计时间：2026 年 9 月起；设计版本：9.30、新版。

公开浏览地址：https://huangchunlei-suanhai.github.io/echoOS/

## 当前状态

9.30 版本已接入用户提供的 **17 张真实 PNG**：研发阶段 8 张、执行进度 5 张、详情弹窗 4 张。已按流程排列，保留原始文件并生成顶部预览缩略图。长弹窗默认适应宽度，可滚动阅读，也可以切换为整图预览。

新版已根据提供的图层清单接入 **8 张真实 PNG**：知识候选 2 页、正文回复 3 页、正在思考执行 3 页。原图位于 `source/new/`，站点已生成对应的预览和大图。

**尚未直接读取指定 Figma Frame 的内容。** Figma 公开预览只提供整张画布缩略图；文件节点接口需要授权。已核对本地 25 张 PNG 全部接入；两个版本的 `verifiedComplete` 均保持 `false`，直到逐一对照 Figma 页面原稿。

9.30 画布：https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=399-5081

新版画布：https://www.figma.com/design/rK2pzdICRD9Drw7uUhy2Ne/?node-id=605-5195

## 本次验证

- 25 个页面均有本地 PNG 原稿与 WebP 缩略图；构建生成 25 个可浏览页面。
- 浏览器已检查版本切换、分类、搜索、旧版大图前后切换和手机宽度布局。
- 根路径与子路径构建通过。

## 本地运行

需要 Node.js 20.19+ 或 22.12+（推荐当前 LTS）。在 `CAX_UI` 目录运行：

```powershell
npm ci  # 根据项目中的 package-lock.json 安装 vite、sharp 等依赖。
npm run dev
```

打开终端打印的本地网址。无需数据库、API 服务、在线字体或运行时 Figma 登录。

## 导入真实页面

1. 后续更换设计稿时，从 Figma 将对应 Frame 逐一导出为 PNG，保留 Frame 名称；不要导出整张画布。建议 2× 导出，尺寸过大时可调整倍率。
2. 新版图片放入 `source/new/`，文件名与 `source/catalog-new.json` 中的 `file` 一致。9.30 版图片保留在 `source/9.30/`。
3. 运行 `npm run import`。程序保留原始 PNG，并生成 WebP 缩略图和 `public/pages.json`。新版尚未导入的条目保持待导入状态。
4. 如需调整顺序、名称、分类和节点对应关系，修改对应版本的清单。以下仅为字段格式说明，非实际页面清单。

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

显式设置 `id` 可以在重命名素材文件后保留分享链接。未设置时使用版本和相对路径生成稳定 ID。未登记的 PNG 仍会导入，避免无声遗漏。旧版清单引用不存在的文件会报错；新版可暂缺图片，待全部导入并核对后再将 `verifiedComplete` 设为 `true`。

逐一核对 Frame 数量、名称、版本和图片后，将每个 PNG 登记进清单，再将对应版本的 `verifiedComplete` 设为 `true`。程序会检查清单与图片数量，但不能代替人工或 Figma 数据核对。

图片必须存储在项目内，不使用会过期的 Figma 临时链接。更换图片后会生成新的内容指纹文件；历史生成素材不会自动删除，必要时可在确认无引用后清理。重新导入不会自动刷新已打开网页，需刷新浏览器。

## 浏览功能

版本切换、模块筛选、名称和说明搜索、懒加载缩略图；原始 PNG 查看、适应窗口、适应宽度、原尺寸、缩放、滚动；上一页/下一页、方向键切换、Esc 关闭；独立哈希链接和 PNG 下载。筛选后从结果打开时，前后切换限定在该结果集合；直接访问分享链接时可浏览同版本页面。未导入原稿的条目链接到对应 Figma 画布。

## 构建与部署

```powershell
npm run build -- --base=./
npm run preview
```

当前公开站点由 GitHub Pages 托管，源码位于 `develop` 分支的 `CAX_UI/`，`dist/` 内容发布在 `gh-pages` 分支根目录。更新页面后需要重新构建并更新该发布分支；只推送源码不会自动更新公网网站。

若另行部署在 `/CAX_UI/` 子路径：

```powershell
npm run build -- --base=/CAX_UI/
```

使用哈希保存页面链接，无需服务器路由重写。发布前确认图片与清单一起上传。

## 手动调整文件说明

| 需求 | 修改文件 | 说明 |
|---|---|---|
| 修改页面标题、项目介绍、署名、设计时间 | [index.html](./index.html)、[src/main.js](./src/main.js) | `main.js` 中搜索“天枢”“echo”“设计时间”等文字 |
| 修改颜色、字体、间距、布局 | [src/style.css](./src/style.css) | 页面视觉样式都在这里 |
| 增加、删除或重新排序页面 | [source/catalog.json](./source/catalog.json)、[source/catalog-new.json](./source/catalog-new.json) | 修改 `title`、`category`、`description`、`order` |
| 替换设计稿图片 | [source/9.30/](./source/9.30/)、[source/new/](./source/new/) | 替换 PNG 后运行 `npm run import` |
| 修改页面功能 | [src/main.js](./src/main.js) | 搜索、筛选、缩放、上一页/下一页、分享链接等功能都在这里 |
| 修改网站说明 | [README.md](./README.md) | 仅影响说明文档，不影响网站页面 |
