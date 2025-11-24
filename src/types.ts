// 景点坐标
export interface Coordinates {
  lat: number;
  lng: number;
}

// 景点数据模型
export interface Attraction {
  id: string;
  name: string;
  visited: boolean;
  visitCount: number;
  photos: string[]; // base64 编码的图片
  videos: string[]; // base64 编码的视频
  notes: string;
  coordinates?: Coordinates; // 经纬度坐标（可选）
  createdAt: string;
  updatedAt: string;
}

// 城市数据模型
export interface City {
  id: string;
  name: string;
  attractions: Attraction[];
  createdAt: string;
}

// 应用数据模型
export interface AppData {
  cities: City[];
}

