import { AppData } from '../types';

// 导出数据为 JSON 字符串
export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

// 从 JSON 字符串导入数据
export function importData(jsonString: string): AppData {
  try {
    const data = JSON.parse(jsonString);
    // 验证数据结构
    if (data && Array.isArray(data.cities)) {
      return data as AppData;
    }
    throw new Error('无效的数据格式');
  } catch (error) {
    throw new Error('导入失败：数据格式不正确');
  }
}

// 导出数据为文件
export function exportToFile(data: AppData, filename: string = 'trip-data.json'): void {
  const jsonString = exportData(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 从文件导入数据
export function importFromFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const data = importData(jsonString);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

// 生成分享链接（使用 base64 编码）
export function generateShareLink(data: AppData): string {
  const jsonString = exportData(data);
  const encoded = btoa(encodeURIComponent(jsonString));
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?share=${encoded}`;
}

// 从 URL 参数读取分享数据
export function getShareDataFromUrl(): AppData | null {
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');
  if (shareParam) {
    try {
      const decoded = decodeURIComponent(atob(shareParam));
      return importData(decoded);
    } catch (error) {
      console.error('解析分享链接失败:', error);
      return null;
    }
  }
  return null;
}

