import React, { useState, useMemo } from 'react';
import { 
  Newspaper, Globe, Target, Zap, 
  MessageSquareQuote, ChevronRight, TrendingUp,
  Scale, ShieldCheck, Activity, Cpu,
  Search, Filter, Clock, ExternalLink,
  BookOpen, Building2, Radio, Loader2, RefreshCw,
  FileQuestion
} from 'lucide-react';
import { fetchLatestIndustryNews } from '../services/geminiService';

interface NewsArticle {
  id: string;
  category: 'REGULATORY' | 'TECHNOLOGY' | 'MARKET';
  title: string;
  source: string;
  timestamp: string;
  summary: string;
  smeCommentary: string;
  url: string;
  priority: 'HIGH' | 'MEDIUM';
}

const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'NW-001',
    category: 'REGULATORY',
    title: 'NSTA Updates Data Disclosure Standards for Decommissioning Assets',
    source: 'NSTA Press Office',
    timestamp: '2026-01-22T08:00:00Z',
    summary: 'New guidelines mandate higher resolution metadata for legacy wellbore structures to mitigate environmental liability during plug and abandonment phases.',
    smeCommentary: 'This is a critical pivot. By forcing higher resolution metadata, the NSTA is creating the legal room for forensic audits like ours. "Migration Decay" is no longer an excuse for inaccurate reporting.',
    url: 'https://ndr.nstauthority.co.uk/',
    priority: 'HIGH'
  },
  {
    id: 'NW-002',
    category: 'TECHNOLOGY',
    title: 'Physics-Inced Neural Networks Outperform Standard Simulation in North Sea Fields',
    source: 'University of Aberdeen R&D',
    timestamp: '2026-01-20T14:30:00Z',
    summary: 'Researchers demonstrate that PINNs effectively regularize noisy historical data in the Brent field, identifying secondary recovery zones missed by commercial solvers.',
    smeCommentary: 'The academia is finally catching up to the Brahan Kernel approach. Incorporating the Arrow of Time into solvers is the only way to resolve high-entropy reservoir ghosts.',
    url: '#',
    priority: 'MEDIUM'
  },
  {
    id: 'NW-003',
    category: 'MARKET',
    title: 'BP Announces Major Digital Transformation Contract for UKCS Assets',
    source: 'EnergyVoice',
    timestamp: '2026-01-19T09:15:00Z',
    summary: 'A shift toward autonomous data harvesting is projected to save billions in operational overhead across aging North Sea platforms.',
    smeCommentary: 'Autonomous harvesting is Task 1 of our setup. Operators are hungry for data "nobody else is looking at." We are the Data Producers, not just consumers.',
    url: '#',
    priority: 'HIGH'
  }
];

const NoDataPanel = ({ title, message, icon: Icon = FileQuestion }: { title: string, message: string, icon?: any }) => (
  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-emerald-900/20 rounded-[2.5rem] p-12 text-center space-y-6 bg-emerald-500/[0.02]">
    <div className="p-5 bg-emerald-950/20 rounded-full border border-emerald-900/30 animate-pulse">
      <Icon size={48} className="text-emerald-900/40" />
    </div>
    <div className="space-y-2 max-w-xs">
      <h3 className="text-sm font-black text-emerald-800 uppercase tracking-[0.3em]">{title}</h3>
      <p className="text-[10px] font-mono text-emerald-900/60 uppercase leading-relaxed">{message}</p>
    </div>
    <div className="text-[8px] font-black text-emerald-950 uppercase tracking-widest border border-emerald-900/20 px-3 py-1 rounded">
      Status: Uplink_Empty // FEED_VOID
    </div>
  </div>
);

