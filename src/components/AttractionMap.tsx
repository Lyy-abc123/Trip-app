import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Attraction } from '../types';
import { CheckCircle, Circle } from 'lucide-react';
import { getCityBounds } from '../utils/cityBounds';

// 修复 Leaflet 默认图标问题（在 Vite 中需要特殊处理）
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// 自定义已去过和未去过的图标（卡通风格）
const createCustomIcon = (visited: boolean, visitCount: number) => {
  // 如果 visited 为 false 或 visitCount 为 0，都视为未去过
  const isVisited = visited && visitCount > 0;
  const color = isVisited ? '#10b981' : '#9ca3af';
  const emoji = isVisited ? '✓' : '?'; // 未去过显示问号
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        background: ${isVisited ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'};
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 2px ${color}40;
        font-size: 20px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        animation: bounce 0.5s ease;
      ">
        <span style="
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">${emoji}</span>
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }
        .custom-marker:hover > div {
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(0,0,0,0.35), 0 0 0 3px ${color}60;
        }
      </style>
    `,
    iconSize: [40, 48] as [number, number],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

interface MapBoundsUpdaterProps {
  attractions: Attraction[];
}

function MapBoundsUpdater({ attractions }: MapBoundsUpdaterProps) {
  const map = useMap();
  
  useEffect(() => {
    const attractionsWithCoords = attractions.filter(a => a.coordinates);
    if (attractionsWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        attractionsWithCoords.map(a => [a.coordinates!.lat, a.coordinates!.lng])
      );
      // 如果只有一个或两个景点，使用更大的 padding
      const padding = attractionsWithCoords.length <= 2 ? [100, 100] : [50, 50];
      map.fitBounds(bounds, { padding });
    }
  }, [attractions, map]);

  return null;
}

interface AttractionMapProps {
  attractions: Attraction[];
  cityId?: string;
  onMarkerClick?: (attraction: Attraction) => void;
}

export default function AttractionMap({ attractions, cityId, onMarkerClick }: AttractionMapProps) {
  const attractionsWithCoords = attractions.filter(a => a.coordinates);
  const cityBounds = cityId ? getCityBounds(cityId) : null;
  
  // 确定地图中心点和缩放级别
  let center: [number, number];
  let zoom: number;
  
  if (cityBounds) {
    center = cityBounds.center;
    zoom = cityBounds.zoom;
  } else if (attractionsWithCoords.length > 0) {
    // 如果没有城市边界数据，使用景点平均位置
    const centerLat = attractionsWithCoords.reduce((sum, a) => sum + a.coordinates!.lat, 0) / attractionsWithCoords.length;
    const centerLng = attractionsWithCoords.reduce((sum, a) => sum + a.coordinates!.lng, 0) / attractionsWithCoords.length;
    center = [centerLat, centerLng];
    zoom = 12;
  } else {
    // 默认位置（中国中心）
    center = [35.0, 105.0];
    zoom = 5;
  }

  return (
    <div className="w-full h-[600px] rounded-cute overflow-hidden border-2 border-pink-200 shadow-cute relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* 卡通风格的地图瓦片 - 使用 CartoDB Positron（浅色、卡通风格） */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        
        {/* 城市轮廓 */}
        {cityBounds && (
          <Polygon
            positions={cityBounds.bounds}
            pathOptions={{
              fillColor: '#FFB6C1',
              fillOpacity: 0.2,
              color: '#FF69B4',
              weight: 3,
              opacity: 0.6,
            }}
          />
        )}
        
        {/* 自动调整地图范围 */}
        {attractionsWithCoords.length > 0 && (
          <MapBoundsUpdater attractions={attractionsWithCoords} />
        )}
        
        {/* 景点标记 - 显示所有景点（包括没有坐标的） */}
        {attractionsWithCoords.map((attraction) => {
          // 判断是否真正去过：visited 为 true 且 visitCount > 0
          const isVisited = attraction.visited && attraction.visitCount > 0;
          
          return (
            <Marker
              key={attraction.id}
              position={[attraction.coordinates!.lat, attraction.coordinates!.lng]}
              icon={createCustomIcon(attraction.visited, attraction.visitCount)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(attraction);
                  }
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="text-center p-2">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{attraction.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm mb-2">
                    {isVisited ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-semibold">已去过</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500 font-semibold">未去过</span>
                      </>
                    )}
                  </div>
                  {attraction.visitCount > 0 && (
                    <p className="text-xs text-gray-600 mt-1 bg-green-50 px-2 py-1 rounded">
                      ✨ 去过 {attraction.visitCount} 次
                    </p>
                  )}
                  {attraction.photos.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1 bg-blue-50 px-2 py-1 rounded">
                      📷 {attraction.photos.length} 张照片
                    </p>
                  )}
                  <button
                    className="mt-2 text-xs bg-pink-400 text-white px-3 py-1 rounded-full hover:bg-pink-500 transition-colors"
                    onClick={() => {
                      if (onMarkerClick) {
                        onMarkerClick(attraction);
                      }
                    }}
                  >
                    {isVisited ? '查看详情' : '查看详情/编辑坐标'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* 显示没有坐标的景点提示 */}
      {attractions.length > attractionsWithCoords.length && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border-2 border-yellow-200 shadow-lg z-[1000]">
          <p className="text-sm text-gray-600">
            ⚠️ 有 {attractions.length - attractionsWithCoords.length} 个景点没有坐标数据，无法在地图上显示
          </p>
        </div>
      )}
    </div>
  );
}

