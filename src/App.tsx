import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Search,
  Info,
  Globe, 
  ShieldCheck, 
  CircleDollarSign, 
  History,
  Activity,
  Zap,
  Leaf,
  Bell,
  Newspaper,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ELECTIONS, MOCK_ECONOMICS, MOCK_UPDATES, LANGUAGES, ElectionData, EconomicMetric, VerifiedUpdate, TRANSLATIONS } from './constants';
import { cn, formatCurrency } from './lib/utils';
import { translateText, generateInsights, generateSentimentAnalysis, generateStockNews } from './services/gemini';

// --- Types ---
type AppMode = 'normal' | 'data-centric';

// --- Components ---

const TranslationWrapper = ({ lang, children, text }: { lang: string, children: React.ReactNode, text?: string }) => {
  const [translated, setTranslated] = useState<string | null>(null);

  useEffect(() => {
    if (lang === 'English' || !text) {
      setTranslated(null);
      return;
    }
    const fetch = async () => {
      const res = await translateText(text, lang);
      setTranslated(res);
    };
    fetch();
  }, [lang, text]);

  if (translated) {
    if (typeof children === 'string' || !children) return <>{translated}</>;
    // If children is a React element, we try to clone it with translated text if it's a simple P/SPAN
    return <>{React.cloneElement(children as React.ReactElement, {}, translated)}</>;
  }
  return <>{children}</>;
};

const TooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black border border-white/20 rounded-lg text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
      </div>
    </div>
  );
};

const InsightSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3 bg-gold/20 rounded-full animate-pulse" />
          <div className="h-2 bg-white/10 rounded w-1/4 animate-pulse" />
        </div>
        <div className="h-2 bg-white/5 rounded w-full animate-pulse" />
        <div className="h-2 bg-white/5 rounded w-[90%] animate-pulse" />
      </div>
    ))}
  </div>
);

const PriceAlertSystem = ({ economics, lang }: { economics: EconomicMetric[], lang: string }) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const [threshold, setThreshold] = useState(5);
  const alerts = economics.filter(e => Math.abs(e.change) >= threshold);

  return (
    <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Bell className="w-12 h-12 text-rose-500" />
      </div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500" />
          <h3 className="text-[10px] font-black uppercase text-rose-500 tracking-widest">{t('volatilityGuard')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/20 uppercase font-bold">{t('threshold')}:</span>
          <select 
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] text-white outline-none"
          >
            <option value={1}>1%</option>
            <option value={3}>3%</option>
            <option value={5}>5%</option>
            <option value={10}>10%</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {alerts.length > 0 ? alerts.map(a => (
          <div key={a.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 animate-in slide-in-from-right duration-300">
            <div>
              <p className="text-xs font-bold text-white uppercase">{a.itemName}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-widest">{a.category}</p>
            </div>
            <div className="text-right">
              <p className={cn("text-sm font-mono font-bold", a.change > 0 ? "text-rose-400" : "text-emerald-400")}>
                {a.change > 0 ? '▲' : '▼'} {Math.abs(a.change)}%
              </p>
              <p className="text-[8px] text-white/20 uppercase mt-0.5">{t('criticalDrift')}</p>
            </div>
          </div>
        )) : (
          <p className="text-[10px] text-white/20 italic text-center py-4 uppercase tracking-widest">{t('noAnomalies')}</p>
        )}
      </div>
    </div>
  );
};

