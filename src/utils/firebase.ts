import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp, deleteField } from 'firebase/firestore';
import { AppData } from '../types';

// Firebase 配置（需要用户自己配置）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 同步请求
interface SyncRequest {
  fromUserId: string;
  fromUserName?: string;
  timestamp: any;
  data: AppData;
}

// 房间数据结构
interface RoomData {
  data: AppData;
  updatedAt: any;
  members: string[];
  syncRequest?: SyncRequest; // 待处理的同步请求
}

// 获取或创建房间文档引用
function getRoomRef(roomId: string) {
  return doc(db, 'rooms', roomId);
}

// 保存数据到云端
export async function saveToCloud(roomId: string, data: AppData, userId: string): Promise<void> {
  try {
    const roomRef = getRoomRef(roomId);
    const roomDoc = await getDoc(roomRef);
    
    const roomData: RoomData = {
      data,
      updatedAt: serverTimestamp(),
      members: roomDoc.exists() ? roomDoc.data().members || [] : [userId]
    };

    // 如果用户不在成员列表中，添加进去
    if (!roomData.members.includes(userId)) {
      roomData.members.push(userId);
    }

    await setDoc(roomRef, roomData, { merge: true });
  } catch (error) {
    console.error('保存到云端失败:', error);
    throw error;
  }
}

// 从云端加载数据
export async function loadFromCloud(roomId: string): Promise<AppData | null> {
  try {
    const roomRef = getRoomRef(roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (roomDoc.exists()) {
      const roomData = roomDoc.data() as RoomData;
      return roomData.data;
    }
    return null;
  } catch (error) {
    console.error('从云端加载失败:', error);
    throw error;
  }
}

// 监听云端数据变化（实时同步）
export function subscribeToCloud(
  roomId: string,
  callback: (data: AppData) => void,
  onSyncRequest?: (request: SyncRequest) => void,
  onError?: (error: Error) => void
): () => void {
  const roomRef = getRoomRef(roomId);
  
  const unsubscribe = onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data() as RoomData;
        
        // 检查是否有同步请求（且不是自己发起的）
        if (roomData.syncRequest && onSyncRequest) {
          const currentUserId = generateUserId();
          if (roomData.syncRequest.fromUserId !== currentUserId) {
            onSyncRequest(roomData.syncRequest);
          }
        }
        
        callback(roomData.data);
      }
    },
    (error) => {
      console.error('监听数据变化失败:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  );

  return unsubscribe;
}

// 发起同步请求
export async function requestSync(roomId: string, data: AppData, userId: string): Promise<void> {
  try {
    const roomRef = getRoomRef(roomId);
    const syncRequest: SyncRequest = {
      fromUserId: userId,
      timestamp: serverTimestamp(),
      data
    };
    
    await setDoc(roomRef, { syncRequest }, { merge: true });
  } catch (error) {
    console.error('发起同步请求失败:', error);
    throw error;
  }
}

// 接受同步请求
export async function acceptSyncRequest(roomId: string, data: AppData, userId: string): Promise<void> {
  try {
    const roomRef = getRoomRef(roomId);
    const roomDoc = await getDoc(roomRef);
    
    const roomData: any = {
      data,
      updatedAt: serverTimestamp(),
      members: roomDoc.exists() ? roomDoc.data().members || [] : [userId],
      syncRequest: deleteField() // 清除同步请求
    };

    if (!roomData.members.includes(userId)) {
      roomData.members.push(userId);
    }

    await setDoc(roomRef, roomData, { merge: true });
  } catch (error) {
    console.error('接受同步请求失败:', error);
    throw error;
  }
}

// 拒绝同步请求
export async function rejectSyncRequest(roomId: string): Promise<void> {
  try {
    const roomRef = getRoomRef(roomId);
    await setDoc(roomRef, { syncRequest: deleteField() }, { merge: true });
  } catch (error) {
    console.error('拒绝同步请求失败:', error);
    throw error;
  }
}

// 生成用户 ID（简单实现，实际应该使用 Firebase Auth）
export function generateUserId(): string {
  let userId = localStorage.getItem('trip-app-user-id');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('trip-app-user-id', userId);
  }
  return userId;
}

// 生成房间 ID
export function generateRoomId(): string {
  return Math.random().toString(36).substr(2, 9);
}

