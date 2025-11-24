import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CityList from './components/CityList';
import CityDetail from './components/CityDetail';
import AttractionDetail from './components/AttractionDetail';
import { AppData } from './types';
import { loadData, saveData } from './utils/storage';
import { getShareDataFromUrl } from './utils/share';

function App() {
  const [data, setData] = useState<AppData>(loadData());

  // 检查 URL 中是否有分享数据
  useEffect(() => {
    const shareData = getShareDataFromUrl();
    if (shareData) {
      if (confirm('检测到分享数据，是否要导入？导入将覆盖当前数据。')) {
        saveData(shareData);
        setData(shareData);
        // 清除 URL 参数
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // 监听数据变化，自动保存
  useEffect(() => {
    const handleStorageChange = () => {
      setData(loadData());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<CityList data={data} setData={setData} />} />
        <Route path="/city/:cityId" element={<CityDetail data={data} setData={setData} />} />
        <Route path="/city/:cityId/attraction/:attractionId" element={<AttractionDetail data={data} setData={setData} />} />
      </Routes>
    </div>
  );
}

export default App;

