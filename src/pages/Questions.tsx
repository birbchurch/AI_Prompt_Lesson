import { Link } from 'react-router-dom';
import { scenarios } from '../data/scenarios';

export default function Questions() {
  const stage1Scenarios = scenarios.filter(s => s.stage === 1);
  const stage2Scenarios = scenarios.filter(s => s.stage === 2);
  const stage4Scenarios = scenarios.filter(s => s.stage === 4);

  const themeClasses = {
    indigo: {
      borderB: 'border-indigo-200',
      cardBorder: 'border-indigo-100',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
      iconBorder: 'border-indigo-300',
      linkBg: 'bg-indigo-50',
      linkBorder: 'border-indigo-200',
      linkHoverBorder: 'hover:border-indigo-400',
      linkHoverBg: 'hover:bg-indigo-100',
      titleText: 'text-indigo-900',
      titleHoverText: 'group-hover:text-indigo-700',
      descText: 'text-indigo-800',
      actionText: 'text-indigo-600',
      actionHoverText: 'group-hover:text-indigo-800',
    },
    purple: {
      borderB: 'border-purple-200',
      cardBorder: 'border-purple-100',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      iconBorder: 'border-purple-300',
      linkBg: 'bg-purple-50',
      linkBorder: 'border-purple-200',
      linkHoverBorder: 'hover:border-purple-400',
      linkHoverBg: 'hover:bg-purple-100',
      titleText: 'text-purple-900',
      titleHoverText: 'group-hover:text-purple-700',
      descText: 'text-purple-800',
      actionText: 'text-purple-600',
      actionHoverText: 'group-hover:text-purple-800',
    },
    orange: {
      borderB: 'border-orange-200',
      cardBorder: 'border-orange-100',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      iconBorder: 'border-orange-300',
      linkBg: 'bg-orange-50',
      linkBorder: 'border-orange-200',
      linkHoverBorder: 'hover:border-orange-400',
      linkHoverBg: 'hover:bg-orange-100',
      titleText: 'text-orange-900',
      titleHoverText: 'group-hover:text-orange-700',
      descText: 'text-orange-800',
      actionText: 'text-orange-600',
      actionHoverText: 'group-hover:text-orange-800',
    }
  };

  const renderScenarios = (scenariosList: typeof scenarios, stageName: string, theme: 'indigo' | 'purple' | 'orange') => {
    const classes = themeClasses[theme];
    return (
      <div className="mb-12">
        <h2 className={`text-2xl font-black text-slate-800 mb-8 pb-4 border-b-4 ${classes.borderB}`}>
          {stageName}
        </h2>
        <div className="flex flex-col gap-12">
          {scenariosList.map((scenario, index) => (
            <div key={scenario.id} className={`bg-white border-4 ${classes.cardBorder} rounded-[32px] p-6 sm:p-8 shadow-xl`}>
              <div className="flex items-center gap-4 mb-6 shrink-0">
                <div className={`${classes.iconBg} ${classes.iconText} w-12 h-12 rounded-[16px] flex items-center justify-center font-black text-2xl border-2 ${classes.iconBorder}`}>
                  {index + 1}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                  {scenario.title}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenario.questionBank.map((q) => (
                  <Link
                    key={q.id}
                    to={`/questions/${scenario.id}/${q.id}`}
                    className={`group ${classes.linkBg} border-2 ${classes.linkBorder} ${classes.linkHoverBorder} ${classes.linkHoverBg} rounded-2xl p-6 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col h-full`}
                  >
                    <h4 className={`text-xl font-bold ${classes.titleText} mb-3 ${classes.titleHoverText}`}>
                      {q.title}
                    </h4>
                    <p className={`${classes.descText} font-medium leading-relaxed flex-1`}>
                      "{q.text}"
                    </p>
                    <div className={`mt-4 flex items-center gap-2 ${classes.actionText} font-bold ${classes.actionHoverText} transition-colors`}>
                      <span>馬上練習</span>
                      <span className="text-xl">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-sky-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-sky-800 mb-4 tracking-tight">
          快速 <span className="text-blue-600">題目庫</span> 📚
        </h1>
        <p className="text-xl text-slate-600 font-medium">
          瀏覽所有的情境練習題目，點擊即可馬上開始練習！
        </p>
      </header>

      {renderScenarios(stage1Scenarios, 'Stage 1: 基礎實作', 'indigo')}
      {renderScenarios(stage2Scenarios, 'Stage 2: 詞彙與寫作強化', 'purple')}
      {stage4Scenarios.length > 0 && renderScenarios(stage4Scenarios, 'Stage 4: 媒體應用', 'orange')}
      </div>
    </div>
  );
}
