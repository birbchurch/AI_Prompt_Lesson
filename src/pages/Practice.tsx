import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { scenarios } from '../data/scenarios';
import { GuidePromptState } from '../types';
import { Check, Wand2, Paperclip, X, Zap, Send, LayoutTemplate, Search, Cpu, Plane, BookOpen, Mic, PenTool, Image as ImageIcon } from 'lucide-react';
import { useChatRooms } from '../hooks/useChatRooms';
import ChatPanel, { ChatPanelRef } from '../components/ChatPanel';

const iconMap = {
  Search: Search,
  Cpu: Cpu,
  Plane: Plane,
  BookOpen: BookOpen,
  Mic: Mic,
  PenTool: PenTool,
  Image: ImageIcon,
};

const CLEAR_OPTIONS = {
  context: ['針對香港中小學生', '生活化場景設定'],
  limits: ['嚴格限制 CEFR A1-A2 程度', '輸出字數限制在 150 字以內'],
  examples: ['提供具體的對話示範', '提供常見錯誤對比'],
  assumptions: ['假設學生完全沒有英文基礎', '假設學生對文法感到害怕'],
  request: ['中英對照，並附帶簡單廣東話說明', '一步一步引導，不要一次給出全部答案']
};

export default function Practice() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const questionIdParam = searchParams.get('questionId');
  const isNewChat = searchParams.get('newChat') === 'true';
  const scenario = scenarios.find((s) => s.id === scenarioId);

  const {
    chatRooms,
    activeRoomId,
    setActiveRoomId,
    createRoom,
    deleteRoom,
    addMessage,
    updateMessage
  } = useChatRooms();

  const chatPanelRef = useRef<ChatPanelRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- States ---
  const [activeTab, setActiveTab] = useState<'guide' | 'clear'>('guide');
  
  // Tab 1 (GUIDE) states
  const [promptState, setPromptState] = useState<GuidePromptState>({
    goal: '',
    user: '',
    instruction: '',
    details: [],
    guardrails: '隱藏護欄：請保持語氣鼓勵、絕對不使用負面字眼、英文難度嚴格限制在 CEFR A1-A2 級別。'
  });
  const [stagedFile, setStagedFile] = useState<{name: string, type: 'image' | 'file', content: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Tab 2 (CLEAR) states
  const [clearOriginalPrompt, setClearOriginalPrompt] = useState('');
  const [clearState, setClearState] = useState({
    context: { defaults: [] as string[], custom: '' },
    limits: { defaults: [] as string[], custom: '' },
    examples: { defaults: [] as string[], custom: '' },
    assumptions: { defaults: [] as string[], custom: '' },
    request: { defaults: [] as string[], custom: '' }
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (scenario) {
      let initialInstruction = scenario.defaultInstruction;
      let matchedQuestion = null;
      if (questionIdParam) {
        matchedQuestion = scenario.questionBank.find(q => q.id === questionIdParam);
        if (matchedQuestion) {
          initialInstruction = matchedQuestion.text;
        }
      }

      setPromptState({
        goal: scenario.defaultGoal,
        user: scenario.defaultUser,
        instruction: initialInstruction,
        details: [],
        guardrails: '隱藏護欄：請保持語氣鼓勵、絕對不使用負面字眼、英文難度嚴格限制在 CEFR A1-A2 級別。'
      });

      if (isNewChat) {
        const title = matchedQuestion ? matchedQuestion.title : scenario.title;
        createRoom(title);
        searchParams.delete('newChat');
        
        if (searchParams.get('empty') === 'true') {
          setPromptState({
            goal: '',
            user: '',
            instruction: '',
            details: [],
            examples: '',
            guardrails: '隱藏護欄：請保持語氣鼓勵、絕對不使用負面字眼、英文難度嚴格限制在 CEFR A1-A2 級別。'
          });
          searchParams.delete('empty');
        }
        setSearchParams(searchParams, { replace: true });
      }
    } else {
      navigate('/');
    }
  }, [scenario, navigate, questionIdParam, isNewChat]);

  if (!scenario) return null;

  // --- File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const isImage = file.type.startsWith('image/');
      setStagedFile({
        name: file.name,
        type: isImage ? 'image' : 'file',
        content
      });
    };
    
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Handlers ---
  const handleDetailToggle = (detailText: string) => {
    setPromptState(prev => {
      const details = prev.details.includes(detailText)
        ? prev.details.filter(d => d !== detailText)
        : [...prev.details, detailText];
      return { ...prev, details };
    });
  };

  const generateFullPrompt = () => {
    return `
[Goal]: ${promptState.goal}
[User]: ${promptState.user}
[Instruction]: ${promptState.instruction}
${promptState.details.length > 0 ? `[Details]:\n${promptState.details.map(d => `- ${d}`).join('\n')}` : ''}
${promptState.examples ? `[Examples]: ${promptState.examples}` : ''}

${promptState.guardrails}
    `.trim();
  };

  const handleDirectSend = () => {
    const fullPrompt = generateFullPrompt();
    let roomId = activeRoomId;
    if (!roomId) {
      roomId = createRoom(scenario.title);
    }
    
    chatPanelRef.current?.send(fullPrompt, stagedFile, roomId);
    setStagedFile(null); // Clear after sending
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSwitchToClear = () => {
    setClearOriginalPrompt(generateFullPrompt());
    setActiveTab('clear');
  };

  const handleClearCheckbox = (section: keyof typeof clearState, value: string) => {
    setClearState(prev => {
      const currentDefaults = prev[section].defaults;
      const newDefaults = currentDefaults.includes(value) 
        ? currentDefaults.filter(item => item !== value)
        : [...currentDefaults, value];
      return { ...prev, [section]: { ...prev[section], defaults: newDefaults } };
    });
  };

  const optimizePrompt = async () => {
    setIsOptimizing(true);
    try {
      const apiKey = localStorage.getItem('poe_api_key');
      const contextItems = [...clearState.context.defaults, clearState.context.custom].filter(Boolean).join('\n- ');
      const limitItems = [...clearState.limits.defaults, clearState.limits.custom].filter(Boolean).join('\n- ');
      const exampleItems = [...clearState.examples.defaults, clearState.examples.custom].filter(Boolean).join('\n- ');
      const assumptionItems = [...clearState.assumptions.defaults, clearState.assumptions.custom].filter(Boolean).join('\n- ');
      const requestItems = [...clearState.request.defaults, clearState.request.custom].filter(Boolean).join('\n- ');

      const systemPrompt = `【任務】你是一位專業的 AI 提示詞工程師。請務必運用 CLEAR 框架（Context 背景、Limits 限制、Examples 示例、Assumptions 假設、Request 請求）原則，優化以下由學生設計的原始提示詞。
      
【原始提示詞】：
${clearOriginalPrompt}
【用戶勾選的 CLEAR 補強條件】：
- Context: 
- ${contextItems || '無'}
- Limits: 
- ${limitItems || '無'}
- Examples: 
- ${exampleItems || '無'}
- Assumptions: 
- ${assumptionItems || '無'}
- Request: 
- ${requestItems || '無'}

【輸出要求】
請重構並輸出一個極致清晰、專業且效果卓越的「優化版中文提示詞 (Optimized Prompt)」。
回傳格式只需包含經過處理的最終優化提示詞文字即可，不需要額外寒暄或解釋，方便用戶直接發送。`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          messages: [{ role: 'user', content: systemPrompt }]
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        const optimizedPrompt = data.choices[0].message.content;
        chatPanelRef.current?.populate(optimizedPrompt, stagedFile);
        setStagedFile(null); // Clear staged file after passing it to ChatPanel
      } else {
        alert("優化失敗: " + (data.error || '無法連接到 AI'));
      }
    } catch(e) {
      alert("優化失敗: 網絡連線錯誤");
    } finally {
      setIsOptimizing(false);
    }
  };

  // --- Render Helpers ---
  const renderClearSection = (title: string, sectionKey: keyof typeof clearState, options: string[]) => {
    return (
      <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
        <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">{title}</h3>
        <div className="flex flex-col gap-2">
          {options.map(opt => (
            <label key={opt} className="flex items-start gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={clearState[sectionKey].defaults.includes(opt)}
                onChange={() => handleClearCheckbox(sectionKey, opt)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" 
              />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{opt}</span>
            </label>
          ))}
          <textarea
            className="mt-2 w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 resize-none placeholder-slate-400"
            rows={2}
            placeholder="自訂補充說明..."
            value={clearState[sectionKey].custom}
            onChange={(e) => setClearState(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], custom: e.target.value } }))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 lg:flex-row w-full h-full bg-slate-50 relative overflow-hidden">
      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-slate-200">
            <div className="flex items-center justify-between p-6 border-b-2 border-slate-100 bg-slate-50">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <LayoutTemplate className="w-7 h-7 text-indigo-500" />
                切換模板 (Switch Template)
              </h2>
              <button 
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {[1, 2, 4].map(stage => {
                const stageScenarios = scenarios.filter(s => s.stage === stage);
                if (stageScenarios.length === 0) return null;
                
                let stageTitle = '';
                let stageColor = '';
                if (stage === 1) { stageTitle = 'Stage 1: 基礎實作'; stageColor = 'sky'; }
                if (stage === 2) { stageTitle = 'Stage 2: 詞彙與寫作強化'; stageColor = 'purple'; }
                if (stage === 4) { stageTitle = 'Stage 4: 媒體應用'; stageColor = 'orange'; }

                return (
                  <div key={stage} className="mb-8 last:mb-0">
                    <h3 className={`text-xl font-black text-${stageColor}-800 mb-4 flex items-center gap-2`}>
                      <span className={`bg-${stageColor}-200 text-${stageColor}-700 w-8 h-8 rounded-full flex items-center justify-center font-black text-lg border-2 border-${stageColor}-300`}>
                        {stage}
                      </span>
                      {stageTitle}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stageScenarios.map(s => {
                        const Icon = iconMap[s.icon as keyof typeof iconMap] || Search;
                        const isCurrent = s.id === scenario.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              navigate(`/practice/${s.id}`, { replace: true });
                              setIsTemplateModalOpen(false);
                              setActiveTab('guide');
                            }}
                            className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all border-4 ${
                              isCurrent 
                                ? `border-${stageColor}-400 bg-${stageColor}-50` 
                                : `border-slate-100 hover:border-${stageColor}-200 bg-white hover:bg-slate-50`
                            }`}
                          >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                              isCurrent ? `bg-${stageColor}-100 text-${stageColor}-600` : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <h4 className={`font-black mb-1 ${isCurrent ? `text-${stageColor}-700` : 'text-slate-700'}`}>
                              {s.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 左欄 */}
      <section className="w-full lg:w-1/2 flex flex-col flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <div className="flex bg-white rounded-2xl p-1 gap-1 flex-1 shadow-sm border-2 border-slate-200">
            <button 
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-3 text-base sm:text-lg font-black rounded-xl transition-all ${activeTab === 'guide' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            >製作 (GUIDE)</button>
            <button 
              onClick={() => setActiveTab('clear')}
              className={`flex-1 py-3 text-base sm:text-lg font-black rounded-xl transition-all ${activeTab === 'clear' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            >優化 (CLEAR)</button>
          </div>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl font-black transition-all shadow-sm shrink-0"
          >
            <LayoutTemplate className="w-5 h-5" />
            <span className="hidden sm:inline">📑 模板</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border-4 border-slate-200 p-5 shadow-xl flex flex-col flex-1 shrink-0 overflow-y-auto">
          {activeTab === 'guide' ? (
            // --- TAB 1: GUIDE ---
            <>
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <span className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">1</span>
                <h2 className="text-xl font-black text-blue-600">組合魔法積木 (GUIDE)</h2>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                {/* Goal */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-wider">🎯 【Goal 目標】</label>
                  <textarea 
                    rows={2}
                    className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl text-lg font-bold text-blue-900 focus:outline-none focus:border-blue-300 resize-none"
                    value={promptState.goal}
                    onChange={(e) => setPromptState({...promptState, goal: e.target.value})}
                    placeholder="輸入你的目標..."
                  />
                </div>

                {/* User */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-wider">👤 【User 對象/角色】</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set([scenario.defaultUser, '香港小四學生', '香港中三學生'])).map(user => (
                      <button
                        key={user}
                        onClick={() => setPromptState({...promptState, user})}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-sm ${
                          promptState.user === user
                            ? 'bg-green-500 text-white border-b-4 border-green-700'
                            : 'bg-white text-slate-500 border-2 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {user}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Bank (New) */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-wider">💡 【快速題目庫】點選帶入任務</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {scenario.questionBank.map(q => (
                      <button
                        key={q.id}
                        onClick={() => setPromptState({...promptState, instruction: q.text})}
                        className="p-3 text-left bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-xl transition-colors active:scale-95"
                      >
                        <div className="font-bold text-indigo-900 mb-1 text-sm">{q.title}</div>
                        <div className="text-xs text-indigo-700 line-clamp-2">{q.text}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instruction */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-wider">📝 【Instruction 具體任務】(可自由修改)</label>
                  <textarea
                    rows={3}
                    className="w-full p-4 bg-purple-50 border-2 border-purple-100 rounded-2xl text-lg font-medium text-purple-900 focus:outline-none focus:border-purple-300 resize-none"
                    value={promptState.instruction}
                    onChange={(e) => setPromptState({...promptState, instruction: e.target.value})}
                    placeholder="你想 AI 幫你做什麼？"
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-wider">🔍 【Details 細節與限制】</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scenario.availableDetails.map(detail => {
                      const isChecked = promptState.details.includes(detail.text);
                      return (
                        <label
                          key={detail.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                            isChecked ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleDetailToggle(detail.text)}
                            className="w-5 h-5 rounded-md accent-orange-500 cursor-pointer shrink-0"
                          />
                          <span className={`font-bold text-sm ${isChecked ? 'text-orange-800' : 'text-slate-600'}`}>{detail.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
                
                {/* File Upload Section */}
                <div className="pt-4 border-t-2 border-slate-100">
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.md,.csv,.json,.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx"
                    />
                    {stagedFile ? (
                      <div className="relative w-fit mt-2">
                        {stagedFile.type === 'image' ? (
                          <img src={stagedFile.content} alt="preview" className="h-24 rounded-lg border-2 border-slate-200 shadow-sm object-cover" />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border-2 border-slate-200 shadow-sm">
                            <Paperclip className="w-5 h-5 text-slate-500" />
                            <span className="font-bold text-sm text-slate-700">{stagedFile.name}</span>
                          </div>
                        )}
                        <button 
                          onClick={() => setStagedFile(null)} 
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                          title="移除附件"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all font-bold"
                      >
                        <Paperclip className="w-5 h-5" />
                        <span>📎 附加任何檔案 / 圖片 (Attach File/Image)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-slate-100">
                  <button
                    onClick={handleDirectSend}
                    className={`flex-1 font-black py-4 px-4 rounded-2xl text-lg shadow-md flex items-center justify-center gap-2 transition-all ${
                      isCopied 
                        ? 'bg-green-500 text-white border-b-4 border-green-700 translate-y-1' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>🎉 發送成功</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>🪄 直接發送</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSwitchToClear}
                    className="flex-1 font-black py-4 px-4 rounded-2xl text-lg shadow-md flex items-center justify-center gap-2 transition-all bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span>🪄 優化提示</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // --- TAB 2: CLEAR ---
            <>
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <span className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">2</span>
                <h2 className="text-xl font-black text-indigo-600">優化提示詞 (CLEAR)</h2>
              </div>
              
              <div className="flex flex-col gap-6 flex-1">
                {/* 原始 Prompt 預覽 */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    📄 原始提示詞預覽 (可編輯)
                  </label>
                  {stagedFile && (
                    <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-2 rounded-lg inline-flex items-center gap-2 mb-2">
                      <Paperclip className="w-3 h-3" />
                      [📎 已連帶文件: {stagedFile.name}]
                    </div>
                  )}
                  <textarea
                    className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-400 resize-y min-h-[120px]"
                    value={clearOriginalPrompt}
                    onChange={e => setClearOriginalPrompt(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-2">✨ CLEAR 框架條件補強</h3>
                  {renderClearSection('Context (背景)', 'context', CLEAR_OPTIONS.context)}
                  {renderClearSection('Limits (限制)', 'limits', CLEAR_OPTIONS.limits)}
                  {renderClearSection('Examples (示例)', 'examples', CLEAR_OPTIONS.examples)}
                  {renderClearSection('Assumptions (假設)', 'assumptions', CLEAR_OPTIONS.assumptions)}
                  {renderClearSection('Request (請求)', 'request', CLEAR_OPTIONS.request)}
                </div>
                
                {/* Optimize CTA */}
                <div className="pt-4 mt-auto border-t-2 border-slate-100">
                  <button
                    onClick={optimizePrompt}
                    disabled={isOptimizing || !clearOriginalPrompt.trim()}
                    className="w-full font-black py-4 px-6 rounded-2xl text-xl shadow-lg flex items-center justify-center gap-3 transition-all shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1"
                  >
                    {isOptimizing ? (
                      <div className="animate-spin w-6 h-6 border-4 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )}
                    <span>{isOptimizing ? 'AI 正在極速優化中...' : '⚡ AI 優化提示詞'}</span>
                  </button>
                  <p className="text-center text-slate-400 text-sm mt-3 font-medium">優化後將自動填入右側聊天室，讓你進行最後預覽</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 右欄：Chat Panel */}
      <section className="w-full lg:w-1/2 flex flex-col flex-1 min-h-0 relative z-10 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]">
        <ChatPanel 
          ref={chatPanelRef}
          chatRooms={chatRooms}
          activeRoomId={activeRoomId}
          setActiveRoomId={setActiveRoomId}
          createRoom={(title, msg) => {
            setPromptState({
              goal: '',
              user: '',
              instruction: '',
              details: [],
              examples: '',
              guardrails: '隱藏護欄：請保持語氣鼓勵、絕對不使用負面字眼、英文難度嚴格限制在 CEFR A1-A2 級別。'
            });
            createRoom(title, msg);
          }}
          deleteRoom={deleteRoom}
          addMessage={addMessage}
          updateMessage={updateMessage}
        />
      </section>
    </div>
  );
}
