import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Coordinates } from '../types';
import { MapPin, X } from 'lucide-react';
import { getCityBounds } from '../utils/cityBounds';

interface CoordinateEditorProps {
  cityId?: string;
  currentCoordinates?: Coordinates;
  onSave: (coordinates: Coordinates) => void;
  onCancel: () => void;
}

// 自定义选择位置的标记
const createSelectIcon = () => {
  return L.divIcon({
    className: 'select-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,105,180,0.3);
        animation: pulse 2s infinite;
      ">
        <span style="
          font-size: 20px;
          color: white;
          font-weight: bold;
        ">📍</span>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid white;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

// 地图点击事件处理
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function CoordinateEditor({ cityId, currentCoordinates, onSave, onCancel }: CoordinateEditorProps) {
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(currentCoordinates || null);
  const [latInput, setLatInput] = useState(currentCoordinates?.lat.toString() || '');
  const [lngInput, setLngInput] = useState(currentCoordinates?.lng.toString() || '');
  const [error, setError] = useState('');

  const cityBounds = cityId ? getCityBounds(cityId) : null;
  const center: [number, number] = cityBounds?.center || [35.0, 105.0];
  const zoom = cityBounds?.zoom || 11;

  useEffect(() => {
    if (selectedCoords) {
      setLatInput(selectedCoords.lat.toString());
      setLngInput(selectedCoords.lng.toString());
    }
  }, [selectedCoords]);

  const handleMapClick = (lat: number, lng: number) => {
    const newCoords = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
    setSelectedCoords(newCoords);
    setLatInput(newCoords.lat.toString());
    setLngInput(newCoords.lng.toString());
    setError('');
  };

  const handleManualInput = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || isNaN(lng)) {
      setError('请输入有效的数字');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('纬度必须在 -90 到 90 之间');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('经度必须在 -180 到 180 之间');
      return;
    }

    const newCoords = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
    setSelectedCoords(newCoords);
    setError('');
  };

  const handleSave = () => {
    if (!selectedCoords) {
      setError('请选择或输入坐标');
      return;
    }
    onSave(selectedCoords);
  };

  return (
    <div className="bg-white rounded-cute p-6 shadow-cute border-2 border-pink-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-pink-500" />
          编辑坐标位置
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        点击地图选择位置，或手动输入经纬度坐标
      </p>

      {/* 地图选择器 */}
      <div className="mb-4">
        <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-pink-200">
          <MapContainer
            center={selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {selectedCoords && (
              <Marker
                position={[selectedCoords.lat, selectedCoords.lng]}
                icon={createSelectIcon()}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* 手动输入 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            纬度 (Latitude)
          </label>
          <input
            type="number"
            step="any"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            onBlur={handleManualInput}
            placeholder="例如: 39.9042"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            经度 (Longitude)
          </label>
          <input
            type="number"
            step="any"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            onBlur={handleManualInput}
            placeholder="例如: 116.3974"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {selectedCoords && (
        <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>已选择位置：</strong>
            <br />
            纬度: {selectedCoords.lat}, 经度: {selectedCoords.lng}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!selectedCoords}
          className="flex-1 bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          保存坐标
        </button>
        <button
          onClick={() => {
            setSelectedCoords(null);
            setLatInput('');
            setLngInput('');
            setError('');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          清除
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}

