import { AppData, City, Attraction } from '../types';

const STORAGE_KEY = 'trip-app-data';

// 默认城市和景点数据（包含坐标）
const defaultData: AppData = {
  cities: [
    {
      id: 'beijing',
      name: '北京',
      createdAt: new Date().toISOString(),
      attractions: [
        { id: 'tiananmen', name: '天安门', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 39.9042, lng: 116.3974 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'yuanmingyuan', name: '圆明园', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 40.0086, lng: 116.3008 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'forbidden-city', name: '故宫', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 39.9163, lng: 116.3972 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'great-wall', name: '长城', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 40.4319, lng: 116.5704 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'summer-palace', name: '颐和园', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 39.9998, lng: 116.2754 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    },
    {
      id: 'shanghai',
      name: '上海',
      createdAt: new Date().toISOString(),
      attractions: [
        { id: 'bund', name: '外滩', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 31.2397, lng: 121.4994 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'disney', name: '迪士尼乐园', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 31.1443, lng: 121.6573 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'yu-garden', name: '豫园', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 31.2267, lng: 121.4932 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    },
    {
      id: 'guangzhou',
      name: '广州',
      createdAt: new Date().toISOString(),
      attractions: [
        { id: 'canton-tower', name: '广州塔', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 23.1064, lng: 113.3245 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'yuexiu-park', name: '越秀公园', visited: false, visitCount: 0, photos: [], videos: [], notes: '', coordinates: { lat: 23.1394, lng: 113.2688 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    },
  ],
};

// 从 localStorage 加载数据
export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // 合并默认数据，确保新添加的默认景点也会出现
      return mergeData(defaultData, data);
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  }
  return defaultData;
}

// 合并数据（保留用户数据，添加新的默认景点）
function mergeData(defaultData: AppData, userData: AppData): AppData {
  const merged: AppData = { cities: [] };

  // 遍历默认城市
  defaultData.cities.forEach(defaultCity => {
    const userCity = userData.cities.find(c => c.id === defaultCity.id);
    
    if (userCity) {
      // 合并景点：保留用户数据，添加新的默认景点
      const mergedAttractions: Attraction[] = [];
      const userAttractionIds = new Set(userCity.attractions.map(a => a.id));
      
      // 添加用户已有的景点
      mergedAttractions.push(...userCity.attractions);
      
      // 添加默认景点中用户还没有的
      defaultCity.attractions.forEach(defaultAttraction => {
        if (!userAttractionIds.has(defaultAttraction.id)) {
          mergedAttractions.push(defaultAttraction);
        }
      });
      
      merged.cities.push({
        ...userCity,
        attractions: mergedAttractions,
      });
    } else {
      // 用户没有这个城市，直接添加默认城市
      merged.cities.push(defaultCity);
    }
  });

  // 添加用户自定义的城市（不在默认列表中的）
  userData.cities.forEach(userCity => {
    if (!defaultData.cities.find(c => c.id === userCity.id)) {
      merged.cities.push(userCity);
    }
  });

  return merged;
}

// 保存数据到 localStorage
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

// 添加城市
export function addCity(name: string, data: AppData): City {
  const newCity: City = {
    id: `city-${Date.now()}`,
    name,
    attractions: [],
    createdAt: new Date().toISOString(),
  };
  data.cities.push(newCity);
  saveData(data);
  return newCity;
}

// 添加景点
export function addAttraction(cityId: string, name: string, data: AppData): Attraction {
  const city = data.cities.find(c => c.id === cityId);
  if (!city) throw new Error('城市不存在');

  const newAttraction: Attraction = {
    id: `attraction-${Date.now()}`,
    name,
    visited: false,
    visitCount: 0,
    photos: [],
    videos: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  city.attractions.push(newAttraction);
  saveData(data);
  return newAttraction;
}

// 更新景点
export function updateAttraction(
  cityId: string,
  attractionId: string,
  updates: Partial<Attraction>,
  data: AppData
): void {
  const city = data.cities.find(c => c.id === cityId);
  if (!city) throw new Error('城市不存在');

  const attraction = city.attractions.find(a => a.id === attractionId);
  if (!attraction) throw new Error('景点不存在');

  Object.assign(attraction, updates, {
    updatedAt: new Date().toISOString(),
  });

  saveData(data);
}

// 切换景点访问状态
export function toggleAttractionVisited(
  cityId: string,
  attractionId: string,
  data: AppData
): void {
  const city = data.cities.find(c => c.id === cityId);
  if (!city) throw new Error('城市不存在');

  const attraction = city.attractions.find(a => a.id === attractionId);
  if (!attraction) throw new Error('景点不存在');

  attraction.visited = !attraction.visited;
  if (attraction.visited && attraction.visitCount === 0) {
    attraction.visitCount = 1;
  }
  attraction.updatedAt = new Date().toISOString();

  saveData(data);
}

// 将文件转换为 base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

