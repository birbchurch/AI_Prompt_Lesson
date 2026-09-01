import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('poe_api_key') || '';
      setApiKey(savedKey);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('poe_api_key', apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            API 設定
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Poe API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="請輸入你的 Poe API Key..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <p className="mt-2 text-sm text-slate-500 flex items-center gap-1">
              如何獲取 API Key? 
              <a 
                href="https://poe.com/api_key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-1"
              >
                前往 Poe 開發者平台 <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all ${
              isSaved 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSaved ? '✅ 已儲存' : '儲存設定'}
          </button>
        </div>
      </div>
    </div>
  );
}
