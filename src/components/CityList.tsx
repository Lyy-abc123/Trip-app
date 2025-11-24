import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Heart, Share2, Cloud } from 'lucide-react';
import { AppData } from '../types';
import { addCity, loadData, saveData } from '../utils/storage';
import ShareModal from './ShareModal';
import SyncModal from './SyncModal';
import { subscribeToCloud, generateUserId } from '../utils/firebase';

interface CityListProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function CityList({ data, setData }: CityListProps) {
  const navigate = useNavigate();
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 检查是否有活动的房间连接
  useEffect(() => {
    const roomId = localStorage.getItem('trip-app-room-id');
    if (roomId) {
      setIsSyncing(true);
      
      // 监听实时变化
      const unsubscribe = subscribeToCloud(
        roomId,
        (updatedData) => {
          saveData(updatedData);
          setData(updatedData);
        },
        (error) => {
          console.error('实时同步错误:', error);
          setIsSyncing(false);
        }
      );

      return () => {
        unsubscribe();
        setIsSyncing(false);
      };
    }
  }, [setData]);

  const handleAddCity = () => {
    if (newCityName.trim()) {
      addCity(newCityName.trim(), data);
      setData(loadData());
      setNewCityName('');
      setShowAddCity(false);
    }
  };

  const handleImportData = (importedData: AppData) => {
    saveData(importedData);
    setData(loadData());
  };

  const totalVisited = data.cities.reduce((sum, city) => {
    // 判断是否真正去过：visited 为 true 且 visitCount > 0
    return sum + city.attractions.filter(a => a.visited && a.visitCount > 0).length;
  }, 0);

  const totalAttractions = data.cities.reduce((sum, city) => {
    return sum + city.attractions.length;
  }, 0);

  return (
    <div className="min-h-screen p-6 pb-20">
      {/* 头部 */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-pink-500 mb-2 flex items-center justify-center gap-3">
            <Heart className="w-10 h-10 fill-pink-500" />
            我们的旅行足迹
            <Heart className="w-10 h-10 fill-pink-500" />
          </h1>
          <p className="text-gray-600 text-lg">记录我们一起走过的美好时光 ✈️</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setShowSyncModal(true)}
              className={`px-6 py-2 rounded-cute shadow-cute hover:shadow-lg transition-all flex items-center gap-2 ${
                isSyncing
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                  : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
              }`}
            >
              <Cloud className={`w-5 h-5 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? '实时同步中' : '实时同步'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-cute shadow-cute hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              导出/导入
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-cute p-4 shadow-cute border-2 border-pink-200">
            <div className="text-3xl font-bold text-pink-500">{totalVisited}</div>
            <div className="text-gray-600 text-sm">已去过的景点</div>
          </div>
          <div className="bg-white rounded-cute p-4 shadow-cute border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-500">{totalAttractions}</div>
            <div className="text-gray-600 text-sm">总景点数</div>
          </div>
        </div>

        {/* 添加城市按钮 */}
        <div className="mb-4">
          {!showAddCity ? (
            <button
              onClick={() => setShowAddCity(true)}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-cute shadow-cute hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              添加新城市
            </button>
          ) : (
            <div className="bg-white rounded-cute p-4 shadow-cute border-2 border-purple-200">
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
                placeholder="输入城市名称..."
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCity}
                  className="flex-1 bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowAddCity(false);
                    setNewCityName('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 城市列表 */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.cities.map((city) => {
          // 判断是否真正去过：visited 为 true 且 visitCount > 0
          const visitedCount = city.attractions.filter(a => a.visited && a.visitCount > 0).length;
          const totalCount = city.attractions.length;
          const progress = totalCount > 0 ? (visitedCount / totalCount) * 100 : 0;

          return (
            <div
              key={city.id}
              onClick={() => navigate(`/city/${city.id}`)}
              className="bg-white rounded-cute p-6 shadow-cute border-2 border-pink-200 hover:border-pink-400 cursor-pointer transition-all hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{city.name}</h2>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>进度</span>
                  <span>{visitedCount} / {totalCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                {city.attractions.length} 个景点
              </div>
            </div>
          );
        })}
      </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <ShareModal
          data={data}
          onImport={handleImportData}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* 实时同步模态框 */}
      {showSyncModal && (
        <SyncModal
          data={data}
          onDataUpdate={setData}
          onClose={() => setShowSyncModal(false)}
        />
      )}
    </div>
  );
}

