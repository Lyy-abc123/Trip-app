import { useState, useEffect } from 'react';
import { X, Cloud, CloudOff, Users, Copy, Check, RefreshCw } from 'lucide-react';
import { AppData } from '../types';
import { 
  saveToCloud, 
  loadFromCloud, 
  subscribeToCloud, 
  generateUserId, 
  generateRoomId 
} from '../utils/firebase';
import { saveData } from '../utils/storage';

interface SyncModalProps {
  data: AppData;
  onDataUpdate: (data: AppData) => void;
  onClose: () => void;
}

export default function SyncModal({ data, onDataUpdate, onClose }: SyncModalProps) {
  const [roomId, setRoomId] = useState('');
  const [userId] = useState(() => generateUserId());
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // 从 localStorage 读取房间 ID
  useEffect(() => {
    const savedRoomId = localStorage.getItem('trip-app-room-id');
    if (savedRoomId) {
      setRoomId(savedRoomId);
      connectToRoom(savedRoomId);
    }
  }, []);

  // 连接房间并开始实时同步
  const connectToRoom = async (targetRoomId: string) => {
    if (!targetRoomId.trim()) {
      setError('请输入房间 ID');
      return;
    }

    setIsSyncing(true);
    setError('');

    try {
      // 先尝试加载云端数据
      const cloudData = await loadFromCloud(targetRoomId);
      
      if (cloudData) {
        // 如果云端有数据，询问是否要同步
        if (confirm('检测到云端数据，是否要同步到本地？这将覆盖当前数据。')) {
          saveData(cloudData);
          onDataUpdate(cloudData);
        }
      }

      // 保存当前数据到云端
      await saveToCloud(targetRoomId, data, userId);

      // 开始监听实时变化
      const unsubscribe = subscribeToCloud(
        targetRoomId,
        (updatedData) => {
          // 避免自己触发的变化
          saveData(updatedData);
          onDataUpdate(updatedData);
          setLastSyncTime(new Date());
          setIsConnected(true);
        },
        (err) => {
          setError(`同步错误: ${err.message}`);
          setIsConnected(false);
        }
      );

      // 保存房间 ID
      localStorage.setItem('trip-app-room-id', targetRoomId);
      setRoomId(targetRoomId);
      setIsConnected(true);
      setIsSyncing(false);

      // 组件卸载时取消订阅
      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
      setIsConnected(false);
      setIsSyncing(false);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    connectToRoom(newRoomId);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      connectToRoom(roomId.trim());
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('trip-app-room-id');
    setRoomId('');
    setIsConnected(false);
    setError('');
  };

  const handleCopyRoomId = async () => {
    if (roomId) {
      try {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const handleManualSync = async () => {
    if (!roomId) return;
    
    setIsSyncing(true);
    setError('');
    
    try {
      await saveToCloud(roomId, data, userId);
      setLastSyncTime(new Date());
      setIsSyncing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '同步失败');
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-cute shadow-xl border-2 border-pink-200 max-w-2xl w-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-pink-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {isConnected ? (
              <Cloud className="w-6 h-6 text-green-500" />
            ) : (
              <CloudOff className="w-6 h-6 text-gray-400" />
            )}
            实时同步
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 连接状态 */}
          <div className={`p-4 rounded-lg border-2 ${
            isConnected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold ${
                  isConnected ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {isConnected ? '✓ 已连接' : '未连接'}
                </p>
                {lastSyncTime && (
                  <p className="text-sm text-gray-500 mt-1">
                    最后同步: {lastSyncTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
              {isConnected && (
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors text-sm"
                >
                  断开连接
                </button>
              )}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 房间 ID */}
          {isConnected ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  房间 ID（分享给您的伴侣）：
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomId}
                    readOnly
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 font-mono"
                  />
                  <button
                    onClick={handleCopyRoomId}
                    className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 使用方法：</strong>
                  <br />
                  1. 复制上面的房间 ID
                  <br />
                  2. 发送给您的伴侣
                  <br />
                  3. 伴侣在"实时同步"中输入相同的房间 ID 即可连接
                  <br />
                  4. 连接后，双方的数据会实时同步
                </p>
              </div>

              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? '同步中...' : '手动同步'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 创建新房间 */}
              <div>
                <button
                  onClick={handleCreateRoom}
                  disabled={isSyncing}
                  className="w-full bg-pink-400 text-white py-3 rounded-lg hover:bg-pink-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Users className="w-5 h-5" />
                  创建新房间
                </button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  创建房间后，将房间 ID 分享给您的伴侣
                </p>
              </div>

              {/* 加入房间 */}
              <div className="pt-4 border-t-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  加入已有房间：
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="输入房间 ID"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isSyncing || !roomId.trim()}
                    className="bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors font-semibold"
                  >
                    {isSyncing ? '连接中...' : '加入'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Firebase 配置提示 */}
          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 配置提示：</strong>
              <br />
              使用实时同步功能需要配置 Firebase。请在项目根目录创建 <code>.env</code> 文件并添加 Firebase 配置信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

