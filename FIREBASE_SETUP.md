# Firebase 实时同步配置指南

## 步骤 1：创建 Firebase 项目

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击"添加项目"或"创建项目"
3. 输入项目名称（例如：trip-app）
4. 按照向导完成项目创建

## 步骤 2：启用 Firestore Database

1. 在 Firebase 控制台中，点击左侧菜单的"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（适合个人使用）
4. 选择数据库位置（建议选择离您最近的区域）

## 步骤 3：获取 Web 应用配置

1. 在 Firebase 控制台中，点击左侧菜单的"项目设置"（齿轮图标）
2. 滚动到"您的应用"部分
3. 点击"</>"（Web 应用）图标
4. 注册应用（可以随意命名）
5. 复制配置对象中的值

## 步骤 4：配置环境变量

在项目根目录创建 `.env` 文件（注意：不要提交到 Git），添加以下内容：

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

将 `your-xxx-here` 替换为步骤 3 中获取的实际值。

## 步骤 5：配置 Firestore 安全规则

1. 在 Firebase 控制台中，点击"Firestore Database"
2. 点击"规则"标签
3. 将以下规则粘贴进去：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      // 允许任何人读写（测试模式）
      // 生产环境建议添加身份验证
      allow read, write: if true;
    }
  }
}
```

4. 点击"发布"

## 步骤 6：安装依赖

```bash
npm install
```

## 步骤 7：重启开发服务器

```bash
npm run dev
```

## 使用实时同步

1. 打开应用，点击主页的"实时同步"按钮
2. 创建新房间或加入已有房间
3. 将房间 ID 分享给您的伴侣
4. 双方连接后，数据会实时同步

## 注意事项

- Firebase 免费额度通常足够个人使用
- 如果数据量很大，建议定期清理旧数据
- 生产环境建议添加身份验证以提高安全性

## 故障排除

### 连接失败
- 检查 `.env` 文件是否正确配置
- 确认 Firestore Database 已启用
- 检查浏览器控制台是否有错误信息

### 数据不同步
- 确认双方使用的是相同的房间 ID
- 检查网络连接
- 查看浏览器控制台的错误信息

