import { ScenarioConfig } from '../types';

export const STAGE_REFRAME_OPTIONS = [
  { stage: 'Stage 1', items: ['英文文法檢查與修正', '特定主題詞彙擴展', '角色扮演情境對話'] },
  { stage: 'Stage 2', items: ['詞根詞綴解構單字', '口語扮演與即時反饋'] },
  { stage: 'Stage 3', items: ['英文作文修改與優化', '長篇文章重點摘要'] },
  { stage: 'Stage 4', items: ['檔案文字中譯英', '檔案文字英譯中', '檔案圖文中文分析', '檔案圖文簡單英文分析'] }
];

export const scenarios: ScenarioConfig[] = [
  {
    id: 'grammar',
    stage: 1,
    title: '文法偵錯',
    icon: 'Search',
    description: '幫助你檢查英文文法，並解釋錯誤的地方！',
    defaultGoal: '檢查英文句子的文法錯誤，並以小學程度的廣東話解釋原因',
    defaultUser: '香港小學/初中學生，希望學習正確語法',
    defaultInstruction: 'There have some apples',
    questionBank: [
      { id: 'g1', title: '主謂一致', text: 'He go to school by bus every day.' },
      { id: 'g2', title: '過去式時態', text: 'Yesterday I go to the park with my mom.' },
      { id: 'g3', title: '介系詞錯誤', text: 'I am good in playing basketball.' }
    ],
    availableDetails: [
      { id: 'contrast', label: '列出原句錯誤與正確寫法對照', text: '列出原句錯誤與正確寫法對照' },
      { id: 'cantonese', label: '用生動的比喻或簡單廣東話解釋錯誤原因', text: '用生動的比喻或簡單廣東話解釋錯誤原因' },
      { id: 'examples', label: '額外提供 2 個相似語法的正確例句', text: '額外提供 2 個相似語法的正確例句' },
    ]
  },
  {
    id: 'vocab',
    stage: 1,
    title: '主題詞彙探索',
    icon: 'Cpu',
    description: '學習最新科技詞彙，變成科技小達人！',
    defaultGoal: '學習與特定主題相關的進階英文單字及其日常用法',
    defaultUser: '具備基礎英文水平的學生，希望擴充詞彙量',
    defaultInstruction: '隨機主題，例如科技與智能家居，隨機列出 5 個英文單字並解釋意思。',
    questionBank: [
      { id: 'v1', title: '科技與智能家居', text: '科技與智能家居 (Technology & Smart Home)' },
      { id: 'v2', title: '環境保護與愛護地球', text: '環境保護與愛護地球 (Environmental Protection)' },
      { id: 'v3', title: '我的夢想職業與未來', text: '我的夢想職業與未來 (Dream Job & Future)' }
    ],
    availableDetails: [
      { id: 'definition', label: '提供中文解釋、英文定義與詞性變化', text: '提供中文解釋、英文定義與詞性變化' },
      { id: 'examples', label: '每個單字提供 1 個貼近學生生活的生活例句', text: '每個單字提供 1 個貼近學生生活的生活例句' },
      { id: 'quiz', label: '在結尾出一條簡單的選擇題小測驗考考我', text: '在結尾出一條簡單的選擇題小測驗考考我' },
    ]
  },
  {
    id: 'dialogue',
    stage: 1,
    title: '模擬對話練習',
    icon: 'Plane',
    description: '模擬機場情境，練習開口講英文！',
    defaultGoal: '模擬真實情境進行英文角色扮演對話練習',
    defaultUser: '希望開口練習英語口語表達的學生',
    defaultInstruction: '隨機情景，例如：機場辦理登機',
    questionBank: [
      { id: 'd1', title: '機場辦理登機', text: "Good morning, I'd like to check in for my flight to London, please." },
      { id: 'd2', title: '餐廳點餐', text: "Hello, may I have the menu, please? I would like to order." },
      { id: 'd3', title: '問路求助', text: "Excuse me, could you tell me how to get to the nearest MTR station?" }
    ],
    availableDetails: [
      { id: 'length', label: '對話長度控制在 8-10 輪以內', text: '對話長度控制在 8-10 輪以內' },
      { id: 'polite', label: '語氣禮貌自然，適合 CEFR A1-A2 詞彙難度', text: '語氣禮貌自然，適合 CEFR A1-A2 詞彙難度' },
      { id: 'translate', label: '在每句對話下方加上簡單的廣東話翻譯與發音小貼士', text: '在每句對話下方加上簡單的廣東話翻譯與發音小貼士' },
    ]
  },
  {
    id: 'roots',
    stage: 2,
    title: '進階詞彙探索',
    icon: 'BookOpen',
    description: '透過詞根與詞綴，快速認識與擴大英語詞彙量。',
    defaultGoal: '透過單字結構（詞根、前綴、後綴）快速認識與擴大英語詞彙量',
    defaultUser: '香港小學至初中學生，希望不用死記硬背聰明記單字',
    defaultInstruction: '隨機列出 5 個英文單字並解釋意思。',
    questionBank: [
      { id: 'r1', title: '詞根探索', text: "請幫我探索詞根 'port' (攜帶)，列出 5 個包含這個詞根的單字與意思。" },
      { id: 'r2', title: '前綴探索', text: "請幫我探索前綴 'un-' (不/反向)，列出 3 個改變單字相反意思的例子。" },
      { id: 'r3', title: '詞綴挑戰', text: "請幫我探索詞根 'tele-' (遠距離)，列出 5 個相關英文單字並解釋意思。" }
    ],
    availableDetails: [
      { id: 'formula', label: '列明單字拆解積木公式', text: '列明「單字拆解積木公式」（例如：ex + port = export 出口）' },
      { id: 'example_sentence', label: '提供中英詞意與一個簡單生活例句', text: '提供中英詞意與一個簡單生活例句' },
      { id: 'flashcard', label: '把內容排版成單字記憶卡格式', text: '請把內容排版成「單字記憶卡」格式方便我複習' },
    ]
  },
  {
    id: 'roleplay',
    stage: 2,
    title: '進階角色扮演與口語反饋',
    icon: 'Mic',
    description: '進行情境對話練習，獲取語法與發音即時評估。',
    defaultGoal: '進行情境即興對話練習，並在對話結束後獲取語法與發音上的即時評估',
    defaultUser: '希望開口練習英語口語、不用擔心出錯的香港學生',
    defaultInstruction: '隨機扮演角色與我對話。',
    questionBank: [
      { id: 'rp1', title: '咖啡店點餐', text: "請扮演咖啡店員，我扮演客人。我說完選擇後，請用簡單英文問我接下來的選擇（例如: 'Anything else?'）。" },
      { id: 'rp2', title: '機場地勤對話', text: "請扮演機場櫃檯人員，與我練習辦理登機 hand-in 行李的對話。" },
      { id: 'rp3', title: '評估與反饋', text: "我們這段對話結束了。請幫我評估剛剛對話中的語法和用詞，告訴我有沒有更地道的說法。" }
    ],
    availableDetails: [
      { id: 'short_q', label: '每次對話只問一個短問題，引導我接話', text: '每次對話只問一個短問題，引導我接話，句子適合 CEFR A1-A2 程度' },
      { id: 'pinyin_tips', label: '結尾附上中文翻譯與發音小提示', text: '結尾附上中文翻譯與簡單發音/重音小提示' },
      { id: 'gentle_correction', label: '有語法錯誤時溫柔指正', text: '如果我有語法錯誤，請溫柔地在句子下方指正' },
    ]
  },
  {
    id: 'writing',
    stage: 2,
    title: '長文摘要',
    icon: 'PenTool',
    description: '評估短文給予建議，或幫忙提取長文要點。',
    defaultGoal: '評估英文短文並提供修改建議，或幫忙提取長篇英文文章的要點',
    defaultUser: '正在學習英文寫作與長篇閱讀的學生',
    defaultInstruction: '<請隨機生成英文文章>，之後，用中文總結以下這篇長文章，並列出 3 個最重要的英文論點，並在每個論點後加一個簡單例子',
    questionBank: [
      { id: 'w1', title: '寫作修改', text: "請幫我修改這篇關於「我最喜歡的科目 (My Favorite Subject)」的英文短文，找出文法與拼寫錯誤。" },
      { id: 'w2', title: '結構與地道性', text: "請評估我的作文，在流暢度、用詞地道性與文章結構上給我 3 個具體建議。" },
      { id: 'w3', title: '文章摘要', text: "請總結以下這篇長文章，列出 3 個最重要的論點，並在每個論點後加一個簡單例子。" }
    ],
    availableDetails: [
      { id: 'diff_list', label: '用改前 vs. 改後對照清單列出', text: '寫作修改請用「改前 vs. 改後」對照清單列出' },
      { id: 'explain_better', label: '用簡單廣東話解釋改動', text: '用簡單廣東話解釋為什麼「改動後會寫得更好」' },
      { id: 'short_summary', label: '摘要嚴格控制100字內並點列', text: '摘要內容嚴格控制在 100 字以內，用點列 (Bullet points) 呈現' },
    ]
  },
  {
    id: 'media',
    stage: 4,
    title: '媒體應用',
    icon: 'Image',
    description: '上傳圖片或檔案，讓 AI 幫你翻譯或分析內容！',
    defaultGoal: '從上傳的圖片或檔案中提取文字、翻譯內容或進行分析總結',
    defaultUser: '香港中小學生，希望透過 AI 輔助理解圖片或文件內容',
    defaultInstruction: '從檔案/圖片提取文字與內容，並精確翻譯成英文。',
    questionBank: [
      { id: 'm1', title: '檔案文字中譯英', text: '請從上傳的檔案/圖片中提取所有的文字內容，並將它們精確翻譯成流暢的英文。' },
      { id: 'm2', title: '檔案文字英譯中', text: '請從上傳的檔案/圖片中提取所有的文字內容，並將它們準確翻譯成通順的中文。' },
      { id: 'm3', title: '中文圖文分析', text: '請仔細閱讀並分析附帶檔案/圖片的內容，然後用小學/初中生容易明白的中文，總結重點並回答問題。' },
      { id: 'm4', title: '簡單英文分析', text: '請分析附帶檔案/圖片的內容，用最簡單的英文 (CEFR A1-A2 程度) 回答，句子要短並附帶重點列表。' }
    ],
    availableDetails: [
      { id: 'point_form', label: '以點列式 (Bullet points) 呈現結果', text: '以點列式 (Bullet points) 呈現結果，方便閱讀' },
      { id: 'cantonese', label: '若有生字，提供廣東話解釋與拼音', text: '若結果中包含較難的生字，請提供廣東話解釋與簡單拼音' },
      { id: 'step_by_step', label: '一步一步分析，不要一次給出全部資訊', text: '一步一步分析，先給出大意，再深入細節' },
    ]
  }
];
