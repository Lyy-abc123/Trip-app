import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Video, Plus, X, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { AppData, Coordinates, Attraction } from '../types';
import { updateAttraction, deleteAttraction, fileToBase64, loadData, saveData } from '../utils/storage';
import CoordinateEditor from './CoordinateEditor';

interface AttractionDetailProps {
  data: AppData;
  setData: (data: AppData) => void;
}

export default function AttractionDetail({ data, setData }: AttractionDetailProps) {
  const { cityId, attractionId } = useParams<{ cityId: string; attractionId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showCoordinateEditor, setShowCoordinateEditor] = useState(false);

  const city = data.cities.find(c => c.id === cityId);
  const attraction = city?.attractions.find(a => a.id === attractionId);

  if (!city || !attraction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">景点不存在</h2>
          <button
            onClick={() => navigate(`/city/${cityId}`)}
            className="bg-pink-400 text-white px-6 py-2 rounded-cute"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const handleVisitCountChange = (delta: number) => {
    const newCount = Math.max(0, attraction.visitCount + delta);
    // 如果访问次数大于0，自动设置为已访问；如果为0，设置为未访问
    const updates: Partial<Attraction> = {
      visitCount: newCount,
      visited: newCount > 0
    };
    updateAttraction(cityId!, attractionId!, updates, data);
    // 直接使用更新后的 data，确保状态同步
    setData({ ...data });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        const newPhotos = [...attraction.photos, base64];
        updateAttraction(cityId!, attractionId!, { photos: newPhotos }, data);
        setData(loadData());
      } catch (error) {
        console.error('上传照片失败:', error);
        alert('上传照片失败，请重试');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      try {
        const base64 = await fileToBase64(file);
        const newVideos = [...attraction.videos, base64];
        updateAttraction(cityId!, attractionId!, { videos: newVideos }, data);
        setData(loadData());
      } catch (error) {
        console.error('上传视频失败:', error);
        alert('上传视频失败，请重试');
      }
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = attraction.photos.filter((_, i) => i !== index);
    updateAttraction(cityId!, attractionId!, { photos: newPhotos }, data);
    setData(loadData());
  };

  const handleDeleteVideo = (index: number) => {
    const newVideos = attraction.videos.filter((_, i) => i !== index);
    updateAttraction(cityId!, attractionId!, { videos: newVideos }, data);
    setData(loadData());
  };

  const handleNotesChange = (notes: string) => {
    updateAttraction(cityId!, attractionId!, { notes }, data);
    setData(loadData());
  };

  const handleSaveCoordinates = (coordinates: Coordinates) => {
    updateAttraction(cityId!, attractionId!, { coordinates }, data);
    setData(loadData());
    setShowCoordinateEditor(false);
  };

  const handleDeleteCoordinates = () => {
    if (confirm('确定要删除该景点的坐标吗？删除后景点将不会在地图上显示。')) {
      const city = data.cities.find(c => c.id === cityId);
      const attraction = city?.attractions.find(a => a.id === attractionId);
      if (attraction) {
        delete attraction.coordinates;
        attraction.updatedAt = new Date().toISOString();
        saveData(data);
        setData(loadData());
      }
    }
  };

  const handleDeleteAttraction = () => {
    if (confirm(`确定要删除景点"${attraction.name}"吗？这将删除该景点的所有数据（包括照片、视频和笔记）。`)) {
      deleteAttraction(cityId!, attractionId!, data);
      setData(loadData());
      navigate(`/city/${cityId}`);
    }
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/city/${cityId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <button
              onClick={handleDeleteAttraction}
              className="flex items-center gap-2 text-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>删除景点</span>
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{attraction.name}</h1>
          <p className="text-gray-600">{city.name}</p>
        </div>

        {/* 坐标位置 */}
        <div className="bg-white rounded-cute p-6 shadow-cute border-2 border-green-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-500" />
              位置坐标
            </h2>
            {!showCoordinateEditor && (
              <div className="flex gap-2">
                {attraction.coordinates ? (
                  <>
                    <button
                      onClick={() => setShowCoordinateEditor(true)}
                      className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑坐标
                    </button>
                    <button
                      onClick={handleDeleteCoordinates}
                      className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      删除坐标
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowCoordinateEditor(true)}
                    className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加坐标
                  </button>
                )}
              </div>
            )}
          </div>

          {showCoordinateEditor ? (
            <CoordinateEditor
              cityId={cityId}
              currentCoordinates={attraction.coordinates}
              onSave={handleSaveCoordinates}
              onCancel={() => setShowCoordinateEditor(false)}
            />
          ) : attraction.coordinates ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>纬度 (Latitude):</strong> {attraction.coordinates.lat}
              </p>
              <p className="text-sm text-gray-600">
                <strong>经度 (Longitude):</strong> {attraction.coordinates.lng}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                💡 坐标已设置，景点会在地图上显示
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                ⚠️ 该景点还没有设置坐标
              </p>
              <p className="text-xs text-gray-500">
                添加坐标后，景点会在地图上显示位置
              </p>
            </div>
          )}
        </div>

        {/* 访问次数 */}
        <div className="bg-white rounded-cute p-6 shadow-cute border-2 border-pink-200 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">访问次数</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVisitCountChange(-1)}
              disabled={attraction.visitCount === 0}
              className="w-12 h-12 bg-pink-200 text-pink-700 rounded-full hover:bg-pink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-bold text-xl"
            >
              -
            </button>
            <div className="text-4xl font-bold text-pink-500 min-w-[80px] text-center">
              {attraction.visitCount}
            </div>
            <button
              onClick={() => handleVisitCountChange(1)}
              className="w-12 h-12 bg-pink-200 text-pink-700 rounded-full hover:bg-pink-300 transition-colors flex items-center justify-center font-bold text-xl"
            >
              +
            </button>
            <span className="text-gray-600 ml-4">次</span>
          </div>
        </div>

        {/* 照片 */}
        <div className="bg-white rounded-cute p-6 shadow-cute border-2 border-blue-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-500" />
              照片 ({attraction.photos.length})
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加照片
            </button>
          </div>
          {attraction.photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {attraction.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`照片 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => handleDeletePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Camera className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p>还没有照片，点击上方按钮添加吧！</p>
            </div>
          )}
        </div>

        {/* 视频 */}
        <div className="bg-white rounded-cute p-6 shadow-cute border-2 border-purple-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Video className="w-6 h-6 text-purple-500" />
              视频 ({attraction.videos.length})
            </h2>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              className="bg-purple-400 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加视频
            </button>
          </div>
          {attraction.videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attraction.videos.map((video, index) => (
                <div key={index} className="relative group">
                  <video
                    src={video}
                    controls
                    className="w-full rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => handleDeleteVideo(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Video className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p>还没有视频，点击上方按钮添加吧！</p>
            </div>
          )}
        </div>

        {/* 文字记录 */}
        <div className="bg-white rounded-cute p-6 shadow-cute border-2 border-yellow-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📝 文字记录</h2>
          <textarea
            value={attraction.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="记录下这次旅行的美好回忆吧..."
            className="w-full h-48 px-4 py-3 border-2 border-yellow-200 rounded-lg focus:outline-none focus:border-yellow-400 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

