import { useState, useRef } from 'react';
import { X, Download, Upload, Share2, Copy, Check } from 'lucide-react';
import { AppData } from '../types';
import { exportToFile, importFromFile, generateShareLink, exportData, importData } from '../utils/share';

interface ShareModalProps {
  data: AppData;
  onImport: (data: AppData) => void;
  onClose: () => void;
}

export default function ShareModal({ data, onImport, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'share'>('export');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToFile(data, `trip-data-${timestamp}.json`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    try {
      const importedData = await importFromFile(file);
      if (confirm('导入数据将覆盖当前所有数据，确定要继续吗？')) {
        onImport(importedData);
        onClose();
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateLink = () => {
    const link = generateShareLink(data);
    setShareLink(link);
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  const handleCopyData = async () => {
    try {
      const jsonString = exportData(data);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-cute shadow-xl border-2 border-pink-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-pink-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-pink-500" />
            数据共享
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'export'
                ? 'bg-pink-100 text-pink-600 border-b-2 border-pink-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Download className="w-5 h-5 inline mr-2" />
            导出数据
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'import'
                ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            导入数据
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'share'
                ? 'bg-green-100 text-green-600 border-b-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Share2 className="w-5 h-5 inline mr-2" />
            分享链接
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 导出数据 */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                导出您的旅行数据，可以保存为文件或复制到剪贴板
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  className="w-full bg-pink-400 text-white py-3 rounded-lg hover:bg-pink-500 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Download className="w-5 h-5" />
                  导出为 JSON 文件
                </button>

                <button
                  onClick={handleCopyData}
                  className="w-full bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      已复制到剪贴板
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      复制数据到剪贴板
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>提示：</strong>导出的文件可以发送给您的伴侣，对方可以通过"导入数据"功能加载您的数据。
                </p>
              </div>
            </div>
          )}

          {/* 导入数据 */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                从文件或剪贴板导入旅行数据
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-400 text-white py-3 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Upload className="w-5 h-5" />
                从文件导入
              </button>

              {importError && (
                <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm">
                  {importError}
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ 警告：</strong>导入数据将覆盖当前所有数据，请确保已备份当前数据。
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>从剪贴板导入：</strong>
                </p>
                <textarea
                  placeholder="粘贴 JSON 数据..."
                  className="w-full h-32 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none text-sm font-mono"
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text');
                    try {
                      const importedData = importData(text);
                      if (confirm('导入数据将覆盖当前所有数据，确定要继续吗？')) {
                        onImport(importedData);
                        onClose();
                      }
                    } catch (error) {
                      setImportError(error instanceof Error ? error.message : '导入失败');
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* 分享链接 */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                生成分享链接，发送给您的伴侣即可同步数据
              </p>

              {!shareLink ? (
                <button
                  onClick={handleGenerateLink}
                  className="w-full bg-green-400 text-white py-3 rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Share2 className="w-5 h-5" />
                  生成分享链接
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">分享链接：</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            复制
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>💡 使用方法：</strong>
                      <br />
                      1. 复制上面的链接
                      <br />
                      2. 发送给您的伴侣
                      <br />
                      3. 对方打开链接后，数据会自动加载
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

