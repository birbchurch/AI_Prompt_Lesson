import { Link } from 'react-router-dom';
import { scenarios } from '../data/scenarios';
import { Search, Cpu, Plane, BookOpen, Mic, PenTool, Image as ImageIcon } from 'lucide-react';
import React from 'react';

const iconMap = {
  Search: Search,
  Cpu: Cpu,
  Plane: Plane,
  BookOpen: BookOpen,
  Mic: Mic,
  PenTool: PenTool,
  Image: ImageIcon,
};

export default function Home() {
  const stage1Scenarios = scenarios.filter(s => s.stage === 1);
  const stage2Scenarios = scenarios.filter(s => s.stage === 2);
  const stage4Scenarios = scenarios.filter(s => s.stage === 4);

  return (
    <div className="flex-1 overflow-y-auto bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-sky-800 mb-4 tracking-tight">
          歡迎來到 <span className="text-blue-600">情景大廳</span> 🏰
        </h1>
        <p className="text-xl text-slate-600 font-medium">
          一起學習如何使用「提示詞」與 AI 溝通吧！
        </p>
      </header>

      <div className="bg-white border-4 border-yellow-300 rounded-[32px] p-6 sm:p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shrink-0 mt-1 border-2 border-yellow-300">
            0
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">開始對話</h2>
            <p className="text-slate-600 text-lg font-medium">直接進入你之前的對話練習！</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={`/practice/${scenarios[0].id}?newChat=true&empty=true`}
            className="flex-shrink-0 flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 px-6 py-4 rounded-2xl font-black text-xl border-b-8 border-slate-200 active:border-b-2 active:translate-y-1 transition-all shadow-md"
          >
            建立空白新對話 💬
          </Link>
          <Link
            to={`/practice/${scenarios[0].id}`}
            className="flex-shrink-0 flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 px-6 py-4 rounded-2xl font-black text-xl border-b-8 border-yellow-600 active:border-b-2 active:translate-y-1 transition-all shadow-md"
          >
            繼續對話練習 ▶️
          </Link>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-black text-sky-800 mb-6 flex items-center gap-3">
          <span className="bg-sky-200 text-sky-700 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shrink-0 border-2 border-sky-300">
            1
          </span>
          Stage 1: 基礎實作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stage1Scenarios.map((scenario) => {
            const IconComponent = iconMap[scenario.icon as keyof typeof iconMap] || Search;
            return (
              <Link
                key={scenario.id}
                to={`/practice/${scenario.id}`}
                className="group bg-white border-4 border-blue-100 hover:border-blue-300 rounded-[32px] p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2 border-blue-100">
                  <IconComponent className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-600">
                  {scenario.title}
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  {scenario.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-sky-800 mb-6 flex items-center gap-3">
          <span className="bg-purple-200 text-purple-700 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shrink-0 border-2 border-purple-300">
            2
          </span>
          Stage 2: 詞彙與寫作強化
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stage2Scenarios.map((scenario) => {
            const IconComponent = iconMap[scenario.icon as keyof typeof iconMap] || Search;
            return (
              <Link
                key={scenario.id}
                to={`/practice/${scenario.id}`}
                className="group bg-white border-4 border-purple-100 hover:border-purple-300 rounded-[32px] p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-24 h-24 bg-purple-50 text-purple-500 rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2 border-purple-100">
                  <IconComponent className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-purple-600">
                  {scenario.title}
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  {scenario.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {stage4Scenarios.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-black text-sky-800 mb-6 flex items-center gap-3">
            <span className="bg-orange-200 text-orange-700 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shrink-0 border-2 border-orange-300">
              4
            </span>
            Stage 4: 媒體應用
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stage4Scenarios.map((scenario) => {
              const IconComponent = iconMap[scenario.icon as keyof typeof iconMap] || Search;
              return (
                <Link
                  key={scenario.id}
                  to={`/practice/${scenario.id}`}
                  className="group bg-white border-4 border-orange-100 hover:border-orange-300 rounded-[32px] p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2 border-orange-100">
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-orange-600">
                    {scenario.title}
                  </h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    {scenario.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
