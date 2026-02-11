# 修桥过河 · Number Bridge Builder

## 启动
- 安装依赖：`npm install`
- 开发运行：`npm run dev`
- 构建预览：`npm run build`，然后 `npm run preview`

## 结构
- `src/logic/levelGenerator.ts` 关卡生成器，保证每个 gap 至少有一组解（K=2）
- `src/ui/Game.tsx` 游戏主界面与交互（Pointer Events 支持鼠标与触屏）
- `src/logic/audio.ts` 轻量音效（WebAudio）
- `src/logic/storage.ts` 进度存档（localStorage）
- `src/types.ts` 类型定义

## 关卡与难度
- 难度 A：T 5~10，桥板 0~10
- 难度 B：T 10~20，桥板 0~20
- 难度 C：T 20~100，桥板 0~50（可扩展）
- MVP 每关 3 个 gap，K=2

## 自测
- 运行：`npm run selftest`
- 内容：生成 1000 个 gap，验证至少存在一组解（见 `scripts/selftest.ts`）

## 扩展点
- 切换到共享桥板池（策略模式）
- 更多提示策略：凑十、+10/-10 提示
- HUD：星级、计时开关、暂停/重来按钮完善

## 发布与部署

### 1. 推送到 GitHub
由于本地环境可能未配置 Git，你可以按照以下步骤手动推送：

1.  登录 [GitHub](https://github.com) 并点击右上角的 "+" -> "New repository"。
2.  输入仓库名称（例如 `number-bridge`），保持公开（Public），点击 "Create repository"。
3.  在你的电脑上打开终端（Terminal）并进入项目目录，运行以下命令：
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <你的仓库地址>
    git push -u origin main
    ```
    *注意：将 `<你的仓库地址>` 替换为 GitHub 页面上显示的 HTTPS 地址，例如 `https://github.com/username/number-bridge.git`*

### 2. 部署到 Vercel（推荐）
1.  注册并登录 [Vercel](https://vercel.com)。
2.  点击 "Add New..." -> "Project"。
3.  选择你的 GitHub 仓库并导入。
4.  点击 "Deploy"，等待约 1 分钟即可获得永久访问链接。
