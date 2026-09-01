import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, BookOpen, Settings } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-b-4 border-sky-200 px-6 py-3 flex flex-wrap items-center justify-between shadow-sm sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 p-2 rounded-2xl shadow-inner">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <Link to="/" className="text-2xl font-black tracking-tight text-sky-700 hover:opacity-80 transition-opacity">
            英語AI學習工具
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full border-2 border-green-300">
            <span className="text-green-700 font-bold text-sm underline decoration-green-300 underline-offset-4">
              等級: 見習魔法師 🌟
            </span>
          </div>
          <Link
            to="/questions"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold px-4 py-2 rounded-xl border-2 border-indigo-300 flex items-center gap-2 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            快速題目庫
          </Link>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-2 rounded-xl border-2 border-slate-300 flex items-center transition-colors"
            title="API 設定"
          >
            <Settings className="w-5 h-5" />
          </button>
          {!isHome && (
            <Link
              to="/"
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl border-2 border-slate-300 flex items-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              返回首頁
            </Link>
          )}
        </div>
      </nav>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
