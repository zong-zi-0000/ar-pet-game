# AR Pet Backend - 部署配置

## 环境变量

在 Railway 或 Render 平台设置以下环境变量：

### Railway
```bash
NODE_ENV=production
PORT=8080
DB_PATH=./data/pet.db
```

### Render
```bash
NODE_ENV=production
PORT=10000
DB_PATH=./data/pet.db
```

## SQLite 数据持久化

Railway 提供持久化存储，SQLite 文件会保存在 `/data` 目录。

Render 需要配置持久化磁盘或使用 PostgreSQL。

## 部署到 Railway

1. Fork 此仓库到 GitHub
2. 在 Railway 中连接 GitHub 仓库
3. Railway 会自动检测 Node.js 项目
4. 添加环境变量
5. 部署

## 部署到 Render

1. Fork 此仓库到 GitHub
2. 在 Render 中创建 Web Service
3. 连接 GitHub 仓库
4. 设置：
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 添加环境变量
6. 部署

## 使用 PostgreSQL（可选）

如需使用 PostgreSQL 替代 SQLite：

```bash
# 安装 pg
npm install pg

# 环境变量
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

修改 `database.js` 中的数据库连接逻辑即可。
