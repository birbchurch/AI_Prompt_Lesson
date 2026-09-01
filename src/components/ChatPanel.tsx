import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Plus, Trash2, MessageSquare, Paperclip, X, Wrench, Zap } from 'lucide-react';
import { ChatRoom, Message } from '../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { STAGE_REFRAME_OPTIONS } from '../data/scenarios';

const RAISE_OPTIONS = {
  reframe: ['請用更簡單的字眼', '用語氣更生動有趣的方式說', '以小學老師的口吻重新解釋'],
  add: ['給出一個具體生活例子', '多補充一些背景細節', '加上簡單的小測驗'],
  include: ['加上廣東話翻譯', '加上每個生字的拼音/音標'],
  specify: ['改成點列式排版 (Bullet points)', '將長文分成幾個小段落', '總結成 3 個重點'],
  evaluate: ['檢查並指出我剛才的文法錯誤', '評估這段內容適不適合初學者']
};

export interface ChatPanelRef {
  send: (text: string, file: {name: string, type: 'image' | 'file', content: string} | null, roomId?: string) => void;
  populate: (text: string, file: {name: string, type: 'image' | 'file', content: string} | null) => void;
}

interface ChatPanelProps {
  chatRooms: ChatRoom[];
  activeRoomId: string | null;
  setActiveRoomId: (id: string) => void;
  createRoom: (title: string, msg?: Message) => void;
  deleteRoom: (id: string) => void;
  addMessage: (roomId: string, message: Message) => void;
  updateMessage: (roomId: string, messageId: string, updates: Partial<Message>) => void;
}

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(({
  chatRooms,
  activeRoomId,
  setActiveRoomId,
  createRoom,
  deleteRoom,
  addMessage,
  updateMessage
}, ref) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeRoom = chatRooms.find(r => r.id === activeRoomId);

  const [selectedFile, setSelectedFile] = useState<{name: string, type: 'image' | 'file', content: string} | null>(null);

  // RAISE Modal states
  const [raiseTargetMsg, setRaiseTargetMsg] = useState<Message | null>(null);
  const [isRaiseOptimizing, setIsRaiseOptimizing] = useState(false);
  const [selectedStageFeature, setSelectedStageFeature] = useState<string>('');
  const [raiseState, setRaiseState] = useState({
    reframe: { defaults: [] as string[], custom: '' },
    add: { defaults: [] as string[], custom: '' },
    include: { defaults: [] as string[], custom: '' },
    specify: { defaults: [] as string[], custom: '' },
    evaluate: { defaults: [] as string[], custom: '' }
  });

  useImperativeHandle(ref, () => ({
    send: (text, file, roomId) => {
      // populate first, then send
      setInputText(text);
      setSelectedFile(file);
      handleSend(text, file, roomId);
    },
    populate: (text, file) => {
      setInputText(text);
      if (file) setSelectedFile(file);
    }
  }));

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoom?.messages]);

  const handleSend = async (text: string, overrideFile?: {name: string, type: 'image' | 'file', content: string} | null, overrideRoomId?: string) => {
    const fileToSend = overrideFile !== undefined ? overrideFile : selectedFile;
    const targetRoomId = overrideRoomId || activeRoomId;
    
    if (!text.trim() && !fileToSend) return;
    if (!targetRoomId) return;
    
    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      fileName: fileToSend?.type === 'file' ? fileToSend.name : undefined,
      fileContent: fileToSend?.type === 'file' ? fileToSend.content : undefined,
      imageUrl: fileToSend?.type === 'image' ? fileToSend.content : undefined,
      timestamp: Date.now()
    };
    
    addMessage(targetRoomId, userMessage);
    setInputText('');
    setSelectedFile(null);
    setIsSending(true);

    const botMessageId = (Date.now() + 1).toString();
    addMessage(targetRoomId, {
      id: botMessageId,
      role: 'assistant',
      content: '...',
      timestamp: Date.now()
    });

    try {
      const apiKey = localStorage.getItem('poe_api_key');
      const room = chatRooms.find(r => r.id === targetRoomId);
      const messagesPayload = (room ? room.messages : []).concat(userMessage).map(m => {
        let contentPayload: any = m.content;
        
        if (m.fileName && m.fileContent) {
           contentPayload = `[附帶文件：${m.fileName}]\n${m.fileContent}\n\n${m.content}`;
        }
        
        if (m.imageUrl) {
           contentPayload = [
             { type: "text", text: contentPayload || " " },
             { type: "image_url", image_url: { url: m.imageUrl } }
           ];
        }
        
        return {
          role: m.role,
          content: contentPayload
        };
      });
      
      const systemMessage = {
        role: 'system',
        content: '你是一位專業親切的香港英文老師，請用鼓勵性的語氣回答，必要時提供簡潔的廣東話解釋，英文詞彙難度控制在小學及初中程度。'
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          messages: [systemMessage, ...messagesPayload]
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        updateMessage(targetRoomId, botMessageId, { content: data.choices[0].message.content });
      } else {
        updateMessage(targetRoomId, botMessageId, { content: `⚠️ 錯誤: ${data.error || '無法連接到 AI'}` });
      }
    } catch (e) {
      updateMessage(targetRoomId, botMessageId, { content: '⚠️ 錯誤: 網絡連線失敗' });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const isImage = file.type.startsWith('image/');
      setSelectedFile({
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

  // RAISE Handlers
  const handleRaiseCheckbox = (section: keyof typeof raiseState, value: string) => {
    setRaiseState(prev => {
      const currentDefaults = prev[section].defaults;
      const newDefaults = currentDefaults.includes(value) 
        ? currentDefaults.filter(item => item !== value)
        : [...currentDefaults, value];
      return { ...prev, [section]: { ...prev[section], defaults: newDefaults } };
    });
  };

  const submitRaiseOptimization = async () => {
    if (!raiseTargetMsg) return;
    setIsRaiseOptimizing(true);
    
    try {
      const apiKey = localStorage.getItem('poe_api_key');
      const reframeFeatureStr = selectedStageFeature ? `我希望重新定義任務目標為：【${selectedStageFeature}】。` : '';
      const reframeItems = [...raiseState.reframe.defaults, raiseState.reframe.custom, reframeFeatureStr].filter(Boolean).join('\n- ');
      const addItems = [...raiseState.add.defaults, raiseState.add.custom].filter(Boolean).join('\n- ');
      const includeItems = [...raiseState.include.defaults, raiseState.include.custom].filter(Boolean).join('\n- ');
      const specifyItems = [...raiseState.specify.defaults, raiseState.specify.custom].filter(Boolean).join('\n- ');
      const evaluateItems = [...raiseState.evaluate.defaults, raiseState.evaluate.custom].filter(Boolean).join('\n- ');

      const systemPrompt = `你是一位專業的教育 AI 提示詞工程師。學生對 AI 先前的回應有進一步的修改或追問需求。
請根據 RAISE 框架（Reframe 重新定義目標, Add 增加清晰度, Include 包含背景信息, Specify 明確實定格式, Evaluate 評估並編輯），幫助學生重構一句「優化版追問提示詞 (Refined Prompt)」。

【AI 先前的回應摘要】：
${raiseTargetMsg.content.substring(0, 500)}...

【學生勾選的 RAISE 補強條件】：
- Reframe (重新定義): \n- ${reframeItems || '無'}
- Add (增加清晰度): \n- ${addItems || '無'}
- Include (包含背景): \n- ${includeItems || '無'}
- Specify (明確格式): \n- ${specifyItems || '無'}
- Evaluate (評估編輯): \n- ${evaluateItems || '無'}

【輸出要求】
請針對這些條件，輸出「一句」極致清晰、有禮貌、適合中小學生使用的追問句，讓學生可以直接傳送給 AI。
只需回傳這句優化後的提示詞文字，不需要任何解釋。`;

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
        setInputText(optimizedPrompt);
        setRaiseTargetMsg(null); // Close modal
      } else {
        alert("校正失敗: " + (data.error || '無法連接到 AI'));
      }
    } catch(e) {
      alert("校正失敗: 網絡連線錯誤");
    } finally {
      setIsRaiseOptimizing(false);
    }
  };

  const renderRaiseSection = (title: string, sectionKey: keyof typeof raiseState, options: string[]) => {
    return (
      <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
        <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">{title}</h3>
        {sectionKey === 'reframe' && (
          <div className="mb-2 p-3 bg-indigo-50 border-2 border-indigo-100 rounded-lg">
            <label className="text-xs font-bold text-indigo-700 block mb-2">🎯 從全站 Stage 學習功能中重新定義目標：</label>
            <select
              className="w-full p-2 rounded-md border border-indigo-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 bg-white"
              value={selectedStageFeature}
              onChange={(e) => setSelectedStageFeature(e.target.value)}
            >
              <option value="" disabled>-- 點擊選擇 Stage 學習功能 --</option>
              {STAGE_REFRAME_OPTIONS.map((group) => (
                <optgroup key={group.stage} label={group.stage}>
                  {group.items.map((item) => (
                    <option key={item} value={`${item}`}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {options.map(opt => (
            <label key={opt} className="flex items-start gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={raiseState[sectionKey].defaults.includes(opt)}
                onChange={() => handleRaiseCheckbox(sectionKey, opt)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0" 
              />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{opt}</span>
            </label>
          ))}
          <textarea
            className="mt-2 w-full p-3 bg-white border-2 border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 resize-none placeholder-slate-400"
            rows={2}
            placeholder="自訂補充說明..."
            value={raiseState[sectionKey].custom}
            onChange={(e) => setRaiseState(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], custom: e.target.value } }))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-slate-50 border-l-4 border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-3 overflow-x-auto border-b-2 border-slate-200 bg-white min-h-[64px]">
        <button
          onClick={() => createRoom(`新對話 ${chatRooms.length + 1}`)}
          className="flex-shrink-0 p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border-2 border-indigo-200 transition-colors"
          title="新建對話"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        {chatRooms.map(room => (
          <div
            key={room.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer whitespace-nowrap transition-colors flex-shrink-0 ${
              activeRoomId === room.id 
                ? 'bg-white border-indigo-400 shadow-sm text-indigo-700' 
                : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
            }`}
            onClick={() => setActiveRoomId(room.id)}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-bold text-sm max-w-[100px] truncate">{room.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteRoom(room.id);
              }}
              className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors ml-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!activeRoom ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <MessageSquare className="w-16 h-16 opacity-50" />
            <p className="font-bold">請選擇或建立新的聊天室</p>
          </div>
        ) : activeRoom.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold">從左邊發送提示詞開始練習！</p>
          </div>
        ) : (
          activeRoom.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200' 
                  : 'bg-white text-slate-800 rounded-bl-none shadow-sm border-2 border-slate-100'
              }`}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="attachment" className="max-w-full rounded-xl mb-3 border-2 border-white/20 shadow-sm" />
                )}
                {msg.fileName && (
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold bg-black/10 p-2 rounded-lg w-fit">
                    <Paperclip className="w-3 h-3" />
                    {msg.fileName}
                  </div>
                )}
                <div className={`whitespace-pre-wrap leading-relaxed font-medium ${msg.role !== 'user' && 'prose prose-slate max-w-none'}`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <>
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                      {msg.content !== '...' && (
                        <div className="mt-4 pt-3 border-t-2 border-slate-100 flex justify-end">
                          <button
                            onClick={() => {
                              setRaiseTargetMsg(msg);
                              setSelectedStageFeature('');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg transition-colors"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            🔧 校正 (RAISE)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* RAISE Modal */}
      {raiseTargetMsg && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-4 border-slate-200">
            <div className="flex items-center justify-between p-5 border-b-2 border-slate-100 bg-orange-50">
              <h2 className="text-xl font-black text-orange-800 flex items-center gap-2">
                <Wrench className="w-6 h-6" />
                AI 回應校正 (RAISE)
              </h2>
              <button 
                onClick={() => setRaiseTargetMsg(null)}
                className="p-1.5 hover:bg-orange-200 rounded-full transition-colors text-orange-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50">
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">📌 當前 AI 訊息 (節錄)</h3>
                <div className="text-sm text-slate-700 line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  {raiseTargetMsg.content}
                </div>
              </div>

              <div className="space-y-4">
                {renderRaiseSection('Reframe (重新定義目標)', 'reframe', RAISE_OPTIONS.reframe)}
                {renderRaiseSection('Add (增加清晰度)', 'add', RAISE_OPTIONS.add)}
                {renderRaiseSection('Include (包含背景信息)', 'include', RAISE_OPTIONS.include)}
                {renderRaiseSection('Specify (明確格式)', 'specify', RAISE_OPTIONS.specify)}
                {renderRaiseSection('Evaluate (評估並編輯)', 'evaluate', RAISE_OPTIONS.evaluate)}
              </div>
            </div>

            <div className="p-5 bg-white border-t-2 border-slate-100">
              <button
                onClick={submitRaiseOptimization}
                disabled={isRaiseOptimizing}
                className="w-full font-black py-4 px-6 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-3 transition-all bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
              >
                {isRaiseOptimizing ? (
                  <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                <span>{isRaiseOptimizing ? 'AI 正在分析校正條件...' : 'AI 校正 (回填至輸入框)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t-2 border-slate-200">
        <div className="flex flex-col gap-2 bg-slate-50 border-2 border-slate-200 rounded-2xl p-2 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
          {selectedFile && (
            <div className="relative w-fit mb-2 ml-2 mt-2">
              {selectedFile.type === 'image' ? (
                <img src={selectedFile.content} alt="preview" className="h-24 rounded-lg border-2 border-slate-200 shadow-sm object-cover" />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-slate-200 shadow-sm">
                  <Paperclip className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-sm text-slate-700">{selectedFile.name}</span>
                </div>
              )}
              <button 
                onClick={() => setSelectedFile(null)} 
                className="absolute -top-3 -right-3 bg-slate-800 text-white rounded-full p-1 hover:bg-slate-700 shadow-md transition-colors"
                title="移除附件"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2 w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.md,.csv,.json,.png,.jpg,.jpeg,.gif,.pdf,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0"
              title="上傳檔案 / 圖片"
              disabled={!activeRoomId || isSending}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputText);
                }
              }}
              placeholder={activeRoomId ? "輸入對話內容..." : "請先建立或選擇聊天室"}
              className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none focus:outline-none py-3 px-2 font-medium"
              rows={1}
              disabled={!activeRoomId || isSending}
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={(!inputText.trim() && !selectedFile) || !activeRoomId || isSending}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-md transition-all shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatPanel;
