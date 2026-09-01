/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Questions from './pages/Questions';

const QuestionRedirect = () => {
  const { activityId, questionId } = useParams();
  return <Navigate to={`/practice/${activityId}?questionId=${questionId}&newChat=true`} replace />;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:activityId/:questionId" element={<QuestionRedirect />} />
        <Route path="/practice/:scenarioId" element={<Practice />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="h-screen bg-sky-50 font-sans text-slate-800 flex flex-col overflow-hidden">
        <Navbar />
        <AppRoutes />
        {/* Footer Bar */}
        <footer className="bg-sky-100 px-6 py-3 flex justify-between items-center shrink-0 border-t-2 border-sky-200">
          <div className="flex gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-[11px] sm:text-xs font-bold text-sky-700">[Goal] 目標</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-[11px] sm:text-xs font-bold text-sky-700">[User] 對象</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-[11px] sm:text-xs font-bold text-sky-700">[Instruction] 指令</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-[11px] sm:text-xs font-bold text-sky-700">[Details] 細節</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-sky-600 opacity-60 ml-4 text-right">課程代碼: HK-AI-PROMPT-V1</p>
        </footer>
      </div>
    </Router>
  );
}