const StockNewsFeed = ({ stockName, lang }: { stockName: string, lang: string }) => {
  const [news, setNews] = useState<{title: string, summary: string, date: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const res = await generateStockNews(stockName, lang);
      setNews(res);
      setLoading(false);
    };
    fetchNews();
  }, [stockName, lang]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 animate-pulse space-y-2">
            <div className="h-2 bg-white/10 w-3/4 rounded" />
            <div className="h-2 bg-white/5 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Newspaper className="w-3 h-3 text-gold" />
        <h4 className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">Asset-Specific Intelligence</h4>
      </div>
      <AnimatePresence mode="wait">
        <motion.div 
          key={stockName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {news.map((item, idx) => (
            <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-gold/5 transition-all group cursor-default">
              <p className="text-[10px] font-bold text-white mb-2 leading-tight group-hover:text-gold transition-colors">{item.title}</p>
              <p className="text-[9px] text-white/40 leading-relaxed mb-2 font-serif italic">{item.summary}</p>
              <span className="text-[8px] text-gold/40 uppercase font-black">{item.date}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }: { status: 'official' | 'preliminary' | 'projected' }) => {
  const colors = {
    official: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    preliminary: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    projected: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  };
  const icons = {
    official: <ShieldCheck className="w-3 h-3" />,
    preliminary: <Activity className="w-3 h-3" />,
    projected: <Zap className="w-3 h-3" />
  };
  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", colors[status])}>
      {icons[status]}
      {status}
    </div>
  );
};

const ElectionSentiment = ({ electionTitle, lang }: { electionTitle: string, lang: string }) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const [data, setData] = useState<{sentimentMood: string, score: number, summary: string, keyTopics: string[]} | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      setData(null);
      const res = await generateSentimentAnalysis(electionTitle, lang);
      setData(res);
    };
    fetchSentiment();
  }, [electionTitle, lang]);

  if (!data) return (
    <div className="p-8 bg-white/5 rounded-3xl animate-pulse space-y-4">
      <div className="h-2 bg-white/10 w-1/4 rounded" />
      <div className="h-2 bg-white/5 w-full rounded" />
      <div className="h-2 bg-white/5 w-3/4 rounded" />
    </div>
  );

  return (
    <div className="p-8 bg-surface-muted rounded-[2.5rem] border border-white/5 group hover:border-gold/20 transition-all shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg">
            <MessageSquare className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">{t('sentimentPulse')}</h3>
            <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Cross-Platform Media Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Confidence Score</span>
            <span className="text-2xl font-serif text-gold italic">{data.score}%</span>
          </div>
          <div className={cn("px-4 py-2 text-[10px] font-black uppercase rounded-xl border", 
            data.sentimentMood === 'Positive' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
            data.sentimentMood === 'Negative' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
            "bg-white/10 text-white/60 border-white/20"
          )}>
            {data.sentimentMood}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
            <p className="text-sm text-white/70 leading-relaxed font-serif italic mb-8 pl-4">
              {data.summary}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20 underline decoration-white/10 underline-offset-4">Top Public Discourse Nodes</h4>
            <div className="flex flex-wrap gap-2">
              {data.keyTopics.map((topic, i) => (
                <TooltipWrapper key={i} text={`Deep analysis identifies "${topic}" as a high-velocity topic in this specific media cycle.`}>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-gold/60 uppercase tracking-widest font-black hover:bg-gold/10 hover:text-gold transition-colors cursor-default">
                    {topic}
                  </span>
                </TooltipWrapper>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
           <div>
              <h5 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3" /> Sentiment Trend
              </h5>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.score}%` }}
                  className="h-full bg-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                />
              </div>
           </div>

           <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-white/60 leading-relaxed italic font-serif">
                "Media coverage reveals a significant focus on institutional stability rather than ideological shifts, suggesting a defensive posture in capital markets."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ mode, setMode, lang, setLang }: { 
  mode: AppMode; 
  setMode: (m: AppMode) => void;
  lang: string;
  setLang: (l: string) => void;
}) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-surface-muted border-b border-border z-50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center text-black font-bold text-xl transition-transform group-hover:scale-110">Σ</div>
          <h1 className="text-xl font-serif tracking-tight text-white">POLITY<span className="text-gold">CORE</span></h1>
        </div>
        
        <div className="hidden md:flex ml-8 border-l border-border pl-8 gap-4">
          <button 
            onClick={() => setMode('data-centric')}
            className={cn(
              "px-3 py-1 text-[10px] uppercase tracking-widest transition-all border",
              mode === 'data-centric' ? "border-gold text-gold" : "border-transparent text-white/40 hover:text-white"
            )}
          >
            {t('dataCentric')}
          </button>
          <button 
            onClick={() => setMode('normal')}
            className={cn(
              "px-3 py-1 text-[10px] uppercase tracking-widest transition-all border",
              mode === 'normal' ? "border-gold text-gold" : "border-transparent text-white/40 hover:text-white"
            )}
          >
            {t('simplifiedView')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-tighter text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full mr-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('verified')}
        </div>

        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-light text-white/60 hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
            <span className="uppercase tracking-widest">{lang.substring(0, 2)}</span>
          </button>
          <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            {LANGUAGES.map((l) => (
              <button 
                key={l.code}
                onClick={() => setLang(l.code)}
                className="w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-gold-muted hover:text-gold transition-colors text-white/60"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const VerifiedUpdates = ({ lang }: { lang: string }) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  return (
    <div id="verification-logs" className="bg-surface border border-white/5 rounded-2xl p-6 scroll-mt-24">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40">{t('hourlyVerifications')}</h3>
      </div>
      <div className="space-y-6">
        <TranslationWrapper lang={lang}>
          {MOCK_UPDATES.map((u) => (
            <div key={u.id} className="relative pl-6 pb-6 border-l border-white/10 last:pb-0">
              <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div>
                <p className="text-xs text-white/80 leading-relaxed font-medium mb-2">{u.content}</p>
                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-white/30">
                  <span>{u.source}</span>
                  <span>{new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </TranslationWrapper>
      </div>
    </div>
  );
};

const EconomicSummary = ({ mode, lang }: { mode: AppMode, lang: string }) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const [searchTerm, setSearchTerm] = useState('');
  const stocks = MOCK_ECONOMICS.filter(e => e.category === 'stock');
  const goods = MOCK_ECONOMICS.filter(e => e.category === 'good');

  const filteredStocks = stocks.filter(s => 
    s.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedStockNews, setSelectedStockNews] = useState<string | null>(stocks[0].itemName);

  return (
    <div id="economic-indicators" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 scroll-mt-24">
      <div className="bg-surface p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-gold" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{t('equitySentiment')}</h2>
              <TooltipWrapper text="Real-time tracking of major indices and institutional stock moves.">
                <Info className="w-3 h-3 text-white/20 cursor-help" />
              </TooltipWrapper>
            </div>
            <p className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded tracking-tighter">{t('bullish')}</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-gold transition-colors" />
            <input 
              type="text"
              placeholder={t('searchAssets')}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[10px] text-white uppercase tracking-widest placeholder:text-white/20 focus:border-gold/50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
            {filteredStocks.length > 0 ? filteredStocks.map((s) => (
              <button 
                key={s.id} 
                onClick={() => setSelectedStockNews(s.itemName)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all border",
                  selectedStockNews === s.itemName ? "bg-gold/10 border-gold/40 shadow-[0_0_15px_rgba(197,160,89,0.1)]" : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                )}
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-white tracking-tight">{s.itemName}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Ticker: {s.itemName.split(' ')[0]}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-white">{s.price.toLocaleString()}</p>
                  <p className={cn("text-[10px] font-bold font-mono mt-1", s.trend === 'up' ? "text-emerald-400" : "text-rose-400")}>
                    {s.trend === 'up' ? '+' : ''}{s.change}%
                  </p>
                </div>
              </button>
            )) : (
              <div className="text-center py-12">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black italic">{t('noAssets')}</p>
              </div>
            )}
          </div>

          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
            {selectedStockNews ? (
              <StockNewsFeed stockName={selectedStockNews} lang={lang} />
            ) : (
              <div className="h-full flex items-center justify-center">
                 <p className="text-[10px] text-white/20 uppercase tracking-widest italic">{t('selectAsset')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <PriceAlertSystem economics={MOCK_ECONOMICS} lang={lang} />
        
        <div className="bg-surface p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CircleDollarSign className="w-5 h-5 text-gold" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">{t('commodityIndex')}</h2>
            </div>
            <Activity className="w-4 h-4 text-white/20" />
          </div>

          <div className="space-y-4">
            {goods.slice(0, 7).map((g) => (
              <div key={g.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                <div>
                  <p className="text-sm font-bold text-white tracking-tight">{g.itemName}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{t('consumerBasket')}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-white">{formatCurrency(g.price)}</p>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1 px-1.5 py-0.5 rounded inline-block", 
                    g.trend === 'up' ? "bg-rose-500/10 text-rose-400" : 
                    g.trend === 'down' ? "bg-emerald-500/10 text-emerald-400" : 
                    "bg-white/5 text-white/40"
                  )}>
                    {g.trend === 'up' ? 'Increase ↑' : g.trend === 'down' ? 'Decrease ↓' : 'Stable'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ElectionDashboard = ({ mode, lang }: { mode: AppMode; lang: string }) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedElections, setSelectedElections] = useState<ElectionData[]>([MOCK_ELECTIONS[0]]);
  const [insights, setInsights] = useState<{ insights: string[], lang: string } | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const years = Array.from(new Set(MOCK_ELECTIONS.map(e => e.year))).sort((a, b) => b - a);

  const filteredElections = selectedYear === 'ALL' 
    ? MOCK_ELECTIONS 
    : MOCK_ELECTIONS.filter(e => e.year === selectedYear);

  const toggleSelection = (e: ElectionData) => {
    if (compareMode) {
      if (selectedElections.find(sel => sel.id === e.id)) {
        if (selectedElections.length > 1) {
          setSelectedElections(selectedElections.filter(sel => sel.id !== e.id));
        }
      } else {
        if (selectedElections.length < 3) {
          setSelectedElections([...selectedElections, e]);
        }
      }
    } else {
      setSelectedElections([e]);
    }
  };

  useEffect(() => {
    if (filteredElections.length > 0 && !filteredElections.find(e => e.id === (selectedElections[0]?.id || ''))) {
      setSelectedElections([filteredElections[0]]);
    }
  }, [selectedYear, filteredElections, selectedElections]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!selectedElections[0]) return;
      setInsights(null);
      const res = await generateInsights(JSON.stringify(selectedElections[0]), lang);
      setInsights(res);
    };
    fetchInsights();
  }, [selectedElections, lang]);

  return (
    <div id="election-cycles" className="space-y-12 scroll-mt-24">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{t('yearFilter')}:</span>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedYear('ALL')}
                className={cn(
                  "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all",
                  selectedYear === 'ALL' ? "bg-white/20 border-white/20 text-white" : "border-white/5 text-white/30 hover:border-white/20"
                )}
              >
                ALL
              </button>
              {years.map(y => (
                <button 
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all",
                    selectedYear === y ? "bg-white/20 border-white/20 text-white" : "border-white/5 text-white/30 hover:border-white/20"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{t('comparisonMode')}:</span>
             <button 
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) setSelectedElections([selectedElections[0]]);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                compareMode ? "bg-gold text-black border-gold" : "bg-white/5 text-white/40 border-white/10"
              )}
             >
                {compareMode ? `${t('active')} (MAX 3)` : t('inactive')}
             </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {filteredElections.map((e) => (
            <button 
              key={e.id}
              onClick={() => toggleSelection(e)}
              className={cn(
                "px-4 py-2 text-[10px] uppercase font-black tracking-widest border transition-all flex items-center gap-3",
                selectedElections.find(sel => sel.id === e.id) ? "bg-gold text-black border-gold shadow-[0_0_20px_rgba(197,160,89,0.2)]" : "bg-white/5 text-white/40 border-white/10 hover:border-gold/30 hover:text-white"
              )}
            >
              {e.title}
              <StatusBadge status={e.status} />
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {compareMode && selectedElections.length > 1 ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="bg-surface-muted p-12 border border-white/5 rounded-[3.5rem] shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] pointer-events-none" />
               
               <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 relative z-10">
                  <div>
                    <h3 className="text-4xl font-serif text-white italic tracking-tight underline border-white/20">{t('comparativeMetrics')}</h3>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mt-4">{t('sideBySide')}</p>
                  </div>
                  <div className="flex gap-4">
                     {selectedElections.map((e, i) => (
                        <div key={e.id} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? '#C5A059' : i === 1 ? '#4ade80' : '#fb7185' }} />
                           <span className="text-[10px] font-bold text-white uppercase tracking-widest">{e.year}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                  <div className="lg:col-span-8">
                    <div className="h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={selectedElections.map(e => {
                            const dataObj: any = { year: String(e.year) };
                            e.results.forEach(r => {
                              dataObj[r.party] = r.seats;
                            });
                            return dataObj;
                          })}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          />
                          {Array.from(new Set(selectedElections.flatMap(e => e.results.map(r => r.party)))).map((party, i) => (
                            <Bar 
                              key={party} 
                              dataKey={party} 
                              stackId="a" 
                              fill={i === 0 ? '#C5A059' : i === 1 ? '#4ade80' : i === 2 ? '#fb7185' : '#818cf8'} 
                              radius={0}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold mb-6 italic">{t('correlationDelta')}</h4>
                      <div className="space-y-6">
                        {selectedElections[0].results.slice(0, 3).map((r, i) => {
                          const delta = r.seats - (selectedElections[1]?.results?.[i]?.seats || 0);
                          return (
                            <div key={r.party} className="flex justify-between items-center border-b border-white/10 pb-4 last:border-0 last:pb-0">
                               <div>
                                 <p className="text-xs font-bold text-white uppercase">{r.party}</p>
                                 <p className="text-[9px] text-white/30 uppercase tracking-widest">{t('comparativeSwing')}</p>
                               </div>
                               <span className={cn("text-lg font-mono font-bold", delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-white/20")}>
                                 {delta > 0 ? '+' : ''}{delta}
                               </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-gold/10 p-6 rounded-2xl border border-gold/20">
                       <p className="text-[10px] text-gold uppercase font-black tracking-widest mb-2 flex items-center gap-2 underline">
                         <Zap className="w-3 h-3" /> {t('comparisonInsight')}
                       </p>
                       <p className="text-[11px] text-gold/80 leading-relaxed italic font-serif">
                         The shift in mandate between these cycles indicates a significant migration of urban vote banks toward {selectedElections[0].results[0].party}, correlating with the 12% rise in equity sentiment observed in Q2.
                       </p>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <ElectionSentiment electionTitle={selectedElections[0].title} lang={lang} />
               <ElectionSentiment electionTitle={selectedElections[1].title} lang={lang} />
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
            {selectedElections.map((e, index) => (
              <div key={e.id} className="space-y-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface-muted p-12 border border-white/5 rounded-[3rem] shadow-black/50 shadow-2xl relative overflow-hidden"
                >
                  {/* ... contents as before ... */}
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-4xl font-serif text-white italic tracking-tight">{e.title}</h3>
                        <StatusBadge status={e.status} />
                      </div>
                      <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-black flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Historical Verification Confirmed: {e.year}
                      </p>
                    </div>
                    <TooltipWrapper text="Defines the geographic reach of the electoral results data.">
                      <div className="bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-gold/20 flex items-center gap-2">
                        {e.type} Scope
                        <Info className="w-3 h-3 opacity-50" />
                      </div>
                    </TooltipWrapper>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                    <div className="lg:col-span-8">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={e.results}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="party" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                            <Tooltip 
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                              contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                            />
                            <Bar dataKey="seats" fill="#C5A059" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="lg:col-span-4 bg-white/5 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-3xl group-hover:bg-gold/10 transition-all" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold mb-8 italic flex items-center gap-2">
                        Strategic Insights
                        <TooltipWrapper text="AI-generated correlations and market impact assessments based on election results.">
                          <Info className="w-3 h-3 text-white/20" />
                        </TooltipWrapper>
                      </h4>
                      <div className="space-y-6">
                        {index === 0 ? (
                          !insights ? (
                            <InsightSkeleton />
                          ) : (
                            insights.insights.map((insight, idx) => (
                              <motion.p 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="text-xs text-white/60 leading-relaxed font-serif italic border-l border-gold/40 pl-4 hover:text-white transition-colors"
                              >
                                <TranslationWrapper lang={lang} text={insight}>
                                  {insight}
                                </TranslationWrapper>
                              </motion.p>
                            ))
                          )
                        ) : (
                          <p className="text-[10px] text-white/40 italic">Briefing available for primary document only.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                   <ElectionSentiment electionTitle={e.title} lang={lang} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NewsFeed = ({ updates, lang }: { updates: VerifiedUpdate[], lang: string }) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/60">{t('liveIntelligence')}</h3>
        <span className="text-[9px] text-white/20 uppercase">{t('realTimeVerification')}</span>
      </div>
      {updates.map((u) => (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={u.id} 
          className="p-5 bg-white/5 border border-white/5 rounded-xl hover:border-gold/20 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{t('verifiedFlow')}</span>
            <span className="text-[9px] text-white/20 ml-auto">{new Date(u.timestamp).toLocaleTimeString()}</span>
          </div>
          <TranslationWrapper lang={lang} text={u.content}>
            <p className="text-xs text-white/80 leading-relaxed font-medium group-hover:text-white transition-colors capitalize">
              {u.content}
            </p>
          </TranslationWrapper>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 italic">{u.source}</span>
            <div className="px-2 py-0.5 bg-gold/5 rounded border border-gold/10 text-[8px] font-black text-gold">{t('secureData')}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const SimplifiedView = ({ elections, economics, updates, lang }: { 
  elections: ElectionData[]; 
  economics: EconomicMetric[]; 
  updates: VerifiedUpdate[];
  lang: string;
}) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const [activeTab, setActiveTab] = useState<'elections' | 'prices'>('elections');
  
  return (
    <div id="economic-indicators" className="space-y-12 animate-in fade-in duration-700 scroll-mt-24">
      <PriceAlertSystem economics={MOCK_ECONOMICS} lang={lang} />
      <div id="election-cycles" className="grid grid-cols-1 md:grid-cols-12 gap-8 scroll-mt-24">
        <div className="md:col-span-8 space-y-8">
          <div className="flex gap-4 p-1 bg-white/5 w-fit rounded-lg border border-white/10">
            <button 
              onClick={() => setActiveTab('elections')}
              className={cn("px-6 py-2 text-[10px] uppercase font-black tracking-widest transition-all rounded-md", activeTab === 'elections' ? "bg-gold text-black" : "text-white/40 hover:text-white")}
            >
              {t('electionBasics')}
            </button>
            <button 
              onClick={() => setActiveTab('prices')}
              className={cn("px-6 py-2 text-[10px] uppercase font-black tracking-widest transition-all rounded-md", activeTab === 'prices' ? "bg-gold text-black" : "text-white/40 hover:text-white")}
            >
              {t('essentialPricing')}
            </button>
          </div>

          {activeTab === 'elections' ? (
            <div className="space-y-6">
              {elections.slice(0, 3).map(e => (
                <div key={e.id} className="bg-surface-muted p-8 border border-white/5 rounded-[2rem] hover:border-gold/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-serif text-white italic">{e.title}</h3>
                      <StatusBadge status={e.status} />
                    </div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">{e.year}</span>
                  </div>
                  <TranslationWrapper lang={lang} text={e.summary}>
                    <p className="text-xs text-white/40 leading-relaxed max-w-2xl mb-8 border-l-2 border-gold/20 pl-4">{e.summary}</p>
                  </TranslationWrapper>
                  <div className="flex gap-12">
                    {e.results.slice(0, 2).map((r, i) => (
                      <div key={r.party}>
                        <p className="text-[9px] uppercase tracking-widest text-white/20 mb-1">{r.party} Seats</p>
                        <p className="text-3xl font-serif text-white">{r.seats}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {economics.filter(i => i.category === 'good').map(g => (
                <TooltipWrapper key={g.id} text={`Current average market price for ${g.itemName}. Updated hourly via PolityCore nodes.`}>
                  <div className="p-6 bg-surface-muted border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/5 transition-all cursor-help w-full">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-gold transition-colors">{g.itemName}</h4>
                      <p className="text-[9px] uppercase tracking-widest text-white/30">Target: All Consumers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-white">{formatCurrency(g.price)}</p>
                      <p className={cn("text-[10px] font-bold uppercase mt-1", g.trend === 'up' ? "text-rose-400" : g.trend === 'down' ? "text-emerald-400" : "text-white/20")}>
                        {g.trend === 'up' ? t('priceRise') : g.trend === 'down' ? t('costDrop') : t('unchanged')}
                      </p>
                    </div>
                  </div>
                </TooltipWrapper>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-4">
          <div className="bg-surface p-8 border border-white/5 rounded-3xl sticky top-24">
             <NewsFeed updates={updates} lang={lang} />
             <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                <ShieldCheck className="w-8 h-8 text-gold/40 mx-auto mb-4" />
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2 font-bold italic">{t('officialVerification')}</p>
                <TranslationWrapper lang={lang}>
                  <p className="text-[11px] text-white/60 leading-relaxed italic">All data aggregated in this simplified view is audited hourly against 1,400+ primary sources.</p>
                </TranslationWrapper>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ElectionArchive = ({ lang }: { lang: string }) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const [yearFilter, setYearFilter] = useState<number | 'ALL'>('ALL');
  const [stateFilter, setStateFilter] = useState<string | 'ALL'>('ALL');

  const years = Array.from(new Set(MOCK_ELECTIONS.map(e => e.year))).sort((a, b) => b - a);
  const states = Array.from(new Set(MOCK_ELECTIONS.map(e => e.state))).sort();

  const filtered = MOCK_ELECTIONS.filter(e => 
    (yearFilter === 'ALL' || e.year === yearFilter) &&
    (stateFilter === 'ALL' || e.state === stateFilter)
  );

  return (
    <section className="bg-surface p-12 rounded-[3.5rem] border border-white/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div>
           <h2 className="text-3xl font-serif text-white italic tracking-tight">{t('electoralRegistry')}</h2>
           <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mt-2 italic">{t('historicalArchive')}</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] text-white uppercase tracking-widest outline-none transition-all focus:border-gold/50"
           >
              <option value="ALL">{t('allYears')}</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
           </select>
           <select 
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] text-white uppercase tracking-widest outline-none transition-all focus:border-gold/50"
           >
              <option value="ALL">{t('allStates')}</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((e) => (
          <motion.div 
            layout
            key={e.id} 
            className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-gold/20 transition-all group"
          >
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                   <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">{e.year} Cycle</span>
                   <StatusBadge status={e.status} />
                </div>
                <span className="text-[9px] text-white/20 font-mono italic">ID: {e.id.split('-')[0]}</span>
             </div>
             <h4 className="text-xl font-serif text-white italic mb-2 group-hover:text-gold transition-colors">{e.title}</h4>
             <p className="text-[10px] text-white/30 uppercase tracking-widest mb-6">{e.state} · {e.type}</p>
             <div className="flex gap-8 border-t border-white/5 pt-6">
               <div>
                  <p className="text-[8px] text-white/20 uppercase mb-1">{t('totalSeats')}</p>
                  <p className="text-lg font-serif text-white">{e.results.reduce((acc, curr) => acc + curr.seats, 0)}</p>
               </div>
               <div>
                  <p className="text-[8px] text-white/20 uppercase mb-1">{t('leadParty')}</p>
                  <p className="text-lg font-serif text-gold">{e.results[0].party}</p>
               </div>
             </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const DataCentricView = ({ elections, economics, updates, lang }: { 
  elections: ElectionData[]; 
  economics: EconomicMetric[]; 
  updates: VerifiedUpdate[];
  lang: string;
}) => {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const scatterData = economics.filter(e => e.category === 'good').map(g => ({
    x: g.price,
    y: Math.abs(g.change),
    z: g.itemName.length * 5,
    name: g.itemName,
    change: g.change
  }));

  return (
    <div className="space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4">
       <div id="economic-indicators" className="scroll-mt-24">
         <PriceAlertSystem economics={economics} lang={lang} />
       </div>
       <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-9">
            <ElectionDashboard mode="data-centric" lang={lang} />
          </div>
          <div className="col-span-12 lg:col-span-3 space-y-8">
            <div className="bg-surface p-8 border border-white/5 rounded-3xl h-full">
               <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-12 italic">{t('impactIndicators')}</h3>
               <div className="space-y-10">
                  {economics.slice(0, 6).map((e, idx) => (
                    <TooltipWrapper key={e.id} text={`Institutional tracker for ${e.itemName}. 24h Change: ${e.change}%.`}>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group cursor-help"
                      >
                        <div className="flex justify-between items-end mb-3">
                           <span className="text-[10px] uppercase font-bold text-white tracking-widest group-hover:text-gold transition-colors">{e.itemName}</span>
                           <span className="text-[9px] text-white/30 font-mono italic">#{e.id.split('-')[0]}</span>
                        </div>
                        <div className="flex items-end justify-between border-b border-white/5 pb-4 group-hover:border-gold/30 transition-all">
                          <span className="text-xl font-serif text-white">{e.category === 'good' ? formatCurrency(e.price) : e.price.toLocaleString()}</span>
                          <span className={cn("text-[10px] font-mono font-bold", e.trend === 'up' ? "text-emerald-400" : "text-rose-400")}>
                            {e.trend === 'up' ? '▲' : '▼'} {e.change}%
                          </span>
                        </div>
                      </motion.div>
                    </TooltipWrapper>
                  ))}
               </div>

               <div className="mt-16 relative aspect-square overflow-hidden rounded-2xl border border-white/5">
                  <div className="absolute inset-0 bg-gold/5 flex items-center justify-center p-8 text-center">
                    <div>
                      <Activity className="w-8 h-8 text-gold mx-auto mb-4 opacity-50" />
                      <p className="text-[10px] text-white uppercase tracking-[0.2em] font-black italic">{t('liveCorrelation')}</p>
                      <TranslationWrapper lang={lang}>
                         <p className="text-[9px] text-white/40 leading-relaxed mt-4">Current election cycle shows 84.3% correlation with local FMCG pricing shifts across tier-1 cities.</p>
                      </TranslationWrapper>
                    </div>
                  </div>
               </div>
            </div>
          </div>
       </div>

       <section className="bg-surface-muted p-12 rounded-[3.5rem] border border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-serif text-white italic tracking-tight underline decoration-gold/30 underline-offset-8">{t('commodityVolatility')}</h2>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mt-4">{t('priceVsChange')}</p>
            </div>
            <div className="px-4 py-1 border border-white/10 text-[9px] text-white/40 uppercase tracking-[0.2em]">{t('auditedReport')}</div>
          </div>
          
          <div className="h-[500px] w-full bg-black/40 p-8 rounded-[2rem] border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="price" 
                  unit="₹" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="abs_change" 
                  unit="%" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', color: '#fff' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: any, name: any, props: any) => {
                    if (name === 'price') return [`₹${value}`, 'Price'];
                    if (name === 'abs_change') return [`${props.payload.change}%`, 'Actual Change'];
                    return [value, name];
                  }}
                />
                <Scatter name="Commodities" data={scatterData} fill="#C5A059">
                   {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.change > 0 ? '#fb7185' : '#4ade80'} fillOpacity={0.6} />
                   ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            {economics.filter(e => e.category === 'good').slice(0, 4).map((g, i) => (
              <div key={g.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/60 uppercase">{g.itemName}</span>
                <span className={cn("text-[10px] font-mono font-bold", g.change > 0 ? "text-rose-400" : "text-emerald-400")}>{g.change}%</span>
              </div>
            ))}
          </div>
       </section>

       <ElectionArchive lang={lang} />
    </div>
  );
};

export default function App() {
  const [mode, setMode] = useState<AppMode>('normal');
  const [lang, setLang] = useState('English');
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['English'][key] || key;
  const [translatedHeader, setTranslatedHeader] = useState('Executive Polity Monitor.');
  const [translatedSub, setTranslatedSub] = useState('Transforming complex electoral data into strategic market insights through hourly verification.');

  useEffect(() => {
    const fetchTranslations = async () => {
      if (lang === 'English') {
        setTranslatedHeader('Executive Polity Monitor.');
        setTranslatedSub('Transforming complex electoral data into strategic market insights through hourly verification.');
        return;
      }
      const h = await translateText('Executive Polity Monitor.', lang);
      const s = await translateText('Transforming complex electoral data into strategic market insights through hourly verification.', lang);
      setTranslatedHeader(h);
      setTranslatedSub(s);
    };
    fetchTranslations();
  }, [lang]);

  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen bg-background pt-24 pb-20 px-8">
        <Navbar mode={mode} setMode={setMode} lang={lang} setLang={setLang} />
        
        <main className="max-w-[1440px] mx-auto grid grid-cols-1 my-12">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold">{t('exclusiveAccess')}</span>
                 <div className="h-px bg-white/10 w-12" />
              </div>
              <motion.h1 
                key={lang + 'h'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-serif text-white italic leading-[1.1] tracking-tight"
              >
                {translatedHeader.split(' ').map((w, i) => i === 1 ? <span key={i} className="text-gold pr-3">{w}</span> : w + ' ')}
              </motion.h1>
              <motion.p 
                key={lang + 's'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/40 max-w-xl font-medium uppercase tracking-widest leading-relaxed"
              >
                {translatedSub}
              </motion.p>
            </div>
            
            <div className="flex gap-12 pb-2">
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{t('marketVolatility')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif text-emerald-400">{t('stable')}</span>
                  <span className="text-xs opacity-40 font-mono tracking-tighter italic">{t('marketIndex')}: 14.2</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{t('verifiedNodes')}</p>
                <p className="text-2xl font-serif text-white italic">1.4k {t('activeNodes')}</p>
              </div>
            </div>
          </header>

          {mode === 'normal' ? (
            <SimplifiedView 
              elections={MOCK_ELECTIONS} 
              economics={MOCK_ECONOMICS} 
              updates={MOCK_UPDATES} 
              lang={lang}
            />
          ) : (
            <DataCentricView 
              elections={MOCK_ELECTIONS} 
              economics={MOCK_ECONOMICS} 
              updates={MOCK_UPDATES} 
              lang={lang}
            />
          )}
        </main>

        <footer className="mt-32 pt-16 border-t border-white/5 max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-6 space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center text-black font-bold text-xl">Σ</div>
                <h1 className="text-xl font-serif tracking-tight text-white uppercase italic">Polity<span className="text-gold">Core</span></h1>
              </div>
              <p className="text-sm text-white/40 max-w-sm leading-relaxed font-serif italic">
                "{t('mission')}"
              </p>
            </div>
            
            <div className="md:col-span-3">
              <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-8">{t('navigation')}</h5>
              <ul className="space-y-4 text-xs text-white/30 font-medium uppercase tracking-widest">
                <li className="hover:text-gold cursor-pointer transition-colors">
                  <a href="#election-cycles">{t('electionCycles')}</a>
                </li>
                <li className="hover:text-gold cursor-pointer transition-colors">
                  <a href="#economic-indicators">{t('economicIndicators')}</a>
                </li>
                <li className="hover:text-gold cursor-pointer transition-colors">
                  <a href="#verification-logs">{t('verificationLogs')}</a>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-3">
              <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-8">{t('access')}</h5>
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-[10px] text-white/40 leading-relaxed mb-4 italic">{t('subscribeBriefing')}</p>
                  <input 
                    type="email" 
                    placeholder={t('emailPlaceholder')} 
                    className="w-full bg-black border border-white/10 px-3 py-2 text-[10px] text-white placeholder:text-white/20 uppercase tracking-widest focus:border-gold outline-none transition-colors"
                  />
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pb-12">
             <p>© 2026 PolityCore Intelligence. {t('allRights')}.</p>
             <div className="flex gap-8">
               <a href="#" className="hover:text-gold transition-colors">{t('privacy')}</a>
               <a href="#" className="hover:text-gold transition-colors">{t('terms')}</a>
               <a href="#" className="text-gold font-black">{t('systemStatus')}</a>
             </div>
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
}
