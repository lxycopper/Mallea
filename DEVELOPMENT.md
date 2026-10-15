# 项目网页开发与交接指南

适用仓库：[lxycopper/Mallea](https://github.com/lxycopper/Mallea)

线上地址：[lxycopper.github.io/Mallea](https://lxycopper.github.io/Mallea/)

更新日期：2026-10-11

## 1. 先了解项目现状

这是一个已经配置好 GitHub Pages 的公开网页仓库，使用 Academic Project Page Template。目前网页仍是模板示例，真实的项目名称、作者、特点说明和 demo 等待开发者替换。

技术栈为 HTML、CSS 和 JavaScript，样式使用 Bulma，轮播由模板自带脚本实现。当前没有 npm 构建步骤，准备 Git 和 Python 3 即可开发；编辑器可使用 VS Code 或其他工具。

发布配置位于 `.github/workflows/pages.yml`：

- 推送到 `main` 且修改了 `site/` 或发布工作流，会自动部署。
- 只有 `site/` 的内容会发布到网页。
- 开发分支上的修改不会更新线上网站。
- 仅修改根目录下的 README 或本指南，不会触发网站部署。

GitHub Pages 托管静态页面。播放视频、切换选项、前后对比等浏览器交互可以直接实现；在线运行模型或生成新结果需要另外提供后端服务。

## 2. 本轮开发的目标

建议按以下顺序组织首页：

| 区域 | 需要准备和实现的内容 |
| --- | --- |
| 首屏 | 正式项目名、一句话简介、作者与单位、可用的论文或相关链接；总览视频按需提供 |
| 特点 1 | 特点标题、解释文字、对应的解析 demo，以及说明“看哪里”的字幕或标注 |
| 特点 2 | 同上，使用一致的结构 |
| 特点 3 | 同上，使用一致的结构 |
| 完整 demo | 20 个独立演示，每个具有标题、封面、播放控件和必要说明 |
| 页脚 | 项目需要的引用信息、模板来源与许可署名 |

三个特点及其解析演示是首页的说明部分；20 个完整 demo 集中放在后面的结果展示区。尚未获得真实文案和素材时，应明确保留占位状态，避免将模板中的作者、论文和示例结果当成项目内容。

开始制作前，向项目负责人收齐：项目名、作者与单位、三个特点的文案、对应解析素材、20 个 demo 的视频与标题，以及需要显示的链接。

## 3. 获取代码与写权限

任何人都可以下载或 clone 本仓库。要直接推送分支，所有者需要在仓库 **Settings → Collaborators → Add people** 邀请开发者的 GitHub 账号，开发者接受邀请后使用自己的账号操作。

首次下载：

```bash
git clone https://github.com/lxycopper/Mallea.git
cd Mallea
```

如果推送时需要配置 GitHub 登录，可以使用 GitHub CLI：

```bash
gh auth login
gh auth setup-git
```

已配置 SSH 或 HTTPS 凭据的开发者可沿用现有方式。没有仓库写权限时，可以 fork 到自己的账号，在 fork 中开发，然后向本仓库提交 Pull Request。

## 4. 在本地预览

在仓库根目录打开终端：

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

Windows 可使用：

```powershell
py -m http.server 8000 --bind 127.0.0.1 --directory site
```

浏览器打开 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。修改文件并保存后刷新浏览器；结束时按 `Ctrl+C`。这个地址仅供运行服务器的电脑本地访问，无法直接发给远程合作者使用。

轮播所需的 jQuery 已保存在仓库中。外部字体不可达时会使用备用字体；模板中的 YouTube 示例依赖外网，可以换成本地 MP4。

## 5. 修改入口

| 路径 | 修改内容 |
| --- | --- |
| `site/index.html` | 首页结构、标题、文案、作者、章节、视频引用、链接及分享元信息 |
| `site/static/css/index.css` | 字体、颜色、宽度、间距、响应式布局 |
| `site/static/js/index.js` | 页面交互、轮播和视频播放逻辑 |
| `site/static/videos/` | 项目视频文件 |
| `site/static/images/` | 图片、视频封面、项目图标 |
| `site/static/pdfs/` | 可公开的论文、海报和补充材料 |
| `.github/workflows/pages.yml` | 网站部署流程；普通文案和样式修改无需调整 |

推荐先整理 `index.html` 中的章节，替换真实内容，再修改布局与交互。在 HTML 中搜索 `TODO` 可以找到模板预留的编辑位置。

除了页面正文，还要处理 `<head>` 中的标题、描述、Open Graph、Twitter、citation 和 JSON-LD。填入真实信息，或移除暂不适用的元信息；模板中虚构的作者、单位、年份和链接都需要清理。

新增章节使用唯一的 `id`，并相应更新导航锚点。每个视频也使用唯一的 `id`，方便后续编写独立控制逻辑。

## 6. 组织 3 个解析 demo 和 20 个完整 demo

可以采用以下命名约定；这些是建议新增的素材文件名，并非仓库中已经存在的文件：

```text
site/static/videos/
  feature-01.mp4
  feature-02.mp4
  feature-03.mp4
  demo-01.mp4
  ...
  demo-20.mp4

site/static/images/
  feature-01.jpg
  feature-02.jpg
  feature-03.jpg
  demo-01.jpg
  ...
  demo-20.jpg
```

为每个完整 demo 记录编号、标题、简短说明、视频路径、封面路径；需要分组时再增加特点标签。文件名尽量使用英文、数字和连字符，保持编号稳定。

20 个 demo 建议使用响应式网格，桌面端约 3 列，手机端 1 列。默认显示封面，用户点击后播放；控制初始视频加载量。解析 demo 可以配更详细的文字、局部标注或并排对比，帮助读者理解对应特点。

下面是一个可放入 `site/index.html` 的视频示例；使用前应先放入对应素材：

```html
<video controls playsinline preload="none"
       poster="static/images/demo-01.jpg">
  <source src="static/videos/demo-01.mp4" type="video/mp4">
  你的浏览器暂不支持此视频。
</video>
```

优先使用浏览器广泛支持的 MP4 编码组合，例如 H.264 视频和 AAC 音频。有声音的 demo 应让用户主动开启声音。上传前检查画质、音画同步和文件大小；GitHub 普通 Git 推送有单文件 100 MiB 的限制。

从首页引用资源时使用 `static/videos/demo-01.mp4` 这样的相对路径。以 `/static/` 开头的路径会从域名根目录寻找资源，与当前 `/Mallea/` 的部署位置不匹配。新增子目录页面时，也要按其相对位置调整路径。

## 7. 日常协作与上传

推荐在开发分支上修改，通过 Pull Request 合并到 `main` 后发布。

开始一个新修改任务时，确保当前工作区没有未提交的修改，再执行：

```bash
git switch main
git pull --ff-only
git switch -c website-update
```

`website-update` 是示例分支名；后续任务换用新的描述性名称。完成修改并本地预览后：

```bash
git add site
git commit -m "Update project content and demos"
git push -u origin website-update
```

如果还修改了工作流或说明文档，将对应文件另行加入提交。然后在 GitHub 提交一个以 `main` 为目标的 Pull Request，附上页面截图和修改说明。负责人审阅、合并后，网站自动部署。

有写权限、仓库分支规则允许且双方约定直接发布时，也可以在 `main` 上修改并 push。推送到 `main` 的网页修改会直接触发上线；如负责人设置了必须审阅的分支规则，则按规则通过 Pull Request 合并。

## 8. 更换模板

### 新模板仍是普通 HTML/CSS/JavaScript

在开发分支中，将新模板完整放入 `site/`，保证入口仍为 `site/index.html`。迁移现有文案和素材，检查图片、CSS、脚本及视频的引用路径。

保留 `.github/workflows/pages.yml`，并按新模板许可更新署名。先完成本地预览，再合并发布。可以继续使用同一个仓库和线上地址。

### 新模板使用 Astro、React、Vue 等构建工具

依照新模板说明安装 Node.js 和依赖，使用它提供的开发命令预览，并执行生产构建。不要直接套用原来的纯 HTML 上传流程。

需要同步调整发布工作流：

1. 配置 Node.js 并安装依赖。
2. 执行构建命令。
3. 将 `actions/upload-pages-artifact` 的 `path` 改成实际静态输出目录，例如 `dist/` 或 `out/`。
4. 配置项目的部署基础路径 `/Mallea/`，并检查资源路径和页面路由。
5. 更新工作流的 `push.paths`，让新的源码、依赖清单和构建配置修改都能触发部署。
6. 更新 README 和本指南中的预览、构建及目录说明。

GitHub Pages 需要静态构建产物。若新模板依赖服务端渲染、数据库或服务端 API，需要调整为静态导出，或为这些功能另选运行环境。具体配置应以选定模板的文档为准。

## 9. 上线前检查

- 三个特点的标题、文字与解析 demo 一一对应；完整 demo 数量为 20。
- 已替换模板中的示例作者、假链接、示例引用和与项目无关的展示内容。
- 电脑和手机宽度下没有横向溢出，文字可读，播放按钮可操作。
- 视频与封面能加载，声音符合预期，首次打开网页不会同时下载所有完整视频。
- 论文、相关链接、页面锚点和分享元信息指向正确地址。
- 网站资源都在正确位置；对需要保留的模板和第三方库署名完成检查。

合并后打开 [Actions](https://github.com/lxycopper/Mallea/actions)，确认 **Deploy GitHub Pages** 运行成功，再访问线上地址检查发布结果。工作流成功代表部署完成，仍需要检查线上显示和链接。

## 10. 常见问题与回退

| 现象 | 处理方法 |
| --- | --- |
| push 被拒绝 | 确认接受了协作者邀请、使用自己的正确账号；没有写权限时使用 fork + Pull Request |
| 网页没有更新 | 确认修改已进入 `main`、文件在工作流监控范围内，并查看 Actions；再尝试强制刷新 |
| 部署失败 | 打开失败步骤日志；检查 **Settings → Pages → Source** 是否为 **GitHub Actions** |
| 线上图片或视频 404 | 检查文件已提交、路径大小写一致，以及是否误用了 `/static/` 等域名根路径 |
| 视频无法播放 | 检查文件路径、编码及大小；确认上传的是实际媒体文件，而非 Git LFS 指针 |
| 更换框架后首页或资源 404 | 检查构建输出目录、`/Mallea/` 基础路径和路由配置 |
| 仅修改文档后没有部署记录 | 属于现有配置的正常行为；确需重发时可在 Actions 中手动运行工作流 |

已经发布的修改需要撤回时，可对对应 Pull Request 使用 GitHub 的 **Revert** 创建回退 PR，审阅合并后重新部署。直接提交的修改也可以通过 `git revert` 创建回退提交。优先保留共享历史；回退后仍需确认 Actions 成功和线上效果。

## 11. 可以直接转发给开发者的交接说明

> 请在 https://github.com/lxycopper/Mallea 基础上开发项目展示网页。线上地址为 https://lxycopper.github.io/Mallea/ ，网页文件位于 `site/`，推送或合并网页修改到 `main` 后会自动发布。首页需要展示 3 个特点，每个特点配说明文字与解析 demo，后面集中展示 20 个完整 demo。请先在开发分支修改并本地预览，通过 Pull Request 提交，并附上电脑和手机宽度下的截图。可以更换模板，但需要保留或同步调整部署流程，确保合并后线上仍可访问。完整开发流程见仓库的 `DEVELOPMENT.md`。
