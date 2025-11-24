// 城市边界数据（用于在地图上显示城市轮廓）
import { LatLngExpression } from 'leaflet';

export interface CityBounds {
  center: [number, number]; // [纬度, 经度]
  bounds: LatLngExpression[]; // 城市边界多边形
  zoom: number; // 推荐缩放级别
}

export const cityBoundsMap: Record<string, CityBounds> = {
  beijing: {
    center: [39.9042, 116.4074],
    zoom: 11,
    bounds: [
      [40.2, 116.0],  // 西北
      [40.2, 116.8],  // 东北
      [39.6, 116.8],  // 东南
      [39.6, 116.0],  // 西南
      [40.2, 116.0],  // 闭合
    ],
  },
  shanghai: {
    center: [31.2304, 121.4737],
    zoom: 11,
    bounds: [
      [31.4, 121.2],  // 西北
      [31.4, 121.6],  // 东北
      [31.0, 121.6],  // 东南
      [31.0, 121.2],  // 西南
      [31.4, 121.2],  // 闭合
    ],
  },
  guangzhou: {
    center: [23.1291, 113.2644],
    zoom: 11,
    bounds: [
      [23.3, 113.0],  // 西北
      [23.3, 113.5],  // 东北
      [22.9, 113.5],  // 东南
      [22.9, 113.0],  // 西南
      [23.3, 113.0],  // 闭合
    ],
  },
};

// 获取城市边界数据
export function getCityBounds(cityId: string): CityBounds | null {
  return cityBoundsMap[cityId] || null;
}

