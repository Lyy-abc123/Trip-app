import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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

// 房间数据结构
interface RoomData {
  data: AppData;
  updatedAt: any;
  members: string[];
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
  onError?: (error: Error) => void
): () => void {
  const roomRef = getRoomRef(roomId);
  
  const unsubscribe = onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data() as RoomData;
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

