# 今知 · 官网

纯静态页面，不依赖任何框架、构建工具或外部资源（字体做了本地子集内嵌，图标为内联 SVG）。任意静态托管即可部署，目录即路由。

```
Website/
├── index.html                       /                        今知品牌首页（两个产品并列）
├── dailycourse/index.html           /dailycourse/            今知日课
├── correction/index.html            /correction/             今知错题本
├── correction/download/index.html   /correction/download     错题本下载页（与现有线上地址一致）
├── assets/
│   ├── style.css                    全站共享：色板、按钮、导航、页脚、显现动效
│   ├── mockup.css                   手机样机与 App 界面元件（两个产品页共用，按页面变量换肤）
│   ├── fonts.css                    内嵌子集字体（标题 Noto Serif SC 900 / 手写 Long Cang），自动生成
│   ├── icon-correction.png          错题本图标
│   ├── icon-dailycourse.png         日课图标
│   └── studyroom-night.jpg / -warm.jpg   日课自习室的像素画面（来自 App 截图）
└── tools/subset-fonts.js            重新生成 fonts.css
```

## 路由与导航

- 品牌首页 `/`：日 / 夜分屏，左边日课、右边错题本，悬停展开；下方是「一天的学习」时间轴和两张产品卡。
- 每个产品页的导航左侧是「今知 › 产品名」，点「今知」回到品牌首页；页脚有两个产品的互链。
- 部署到 jinzhi.fun 时请保留现有 SPA 的功能路由（`/mistake/:id` 分享页、`/correction/import`、`/correction/support`、`/correction/privacy|terms`、`/correction/android-beta` 等），只用这些静态页替换 `/`、`/correction`、`/correction/download`，并新增 `/dailycourse`。

## 各页要点

- **今知日课**：暖橙色调。首屏「一天的日课」动画（生成计划 → 专注计时 → 完成打勾 → 讲一遍 → 晚上复盘），六个真实界面的滚动场景，学习工具网格用 App 原文案，自习室区块用真实像素画面，功能一览做成课程表。目前平台为 iOS / Android，页面上标注「即将上线」，有下载链接后在 `#platforms` 卡片里加入口即可。
- **今知错题本**：深色首屏「一道错题的一生」动画，六个场景，答题卡式功能一览，多端设备组合。
- **错题本下载页**：按设备推荐安装方式；版本号与链接在页面里出现两处（卡片按钮和底部脚本），一起改；Android 二维码编码的是 APK 直链，换包后用 `npx qrcode -t svg -o android.svg "<链接>"` 重新生成。

## 字体

改了任何标题（h1 / h2）或手写批注（class 含 `hand`）的文字后，重新生成一次子集字体：

```bash
npm i subset-font        # 首次
node tools/subset-fonts.js
```

两款字体均为 SIL OFL 1.1 授权。

## 品牌

- 错题本：品牌蓝 `#376EFF`，语义色绿 `#259D56` / 红 `#E5484D` / 橙 `#F18C32` / 紫 `#7649D8`，红笔 `#E0393F`。
- 日课：品牌橙 `#E0703A`（App 内 `#ED7030` / `#DD7741`），暖墨 `#292017`，米色底 `#FCF0DA → #FFF8EC`。
- 标题字体 Noto Serif SC 900，正文系统黑体。