const NewsHub: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | NewsArticle['category']>('ALL');
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>(MOCK_NEWS);
  const [isScavenging, setIsScavenging] = useState(false);

  const filteredNews = useMemo(() => {
    return articles.filter(n => {
      const matchesFilter = filter === 'ALL' || n.category === filter;
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                           n.summary.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, articles]);

  const handleScavengeLatest = async () => {
    setIsScavenging(true);
    try {
      const latestNews = await fetchLatestIndustryNews();
      if (latestNews && latestNews.length > 0) {
        setArticles(latestNews);
      }
    } catch (err) {
      console.error("FAILED_TO_SCAVENGE_NEWS:", err);
    } finally {
      setIsScavenging(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-6 bg-slate-950/40 relative overflow-hidden font-terminal">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Radio size={400} className="text-emerald-500 animate-pulse" />
      </div>

      <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-emerald-900/30 pb-4 relative z-10 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl shadow-lg">
            <Newspaper size={24} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter">>>> INTELLIGENCE_HUB: WELLTEGRA</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-emerald-800 uppercase tracking-[0.4em] font-black">Search_Space: UKCS // Sector: AI & Digital Transformation</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleScavengeLatest}
            disabled={isScavenging}
            className={`px-6 py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isScavenging ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            <span>{isScavenging ? 'Scavenging_Abyss...' : 'Scavenge_Latest_Intel'}</span>
          </button>

          <div className="h-10 w-px bg-emerald-900/20"></div>

          <div className="relative group/search">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900" />
             <input 
               type="text" value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Filter_News..."
               className="bg-black/60 border border-emerald-900/40 rounded-lg pl-9 pr-4 py-2 text-[10px] text-emerald-100 font-mono outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-950"
             />
          </div>
          <div className="flex bg-slate-900 border border-emerald-900/30 p-1 rounded-lg">
            {['ALL', 'REGULATORY', 'TECHNOLOGY', 'MARKET'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat as any)}
                className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${filter === cat ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-emerald-800 hover:text-emerald-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 relative z-10">
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredNews.map((article) => (
              <div key={article.id} className="group bg-slate-900/60 border border-emerald-900/20 rounded-2xl flex flex-col overflow-hidden hover:border-emerald-500/40 transition-all shadow-xl">
                 <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between bg-black/40">
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${
                         article.category === 'REGULATORY' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                         article.category === 'TECHNOLOGY' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                         'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                       }`}>
                         {article.category}
                       </span>
                       <span className="text-[9px] font-black text-emerald-900 uppercase flex items-center gap-1">
                          <Clock size={10} /> {new Date(article.timestamp).toLocaleDateString()}
                       </span>
                    </div>
                    {article.priority === 'HIGH' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/40 rounded text-[7px] font-black text-red-500 uppercase animate-pulse">
                         <Zap size={10} /> Priority_High
                      </div>
                    )}
                 </div>

                 <div className="p-6 flex-1 space-y-4">
                    <h3 className="text-lg font-black text-emerald-100 uppercase tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-700">
                       <Building2 size={12} /> Source: {article.source}
                    </div>
                    <p className="text-[11px] text-emerald-100/60 font-mono leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="p-4 bg-emerald-500/5 border-l-2 border-emerald-500 rounded-r-xl space-y-2 relative overflow-hidden shadow-inner">
                       <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                          <MessageSquareQuote size={24} className="text-emerald-500" />
                       </div>
                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                          <Cpu size={12} /> SME_Forensic_Perspective
                       </span>
                       <p className="text-[10px] text-emerald-400 italic font-terminal leading-relaxed">
                          "{article.smeCommentary}"
                       </p>
                    </div>
                 </div>

                 <div className="p-4 border-t border-emerald-900/10 bg-black/20 flex items-center justify-between">
                    <span className="text-[8px] font-mono text-emerald-900">REF_ID: {article.id}</span>
                    <button className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase hover:text-emerald-300 transition-colors">
                       Open_Full_Source <ExternalLink size={12} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        ) : !isScavenging ? (
          <NoDataPanel 
            title="Intel_Feed_STANDBY" 
            message="No intelligence artifacts identified for the active search parameters. Scavenge the abyss to acquire latest regulatory and tech intel."
            icon={Newspaper}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
             <Loader2 size={64} className="text-emerald-500 animate-spin" />
             <span className="text-xl font-black uppercase tracking-[0.5em] animate-pulse">Scavenging_Digital_Abyss...</span>
          </div>
        )}
      </div>

      <footer className="p-4 border-t border-emerald-900/30 bg-slate-950/60 rounded flex items-center justify-between relative z-10">
         <div className="flex items-center space-x-6 text-[9px] font-black text-emerald-900 uppercase">
            <span className="flex items-center gap-2"><Globe size={14} /> Global_Feed: Online</span>
            <span className="flex items-center gap-2"><Activity size={14} /> Latency: 22ms</span>
         </div>
         <div className="flex items-center space-x-1 text-[8px] text-emerald-900 font-mono italic">
            [>> DATA_HUNT_PROTOCOL: ACTIVE // HARVESTING_UNSTRUCTURED_SIGNALS]
         </div>
      </footer>
    </div>
  );
};

export default NewsHub;