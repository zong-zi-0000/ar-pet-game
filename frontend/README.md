# AR手势互动猫咪养成游戏前端

一个使用 Web 技术实现的 AR 手势互动猫咪养成游戏，玩家可以通过手势与可爱的 3D 猫咪互动。

![Demo Preview](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-brightgreen)
![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=flat-square&logo=three.js)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-4285F4?style=flat-square)

## 功能特性

### 🐱 3D宠物
- 使用 Three.js 渲染可爱的毛茸茸风格猫咪
- 实时待机动画（呼吸、尾巴摇摆）
- 响应不同手势的交互动画（开心、吃东西、蹭蹭、享受抚摸）

### ✋ 手势识别
- 使用 MediaPipe Hands 进行实时手势检测
- 支持 4 种手势：
  - **比心** 🤟 → 开心值 +10，播放爱心特效
  - **挥手** ✋ → 亲密度 +10，播放星星特效
  - **OK手势** 👌 → 饥饿度 +15，播放小鱼干特效
  - **握拳** ✊ → 播放抚摸特效

### 📊 养成系统
- 三个属性维度：饥饿度、开心值、亲密度
- 属性随时间自动衰减
- 数据本地持久化（支持后续对接后端 API）

### 🎨 UI设计
- 清新可爱的视觉风格
- 半透明毛玻璃效果
- 流畅的 CSS 动画
- 响应式设计，支持移动端横竖屏

## 技术栈

- **3D渲染**: Three.js
- **手势识别**: MediaPipe Hands
- **样式**: CSS3 (动画、变量、Flexbox)
- **架构**: 模块化 ES6 JavaScript

## 项目结构

```
ar-pet-frontend/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式表
├── js/
│   ├── main.js         # 游戏主入口
│   ├── pet.js          # 3D宠物渲染模块
│   ├── handtracking.js # 手势识别模块
│   └── api.js          # 后端通信模块
├── assets/
│   └── textures/       # 贴图资源目录
├── vercel.json         # Vercel部署配置
└── README.md           # 项目文档
```

## 本地运行

### 方法一：直接打开
直接用浏览器打开 `index.html` 文件（需要通过 HTTP 服务访问以支持某些浏览器特性）。

### 方法二：使用 Python 简单服务器
```bash
# 进入项目目录
cd ar-pet-frontend

# Python 3
python -m http.server 8080

# 访问 http://localhost:8080
```

### 方法三：使用 Node.js
```bash
# 全局安装 http-server
npm install -g http-server

# 启动服务
cd ar-pet-frontend
http-server -p 8080

# 访问 http://localhost:8080
```

### 方法四：使用 VS Code Live Server
安装 VS Code 插件 "Live Server"，右键点击 `index.html` 选择 "Open with Live Server"。

## 部署到 Vercel

### 方式一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd ar-pet-frontend
vercel

# 按提示完成部署
```

### 方式二：通过 GitHub
1. 将项目推送到 GitHub 仓库
2. 在 Vercel 官网导入仓库
3. 配置项目（自动检测设置，无需修改）
4. 点击 Deploy

## 桌面端测试

如果没有摄像头，可以使用键盘快捷键模拟手势：

| 按键 | 手势 | 效果 |
|------|------|------|
| `1` | 比心 | 开心值 +10 |
| `2` | 挥手 | 亲密度 +10 |
| `3` | OK | 饥饿度 +15 |
| `4` | 握拳 | 抚摸特效 |

## 后端 API 对接

当前版本使用本地存储保存数据。如需对接后端，修改 `js/api.js` 中的 `baseURL`：

```javascript
const API = {
    baseURL: 'https://your-api-domain.com',
    // ...
}
```

### API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/pet/:userId` | 获取宠物属性 |
| POST | `/pet/:userId` | 保存宠物属性 |

### 请求格式
```json
{
    "userId": "user_xxx",
    "hunger": 80,
    "happiness": 80,
    "love": 80,
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 浏览器兼容性

| 浏览器 | 支持情况 |
|--------|----------|
| Chrome 80+ | ✅ 完全支持 |
| Safari 14+ | ✅ 支持（iOS 14+） |
| Firefox 75+ | ✅ 支持 |
| Edge 80+ | ✅ 支持 |

**注意**: 需要摄像头权限，建议使用 HTTPS 访问以获得最佳体验。

## 移动端适配

- 支持 iOS Safari 和 Android Chrome
- 支持横竖屏切换
- 自动适配安全区域（刘海屏等）

## 性能优化

- Three.js 渲染器像素比限制为 2
- 粒子系统使用 BufferGeometry
- 手势识别使用 Lite 模型
- 冷却机制防止误触

## 许可证

MIT License

## 致谢

- [Three.js](https://threejs.org/) - 3D 渲染库
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) - 手势识别解决方案
