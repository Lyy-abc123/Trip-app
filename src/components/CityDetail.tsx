import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, CheckCircle, Circle, Map, List } from 'lucide-react';
import { useState } from 'react';
import { AppData } from '../types';
import { toggleAttractionVisited, addAttraction, loadData } from '../utils/storage';
import AttractionMap from './AttractionMap';

interface CityDetailProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function CityDetail({ data, setData }: CityDetailProps) {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const [showAddAttraction, setShowAddAttraction] = useState(false);
  const [newAttractionName, setNewAttractionName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map'); // 默认显示地图

  const city = data.cities.find(c => c.id === cityId);

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">城市不存在</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-400 text-white px-6 py-2 rounded-cute"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleToggleVisited = (attractionId: string) => {
    toggleAttractionVisited(cityId!, attractionId, data);
    setData(loadData());
  };

  const handleAddAttraction = () => {
    if (newAttractionName.trim()) {
      addAttraction(cityId!, newAttractionName.trim(), data);
      setData(loadData());
      setNewAttractionName('');
      setShowAddAttraction(false);
    }
  };

  // 判断是否真正去过：visited 为 true 且 visitCount > 0
  const visitedAttractions = city.attractions.filter(a => a.visited && a.visitCount > 0);
  const unvisitedAttractions = city.attractions.filter(a => !(a.visited && a.visitCount > 0));

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{city.name}</h1>
              <p className="text-gray-600">
                {visitedAttractions.length} / {city.attractions.length} 个景点已去过
              </p>
            </div>
          </div>
        </div>

        {/* 视图切换和添加景点 */}
        <div className="mb-6 space-y-4">
          {/* 视图切换按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 rounded-cute transition-all flex items-center justify-center gap-2 font-semibold ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-cute'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <List className="w-5 h-5" />
              列表视图
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 rounded-cute transition-all flex items-center justify-center gap-2 font-semibold ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-cute'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Map className="w-5 h-5" />
              地图视图
            </button>
          </div>

          {/* 添加景点按钮 */}
          {!showAddAttraction ? (
            <button
              onClick={() => setShowAddAttraction(true)}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-cute shadow-cute hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              添加新景点
            </button>
          ) : (
            <div className="bg-white rounded-cute p-4 shadow-cute border-2 border-purple-200">
              <input
                type="text"
                value={newAttractionName}
                onChange={(e) => setNewAttractionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAttraction()}
                placeholder="输入景点名称..."
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddAttraction}
                  className="flex-1 bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowAddAttraction(false);
                    setNewAttractionName('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 地图视图 */}
        {viewMode === 'map' && (
          <div className="mb-6">
            <AttractionMap
              attractions={city.attractions}
              cityId={cityId}
              onMarkerClick={(attraction) => {
                // 所有景点都可以点击进入详情页
                navigate(`/city/${cityId}/attraction/${attraction.id}`);
              }}
            />
          </div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <>
            {/* 已去过的景点 */}
            {visitedAttractions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              已去过 ({visitedAttractions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visitedAttractions.map((attraction) => (
                <div
                  key={attraction.id}
                  onClick={() => navigate(`/city/${cityId}/attraction/${attraction.id}`)}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-cute p-4 shadow-cute border-2 border-green-300 hover:border-green-400 cursor-pointer transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{attraction.name}</h3>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  {attraction.visitCount > 0 && (
                    <p className="text-sm text-gray-600">去过 {attraction.visitCount} 次</p>
                  )}
                  {attraction.photos.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      📷 {attraction.photos.length} 张照片
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 未去过的景点 */}
        {unvisitedAttractions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Circle className="w-6 h-6 text-gray-400" />
              未去过 ({unvisitedAttractions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unvisitedAttractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="bg-gray-50 rounded-cute p-4 shadow-cute border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-105"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => navigate(`/city/${cityId}/attraction/${attraction.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-600">{attraction.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">点击查看详情或编辑坐标</p>
                    </div>
                    <Circle className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisited(attraction.id);
                      }}
                      className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
                    >
                      标记为已去过
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {city.attractions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">还没有添加任何景点</p>
                <p className="text-sm mt-2">点击上方按钮添加第一个景点吧！</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

