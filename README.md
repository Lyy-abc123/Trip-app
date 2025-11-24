# 我们的旅行足迹 ✈️

一个清新卡通风格的旅行景点记录应用，用于记录和老婆一起去过的景点。

## 功能特点

- 🗺️ **城市管理**：支持多个城市，每个城市有默认的热门景点
- 🗺️ **地图可视化**：在地图上查看所有景点位置，支持列表和地图两种视图切换
- ✅ **景点标记**：可以标记景点为"已去过"或"未去过"
- 📸 **照片和视频**：为每个景点上传照片和视频，记录美好回忆
- 📝 **文字记录**：为每个景点添加文字记录
- 🔢 **访问次数**：记录每个景点去过几次
- 🎨 **清新卡通风格**：采用粉色、蓝色等柔和色彩，圆润的设计风格

## 技术栈

- React 18 + TypeScript
- Vite（构建工具）
- React Router（路由）
- Tailwind CSS（样式）
- Lucide React（图标）
- Leaflet + React-Leaflet（地图功能）
- LocalStorage（数据存储）

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开显示的地址（通常是 http://localhost:5173）

## 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist` 目录中。

## 使用说明

1. **查看城市列表**：首页显示所有城市，可以看到每个城市的进度
2. **添加城市**：点击"添加新城市"按钮，输入城市名称
3. **查看景点**：点击城市卡片进入城市详情页
4. **切换视图**：在城市详情页，可以在"列表视图"和"地图视图"之间切换
   - **列表视图**：以卡片形式展示所有景点
   - **地图视图**：在地图上显示景点位置，绿色标记表示已去过，灰色标记表示未去过
5. **标记景点**：在城市详情页，点击未去过的景点可以标记为已去过（地图上点击标记也可以）
6. **添加景点**：在城市详情页，点击"添加新景点"按钮
7. **查看详情**：点击已去过的景点可以进入详情页
8. **记录回忆**：在详情页可以：
   - 调整访问次数
   - 上传照片和视频
   - 添加文字记录

## 数据存储

所有数据存储在浏览器的 LocalStorage 中，数据会持久保存。默认包含以下城市和景点：

- **北京**：天安门、圆明园、故宫、长城、颐和园
- **上海**：外滩、迪士尼乐园、豫园
- **广州**：广州塔、越秀公园

## 注意事项

- 照片和视频以 base64 格式存储在 LocalStorage 中，如果上传大量媒体文件可能会占用较多存储空间
- 建议定期备份数据（可以通过浏览器开发者工具导出 LocalStorage 数据）

## 实时同步功能

应用支持实时同步功能，可以让您和伴侣实时共享旅行数据。

### 配置 Firebase（必需）

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Firestore Database（选择测试模式即可）
4. 在项目设置中获取 Web 应用配置
5. 在项目根目录创建 `.env` 文件，添加以下配置：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 使用实时同步

1. 点击主页的"实时同步"按钮
2. 创建新房间或加入已有房间
3. 将房间 ID 分享给您的伴侣
4. 双方连接后，数据会实时同步

### Firestore 安全规则

在 Firebase 控制台的 Firestore Database → Rules 中添加以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true; // 测试模式，生产环境应添加身份验证
    }
  }
}
```

## 开发计划

- [x] 添加地图视图
- [x] 支持数据导出/导入
- [x] 支持实时云同步
- [ ] 支持景点搜索
- [ ] 添加统计图表
- [ ] 支持手动设置景点坐标

## 部署和分享

应用可以通过多种方式部署和分享给伴侣：

### 快速部署（推荐）

1. **部署到 Vercel**（最简单）
   - 将代码推送到 GitHub
   - 访问 https://vercel.com/new
   - 导入仓库，一键部署
   - 分享链接给伴侣

2. **部署到 Netlify**
   - 访问 https://www.netlify.com/
   - 导入 Git 仓库
   - 配置构建命令：`npm run build`
   - 发布目录：`dist`

详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

### 本地运行

如果伴侣想在本地运行：

```bash
cd trip-app
npm install
npm run dev
```

然后访问 http://localhost:5173

## 许可证

MIT

