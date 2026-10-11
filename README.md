# 项目网页：编辑与发布交接

这是一个基于 [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template) 的静态网页仓库。

- 仓库：https://github.com/lxycopper/project-page
- 网站目标地址：https://lxycopper.github.io/project-page/
- 网页文件：`site/`
- 发布方式：GitHub Actions；推送 `main` 上的网页修改后自动更新 GitHub Pages。
- 当前内容：原模板示例、占位作者和占位论文链接，供接手人替换。它们不代表本项目的真实成果。
- 发布状态（2026-10-11）：仓库已创建为私有，网页与发布配置已上传。GitHub 返回“Your current plan does not support GitHub Pages for this repository.”，当前网站尚未上线。需要所有者升级支持私有仓库 Pages 的套餐，或同意公开这个网页仓库后启用 Pages。

## 1. 获得编辑权限

仓库所有者在 **Settings → Collaborators → Add people** 中邀请编辑者的 GitHub 账号，编辑者接受邀请后再操作。

- 私有仓库：需要授权才能 clone 和 push。
- 公开仓库：任何人都能 clone；只有有写权限的人能 push。没有写权限的人可以通过 fork 和 Pull Request 提交修改。
- 不需要、也不应共享所有者的 GitHub 密码或令牌；编辑者使用自己的 GitHub 登录。

## 2. Clone

使用 GitHub CLI（适合私有仓库）：

```bash
gh auth login
gh repo clone lxycopper/project-page
cd project-page
```

或使用已经配置好认证的 Git：

```bash
git clone https://github.com/lxycopper/project-page.git
cd project-page
```

## 3. 本地预览

在仓库根目录运行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

浏览器打开 http://127.0.0.1:8000/ 。保存修改后刷新即可；按 `Ctrl+C` 停止服务器。本地预览不需要上传或发布。

轮播所需的 jQuery 已放在仓库中，不依赖 Google CDN。外部字体采用非阻塞加载；Google 字体或外部图标不可达时仍可使用系统字体预览。模板中的 YouTube 示例仍需访问 YouTube，可替换成本地 MP4。

Windows 也可以使用 `py -m http.server 8000 --bind 127.0.0.1 --directory site`。

## 4. 修改哪些文件

| 文件或目录 | 用途 |
| --- | --- |
| `site/index.html` | 标题、作者、摘要、章节、视频路径、论文链接、引用与元信息 |
| `site/static/css/index.css` | 字体、颜色、间距和主要布局 |
| `site/static/js/index.js` | 轮播、视频播放、复制引用等交互 |
| `site/static/videos/` | MP4 视频 |
| `site/static/images/` | 图片、视频封面和自己的 favicon |
| `site/static/pdfs/` | 海报、论文或补充材料 |

在 `index.html` 中搜索 `TODO`，按注释替换模板内容。发布真实项目内容时，同步更新页面顶部的 SEO / Open Graph / citation 元信息，移除尚未提供的论文、作者、补充材料和相关工作链接。

计划中的内容结构：项目标题与总览 → 特点 1 + 解析 demo → 特点 2 + 解析 demo → 特点 3 + 解析 demo → 20 个完整 demo。这些项目内容尚未填写；可按需求复用模板现有的视频与章节结构。

资源使用相对路径，例如 `static/videos/demo-01.mp4`，不要写成 `/static/videos/demo-01.mp4`，否则部署到 `/project-page/` 后会访问错误位置。

只有 `site/` 会发布成网站。新增页面和公开素材也放到 `site/`；研究代码可以保存在其他私有仓库。浏览器能访问的网页文件和素材会公开。

较大的视频先压缩；GitHub 单文件上限为 100 MiB。不要将 Git LFS 指针当成可直接播放的视频发布。

## 5. 上传并自动发布

开始编辑前，先同步其他人的修改：

```bash
git switch main
git pull --ff-only
```

修改、预览后提交：

```bash
git add site
git commit -m "Update project page"
git push origin main
```

随后查看仓库 **Actions → Deploy GitHub Pages**。部署变绿后刷新网站，必要时使用浏览器强制刷新。网页更改不会在本地保存时自动上传，只有 push 才触发发布。

也可创建分支、提交 Pull Request；合并到 `main` 后自动发布。不要用强制推送覆盖其他人的修改。

## 6. 发布设置与故障排查

仓库 **Settings → Pages → Build and deployment → Source** 应选择 **GitHub Actions**。

- 首次启用 Pages 后，可在 **Actions → Deploy GitHub Pages → Run workflow** 手动触发。
- 部署失败：打开对应运行日志，先确认 Pages 已开启、仓库套餐支持所选可见性。
- 私有仓库发布 Pages 通常需要个人 GitHub Pro；如果账号不支持，可升级套餐，或经仓库所有者同意后将仅含网页的仓库公开。
- 仓库私有不等于网站私有。默认发布的 Pages 是公开网站。
- 只有 README 修改时不会触发部署；如需重新发布，可手动运行工作流。

## 模板来源与许可

来源：[eliahuhorwitz/Academic-project-page-template](https://github.com/eliahuhorwitz/Academic-project-page-template)，基于提交 `d38af1ccae1ce82c3404d2820c4c646afd409f81`。

上游说明保存在 `TEMPLATE.md`。保留网页页脚中的模板与 Nerfies 署名，并遵循上游的 CC BY-SA 4.0 许可；各第三方库保留其自身许可。详见 `LICENSE.md`。
