# AR Pet Backend API

AR 手势互动猫咪养成游戏后端 API

## 概述

这是一个基于 Node.js + Express + SQLite 的 RESTful API，用于支持 AR 猫咪养成游戏。

## 快速开始

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（热重载）
npm run dev
```

## API 端点

### 创建宠物
```http
POST /api/pet/create
Content-Type: application/json

{
  "name": "小猫咪"  // 可选，默认 "小猫咪"
}

Response:
{
  "success": true,
  "message": "Pet created successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "小猫咪",
    "hunger": 80,
    "happiness": 80,
    "intimacy": 50,
    "mood": "happy",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 获取宠物状态
```http
GET /api/pet/:userId

Response:
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "小猫咪",
    "hunger": 80,
    "happiness": 80,
    "intimacy": 50,
    "mood": "happy",
    "lastFed": "2024-01-01T00:00:00.000Z",
    "lastHappy": "2024-01-01T00:00:00.000Z",
    "lastIntimate": "2024-01-01T00:00:00.000Z",
    "lastPet": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 喂食
```http
POST /api/pet/:userId/feed
Content-Type: application/json

{
  "amount": 15  // 可选，默认 15
}

Response:
{
  "success": true,
  "message": "Fed the pet! Hunger increased by 15",
  "data": {
    "userId": "...",
    "hunger": 95,
    "happiness": 80,
    "intimacy": 50,
    "mood": "happy"
  }
}
```

### 比心（增加开心值）
```http
POST /api/pet/:userId/happy
Content-Type: application/json

{
  "amount": 10  // 可选，默认 10
}

Response:
{
  "success": true,
  "message": "Heart gesture sent! Happiness increased by 10",
  "data": {
    "userId": "...",
    "hunger": 80,
    "happiness": 90,
    "intimacy": 50,
    "mood": "happy"
  }
}
```

### 亲密互动
```http
POST /api/pet/:userId/intimate
Content-Type: application/json

{
  "amount": 10  // 可选，默认 10
}

Response:
{
  "success": true,
  "message": "Intimacy increased by 10!",
  "data": {
    "userId": "...",
    "hunger": 80,
    "happiness": 80,
    "intimacy": 60,
    "mood": "happy"
  }
}
```

### 抚摸
```http
POST /api/pet/:userId/pet
Content-Type: application/json

{
  "happinessBonus": 5,  // 可选，默认 5
  "intimacyBonus": 5    // 可选，默认 5
}

Response:
{
  "success": true,
  "message": "Pet! Happiness +5, Intimacy +5",
  "data": {
    "userId": "...",
    "hunger": 80,
    "happiness": 85,
    "intimacy": 55,
    "mood": "happy"
  }
}
```

### 删除宠物
```http
DELETE /api/pet/:userId

Response:
{
  "success": true,
  "message": "Pet deleted successfully"
}
```

## 属性说明

| 属性 | 初始值 | 最小值 | 最大值 | 说明 |
|------|--------|--------|--------|------|
| hunger | 80 | 0 | 100 | 饥饿度，为 0 时宠物会"不开心" |
| happiness | 80 | 0 | 100 | 开心值 |
| intimacy | 50 | 0 | 100 | 亲密度 |

## 心情系统

心情根据属性自动计算：

| 条件 | 心情 |
|------|------|
| hunger === 0 | sad (不开心) |
| happiness < 20 | sad (不开心) |
| happiness > 80 | happy (开心) |
| intimacy < 20 | angry (生气) |
| 其他情况 | happy (开心) |

## 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "hint": "提示信息"  // 仅在 404 时
}
```

## 部署

### Railway（推荐）
1. Fork 仓库到 GitHub
2. 在 Railway 连接 GitHub 仓库
3. 设置环境变量 `NODE_ENV=production`
4. 部署完成

### Render
1. Fork 仓库到 GitHub
2. 在 Render 创建 Web Service
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 部署完成

## 本地测试

```bash
# 启动服务
npm start

# 测试创建宠物
curl -X POST http://localhost:3000/api/pet/create \
  -H "Content-Type: application/json" \
  -d '{"name": "我的猫咪"}'

# 测试获取宠物
curl http://localhost:3000/api/pet/{userId}

# 测试喂食
curl -X POST http://localhost:3000/api/pet/{userId}/feed

# 测试比心
curl -X POST http://localhost:3000/api/pet/{userId}/happy

# 测试亲密互动
curl -X POST http://localhost:3000/api/pet/{userId}/intimate

# 测试抚摸
curl -X POST http://localhost:3000/api/pet/{userId}/pet
```

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express 4.x
- **数据库**: SQLite (better-sqlite3)
- **CORS**: cors
- **UUID**: uuid
- **环境变量**: dotenv
