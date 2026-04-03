import { useState, useRef, useEffect } from "react";
import {
  Zap, LayoutDashboard, Settings, Bell, Search, Plus, MoreHorizontal,
  X, Target, Users, CalendarDays, Link2, FileText, AlertCircle, CheckCircle2,
  Clock, Layers, BookOpen, ArrowUpRight, Filter, SortAsc, Image, MessageSquare,
  Paperclip, Flag, DollarSign, BarChart3, Play, Check, Hash, Edit3, Trash2,
  Archive, ExternalLink, Copy, ChevronRight, ChevronLeft, List, Kanban,
  AlertTriangle, CircleCheck, RefreshCw, ArrowRight, Inbox, Moon, Palette,
  Globe, Tag, UserPlus, LayoutList, BadgeCheck, TrendingUp, Sparkles, Move,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Stage = "briefing" | "criacao" | "revisao" | "aprovado" | "no-ar" | "pausado" | "encerrado";
type Priority = "high" | "medium" | "low";
type SideView = "dashboard" | "kanban" | "list" | "settings";
type DetailTab = "briefing" | "nomenclatura" | "utms" | "checklist" | "criativos";

interface TeamMember { id: string; name: string; initials: string; color: string; }
interface Briefing {
  objetivo: string; publico: string; proposta: string; tom: string;
  referencias: string; criativos: string;
}
interface Campaign {
  id: string; title: string; product: string; objective: string; campaignType: string;
  period: string; budget: string; stage: Stage; priority: Priority;
  dueDate: string; responsible: TeamMember[]; tags: string[];
  campaignName: string; adSetName: string; adName: string;
  briefingFilled: boolean; briefingData?: Briefing;
  checklistState: Record<string, boolean>;
  comments: number; attachments: number;
  createdAt: string;
}
interface FilterState { stage: string; product: string; priority: string; responsible: string; }
interface Notification { id: string; type: "info" | "success" | "warning"; title: string; message: string; time: string; read: boolean; }

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TEAM: Record<string, TeamMember> = {
  marina: { id: "marina", name: "Marina Costa", initials: "MC", color: "bg-violet-500" },
  pedro:  { id: "pedro",  name: "Pedro Alves",  initials: "PA", color: "bg-sky-500" },
  joana:  { id: "joana",  name: "Joana Reis",   initials: "JR", color: "bg-emerald-500" },
  thiago: { id: "thiago", name: "Thiago Lima",  initials: "TL", color: "bg-amber-500" },
};
const ALL_MEMBERS = Object.values(TEAM);

const STAGES: { id: Stage; label: string; dot: string; bg: string; color: string }[] = [
  { id: "briefing",  label: "Briefing",    dot: "bg-slate-400",   bg: "bg-slate-400/10",   color: "text-slate-400"   },
  { id: "criacao",   label: "Em Criação",  dot: "bg-blue-400",    bg: "bg-blue-400/10",    color: "text-blue-400"    },
  { id: "revisao",   label: "Em Revisão",  dot: "bg-amber-400",   bg: "bg-amber-400/10",   color: "text-amber-400"   },
  { id: "aprovado",  label: "Aprovado",    dot: "bg-violet-400",  bg: "bg-violet-400/10",  color: "text-violet-400"  },
  { id: "no-ar",     label: "No Ar",       dot: "bg-emerald-400", bg: "bg-emerald-400/10", color: "text-emerald-400" },
  { id: "pausado",   label: "Pausado",     dot: "bg-orange-400",  bg: "bg-orange-400/10",  color: "text-orange-400"  },
  { id: "encerrado", label: "Encerrado",   dot: "bg-zinc-500",    bg: "bg-zinc-500/10",    color: "text-zinc-500"    },
];

const PRODUCTS = ["Aceleraí", "Aceleraí Pro", "Mentoria Elite", "Imersão Intensiva"];
const OBJECTIVES = ["Captação de Leads", "Conversão", "Retenção", "Reengajamento", "Awareness"];
const CAMPAIGN_TYPES = ["Black Friday", "Lançamento", "Evergreen", "Liquidação", "Novembro Negro", "Oferta Relâmpago"];
const PERIODS = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "Mai 2026", "Jun 2026", "Jul 2026", "Ago 2026", "Set 2026", "Out 2026", "Nov 2026"];
const AUDIENCES_MAP: Record<string, string> = {
  "cold-look": "COLD-LOOKALIKE-1%", "cold-int": "COLD-INTERESSE", "warm-pag": "WARM-VISITANTES",
  "warm-eng": "WARM-ENGAJADOS-30D", "hot-leads": "HOT-LEADS", "hot-aban": "HOT-ABANDONO", "ret-video": "RET-VIDEO-75%",
};
const AUDIENCES = [
  { value: "cold-look", label: "Cold – Lookalike 1%" }, { value: "cold-int", label: "Cold – Interesse Amplo" },
  { value: "warm-pag", label: "Warm – Visitantes Página" }, { value: "warm-eng", label: "Warm – Engajados 30d" },
  { value: "hot-leads", label: "Hot – Leads Não Comprados" }, { value: "hot-aban", label: "Hot – Abandono de Carrinho" },
  { value: "ret-video", label: "Retargeting – Vídeo 75%" },
];
const FORMATS_MAP: Record<string, string> = {
  "vid-30": "VIDEO-30S", "vid-15": "VIDEO-15S", "carr": "CARROSSEL", "img": "IMAGEM-UNICA", "stories": "STORIES", "reels": "REELS",
};
const FORMATS = [
  { value: "vid-30", label: "Vídeo 30s" }, { value: "vid-15", label: "Vídeo 15s" },
  { value: "carr", label: "Carrossel" }, { value: "img", label: "Imagem Única" },
  { value: "stories", label: "Stories" }, { value: "reels", label: "Reels" },
];
const CHECKLIST_ITEMS = [
  { id: "c1", label: "Nome da campanha gerado e copiado" },
  { id: "c2", label: "Nome do conjunto de anúncios copiado" },
  { id: "c3", label: "Nome do anúncio copiado" },
  { id: "c4", label: "URL Parameters configurados no Meta Ads" },
  { id: "c5", label: "URL com UTM testada e verificada no GA4" },
  { id: "c6", label: "Pixel disparando corretamente na LP" },
  { id: "c7", label: "Landing page revisada e sem erros" },
  { id: "c8", label: "Orçamento definido e revisado" },
  { id: "c9", label: "Data e horário de início corretos" },
  { id: "c10", label: "Revisão final antes de publicar" },
];

function slugify(v: string) { return v.toUpperCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""); }
function genNames(product: string, objective: string, campaignType: string, period: string, audience: string, format: string) {
  const p = slugify(product), o = slugify(objective), c = slugify(campaignType), pe = period.toUpperCase().replace(" ", "-");
  const a = AUDIENCES_MAP[audience] || slugify(audience), f = FORMATS_MAP[format] || slugify(format);
  return {
    campaignName: `${p}_${o}_${c}_${pe}`,
    adSetName: `${p}_${o}_${c}_${pe}_${a}`,
    adName: `${p}_${o}_${c}_${pe}_${a}_${f}`,
  };
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id:"c1", title:"Black Friday – Captação", product:"Aceleraí", objective:"Captação de Leads", campaignType:"Black Friday", period:"Q4 2026", budget:"R$ 12.000", stage:"no-ar", priority:"high", dueDate:"Nov 29", responsible:[TEAM.marina,TEAM.pedro], tags:["bf2026","captacao"], campaignName:"ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026", adSetName:"ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026_COLD-LOOKALIKE-1%", adName:"ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026_COLD-LOOKALIKE-1%_VIDEO-30S", briefingFilled:true, briefingData:{ objetivo:"Captar leads qualificados com CPL abaixo de R$ 18.", publico:"Empreendedores de 28–45 anos que tentaram escalar e não conseguiram.", proposta:"Sistema completo para escalar vendas online.", tom:"Direto, empático e orientado a resultado.", referencias:"VSL Q2 (conv. 3,2%). Estrutura: problema → agitação → solução.", criativos:"3 vídeos (30s, 15s, Stories), 2 carrosséis, 4 imagens." }, checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true,c7:true,c8:true,c9:true}, comments:8, attachments:4, createdAt:"Hoje, 14:22" },
  { id:"c2", title:"Lançamento Mentoria Elite", product:"Mentoria Elite", objective:"Conversão", campaignType:"Lançamento", period:"Q3 2026", budget:"R$ 8.500", stage:"aprovado", priority:"high", dueDate:"Out 15", responsible:[TEAM.joana], tags:["lancamento","mentoria"], campaignName:"MENTORIA-ELITE_CONVERSAO_LANCAMENTO_Q3-2026", adSetName:"MENTORIA-ELITE_CONVERSAO_LANCAMENTO_Q3-2026_WARM-ENGAJADOS-30D", adName:"MENTORIA-ELITE_CONVERSAO_LANCAMENTO_Q3-2026_WARM-ENGAJADOS-30D_CARROSSEL", briefingFilled:true, briefingData:{ objetivo:"Converter leads quentes da lista de espera.", publico:"Leads que assistiram ao webinar e não compraram nos últimos 90 dias.", proposta:"Mentoria 1:1 com especialistas que já escalaram mais de R$ 10M.", tom:"Exclusivo, urgente, resultado comprovado.", referencias:"Email de abertura gerou 42% de abertura. Usar prova social.", criativos:"2 depoimentos em vídeo, 3 imagens com screenshot de resultados." }, checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true,c7:true,c8:true,c9:true,c10:true}, comments:12, attachments:7, createdAt:"Ontem, 10:05" },
  { id:"c3", title:"Evergreen Pro – Conversão", product:"Aceleraí Pro", objective:"Conversão", campaignType:"Evergreen", period:"Q2 2026", budget:"R$ 5.000", stage:"revisao", priority:"medium", dueDate:"Set 30", responsible:[TEAM.thiago,TEAM.marina], tags:["evergreen","pro"], campaignName:"ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026", adSetName:"ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026_HOT-LEADS", adName:"ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026_HOT-LEADS_VIDEO-15S", briefingFilled:true, briefingData:{ objetivo:"Converter leads mornos da base via retargeting contínuo.", publico:"Leads que baixaram material gratuito mas não compraram.", proposta:"Módulo avançado para quem já tem resultado e quer multiplicar.", tom:"Consultivo, especialista, sem hype.", referencias:"Anúncio 'Você já tem os leads' — CTR 4.2%. Replicar abordagem.", criativos:"1 vídeo 15s, 2 imagens estáticas, 1 carrossel de prova social." }, checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true}, comments:5, attachments:2, createdAt:"2 dias atrás" },
  { id:"c4", title:"Reengajamento Novembro", product:"Aceleraí", objective:"Reengajamento", campaignType:"Novembro Negro", period:"Q4 2026", budget:"R$ 3.200", stage:"criacao", priority:"medium", dueDate:"Nov 10", responsible:[TEAM.pedro], tags:["reengajamento"], campaignName:"ACELERAI_REENGAJAMENTO_NOVEMBRO-NEGRO_Q4-2026", adSetName:"ACELERAI_REENGAJAMENTO_NOVEMBRO-NEGRO_Q4-2026_HOT-ABANDONO", adName:"ACELERAI_REENGAJAMENTO_NOVEMBRO-NEGRO_Q4-2026_HOT-ABANDONO_STORIES", briefingFilled:true, briefingData:{ objetivo:"Reativar base de leads inativos há mais de 60 dias.", publico:"Leads que pararam de abrir emails e não interagem há 60+ dias.", proposta:"Oferta exclusiva de reativação com desconto de 30%.", tom:"Pessoal, direto, senso de urgência real.", referencias:"Nada aprovado ainda. Testar nova abordagem.", criativos:"3 variações de Stories, 2 imagens de oferta." }, checklistState:{}, comments:3, attachments:1, createdAt:"3 dias atrás" },
  { id:"c5", title:"Oferta Relâmpago Imersão", product:"Imersão Intensiva", objective:"Conversão", campaignType:"Oferta Relâmpago", period:"Q3 2026", budget:"R$ 2.000", stage:"briefing", priority:"low", dueDate:"Set 20", responsible:[TEAM.joana,TEAM.thiago], tags:["oferta","imersao"], campaignName:"", adSetName:"", adName:"", briefingFilled:false, checklistState:{}, comments:1, attachments:0, createdAt:"4 dias atrás" },
  { id:"c6", title:"Awareness Aceleraí Q3", product:"Aceleraí", objective:"Awareness", campaignType:"Evergreen", period:"Q3 2026", budget:"R$ 4.000", stage:"pausado", priority:"low", dueDate:"Ago 31", responsible:[TEAM.marina], tags:["awareness"], campaignName:"ACELERAI_AWARENESS_EVERGREEN_Q3-2026", adSetName:"ACELERAI_AWARENESS_EVERGREEN_Q3-2026_COLD-INTERESSE", adName:"ACELERAI_AWARENESS_EVERGREEN_Q3-2026_COLD-INTERESSE_REELS", briefingFilled:true, briefingData:{ objetivo:"Aumentar reconhecimento de marca com público frio.", publico:"Empreendedores 25–50 anos interessados em marketing digital.", proposta:"A plataforma que organiza o caos do marketing digital.", tom:"Educativo, inspirador, sem pressão de venda.", referencias:"Conteúdo orgânico de maior alcance: 'Erros comuns de tráfego pago'.", criativos:"Série de Reels educativos (5 vídeos 30–60s)." }, checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true,c7:true}, comments:2, attachments:3, createdAt:"5 dias atrás" },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id:"n1", type:"warning", title:"Checklist incompleto", message:"'Black Friday – Captação' está No Ar com 1 item pendente.", time:"há 10 min", read:false },
  { id:"n2", type:"success", title:"Campanha aprovada", message:"'Lançamento Mentoria Elite' foi aprovada por Joana Reis.", time:"há 1h", read:false },
  { id:"n3", type:"info", title:"Nova campanha criada", message:"Pedro Alves criou 'Reengajamento Novembro'.", time:"há 3h", read:true },
  { id:"n4", type:"warning", title:"Briefing pendente", message:"'Oferta Relâmpago Imersão' aguarda preenchimento do briefing.", time:"há 4h", read:true },
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Av({ m, size="sm" }: { m: TeamMember; size?: "sm"|"md"|"lg" }) {
  const s = size==="lg" ? "h-9 w-9 text-xs" : size==="md" ? "h-7 w-7 text-[11px]" : "h-6 w-6 text-[10px]";
  return <div className={`${s} ${m.color} flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-[#0F1117]`}>{m.initials}</div>;
}

function StagePill({ stage }: { stage: Stage }) {
  const s = STAGES.find(st => st.id === stage)!;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.bg} ${s.color}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>{s.label}</span>;
}

function PriorityIcon({ p }: { p: Priority }) {
  const c = p==="high" ? "text-red-400" : p==="medium" ? "text-amber-400" : "text-slate-500";
  return <Flag className={`h-3.5 w-3.5 ${c}`}/>;
}

function CopyBtn({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value).catch(()=>{}); setOk(true); setTimeout(()=>setOk(false),2000); }}
      className="shrink-0 rounded-lg p-1.5 text-white/25 hover:bg-[#6B7CFF]/15 hover:text-[#8B9DFF] transition-all">
      {ok ? <Check className="h-3.5 w-3.5 text-emerald-400"/> : <Copy className="h-3.5 w-3.5"/>}
    </button>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#0A0C13]/60 px-3 py-2.5 group hover:border-[#6B7CFF]/25 transition-all">
        <span className="flex-1 font-mono text-xs text-white/65 break-all leading-relaxed">{value || <span className="italic text-white/20">Não gerado</span>}</span>
        {value && <CopyBtn value={value}/>}
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange, placeholder }: { label: string; options: string[]; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="h-10 rounded-xl border border-white/[0.08] bg-[#0F1117] px-3 text-sm text-white/80 outline-none focus:border-[#6B7CFF]/50 transition-all appearance-none cursor-pointer">
        <option value="" disabled>{placeholder || `Selecione ${label.toLowerCase()}`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, value, onChange, rows=3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
        className="rounded-xl border border-white/[0.08] bg-[#0F1117] px-3 py-2.5 text-sm text-white/80 outline-none focus:border-[#6B7CFF]/50 transition-all resize-none placeholder:text-white/20"
        placeholder={`Digite ${label.toLowerCase()}...`}/>
    </div>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
function Modal({ onClose, children, wide=false }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative z-10 flex flex-col rounded-2xl border border-white/[0.10] bg-[#0F1117] shadow-2xl shadow-black/50 ${wide ? "w-[760px] max-h-[88vh]" : "w-[480px] max-h-[88vh]"} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}

// ─── NEW CAMPAIGN WIZARD ───────────────────────────────────────────────────────
interface WizardData {
  product: string; objective: string; campaignType: string; period: string; budget: string;
  priority: Priority; dueDate: string; responsible: string[];
  briefingObjetivo: string; briefingPublico: string; briefingProposta: string;
  briefingTom: string; briefingRefs: string; briefingCriativos: string;
  audience: string; format: string;
}

const WIZARD_STEPS = ["Campanha","Equipe","Briefing","Nomenclatura","Revisão"];

function NewCampaignModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Campaign) => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    product:"", objective:"", campaignType:"", period:"", budget:"",
    priority:"medium", dueDate:"", responsible:[],
    briefingObjetivo:"", briefingPublico:"", briefingProposta:"",
    briefingTom:"", briefingRefs:"", briefingCriativos:"",
    audience:"", format:"",
  });

  const upd = (k: keyof WizardData) => (v: string) => setData(p => ({...p, [k]: v}));
  const names = data.product && data.objective && data.campaignType && data.period && data.audience && data.format
    ? genNames(data.product, data.objective, data.campaignType, data.period, data.audience, data.format)
    : null;

  const canNext = [
    data.product && data.objective && data.campaignType && data.period && data.budget,
    data.responsible.length > 0 && data.dueDate,
    data.briefingObjetivo && data.briefingPublico,
    data.audience && data.format,
    true,
  ][step];

  const toggleResponsible = (id: string) => setData(p => ({...p, responsible: p.responsible.includes(id) ? p.responsible.filter(r=>r!==id) : [...p.responsible, id]}));

  const handleCreate = () => {
    const n = names || { campaignName:"", adSetName:"", adName:"" };
    const camp: Campaign = {
      id: `c${Date.now()}`, title: `${data.product} – ${data.campaignType}`,
      product: data.product, objective: data.objective, campaignType: data.campaignType,
      period: data.period, budget: data.budget, stage: "briefing",
      priority: data.priority, dueDate: data.dueDate,
      responsible: data.responsible.map(id => TEAM[id]),
      tags: [data.product.toLowerCase().replace(/\s/g,"-"), data.campaignType.toLowerCase().replace(/\s/g,"-")],
      campaignName: n.campaignName, adSetName: n.adSetName, adName: n.adName,
      briefingFilled: !!(data.briefingObjetivo && data.briefingPublico),
      briefingData: { objetivo:data.briefingObjetivo, publico:data.briefingPublico, proposta:data.briefingProposta, tom:data.briefingTom, referencias:data.briefingRefs, criativos:data.briefingCriativos },
      checklistState: {}, comments: 0, attachments: 0, createdAt: "Agora",
    };
    onSave(camp);
    onClose();
  };

  return (
    <Modal onClose={onClose} wide>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
        <div>
          <h2 className="text-base font-bold text-white">Nova Campanha</h2>
          <p className="text-xs text-white/35 mt-0.5">Passo {step+1} de {WIZARD_STEPS.length} — {WIZARD_STEPS[step]}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60 transition-all"><X className="h-4 w-4"/></button>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] px-6 py-3">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-0">
            <button onClick={() => i < step && setStep(i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i===step ? "bg-[#6B7CFF]/15 text-[#8B9DFF]" : i<step ? "text-white/40 hover:text-white/60" : "text-white/20"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i===step ? "bg-[#6B7CFF] text-white" : i<step ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.07] text-white/25"}`}>
                {i<step ? <Check className="h-2.5 w-2.5"/> : i+1}
              </span>
              {s}
            </button>
            {i < WIZARD_STEPS.length-1 && <ChevronRight className="h-3.5 w-3.5 text-white/15 mx-0.5"/>}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* STEP 0 – Campanha */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Produto" options={PRODUCTS} value={data.product} onChange={upd("product")}/>
            <SelectField label="Objetivo" options={OBJECTIVES} value={data.objective} onChange={upd("objective")}/>
            <SelectField label="Tipo de Campanha" options={CAMPAIGN_TYPES} value={data.campaignType} onChange={upd("campaignType")}/>
            <SelectField label="Período" options={PERIODS} value={data.period} onChange={upd("period")}/>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Budget</label>
              <input value={data.budget} onChange={e => upd("budget")(e.target.value)} placeholder="Ex: R$ 5.000"
                className="h-10 rounded-xl border border-white/[0.08] bg-[#0F1117] px-3 text-sm text-white/80 outline-none focus:border-[#6B7CFF]/50 transition-all placeholder:text-white/20"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Prazo</label>
              <input value={data.dueDate} onChange={e => upd("dueDate")(e.target.value)} placeholder="Ex: Nov 29"
                className="h-10 rounded-xl border border-white/[0.08] bg-[#0F1117] px-3 text-sm text-white/80 outline-none focus:border-[#6B7CFF]/50 transition-all placeholder:text-white/20"/>
            </div>
          </div>
        )}

        {/* STEP 1 – Equipe */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Responsáveis</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_MEMBERS.map(m => (
                  <button key={m.id} onClick={() => toggleResponsible(m.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${data.responsible.includes(m.id) ? "border-[#6B7CFF]/40 bg-[#6B7CFF]/10" : "border-white/[0.07] hover:border-white/[0.14]"}`}>
                    <Av m={m} size="md"/>
                    <span className="text-sm text-white/75 font-medium">{m.name}</span>
                    {data.responsible.includes(m.id) && <Check className="ml-auto h-4 w-4 text-[#6B7CFF]"/>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Prioridade</label>
              <div className="flex gap-2">
                {(["high","medium","low"] as Priority[]).map(p => {
                  const lbl = p==="high" ? "Alta" : p==="medium" ? "Média" : "Baixa";
                  const col = p==="high" ? "border-red-500/40 bg-red-500/10 text-red-400" : p==="medium" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-slate-500/40 bg-slate-500/10 text-slate-400";
                  return <button key={p} onClick={() => setData(d=>({...d,priority:p}))}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all ${data.priority===p ? col : "border-white/[0.07] text-white/35 hover:border-white/[0.14]"}`}>
                    <Flag className="h-3.5 w-3.5"/>{lbl}
                  </button>;
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 – Briefing */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><TextareaField label="Objetivo da Campanha" value={data.briefingObjetivo} onChange={upd("briefingObjetivo")} rows={2}/></div>
            <div className="col-span-2"><TextareaField label="Público-alvo" value={data.briefingPublico} onChange={upd("briefingPublico")} rows={2}/></div>
            <TextareaField label="Proposta de Valor" value={data.briefingProposta} onChange={upd("briefingProposta")} rows={2}/>
            <TextareaField label="Tom de Voz" value={data.briefingTom} onChange={upd("briefingTom")} rows={2}/>
            <TextareaField label="Referências de Copy" value={data.briefingRefs} onChange={upd("briefingRefs")} rows={2}/>
            <TextareaField label="Criativos Necessários" value={data.briefingCriativos} onChange={upd("briefingCriativos")} rows={2}/>
          </div>
        )}

        {/* STEP 3 – Nomenclatura */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Público" options={AUDIENCES.map(a=>a.label)} value={AUDIENCES.find(a=>a.value===data.audience)?.label||""} onChange={v => { const f = AUDIENCES.find(a=>a.label===v); if(f) setData(d=>({...d,audience:f.value})); }}/>
              <SelectField label="Formato do Anúncio" options={FORMATS.map(f=>f.label)} value={FORMATS.find(f=>f.value===data.format)?.label||""} onChange={v => { const f = FORMATS.find(f=>f.label===v); if(f) setData(d=>({...d,format:f.value})); }}/>
            </div>
            {names ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0"/>
                  <p className="text-xs text-emerald-400/80 font-medium">Nomenclatura gerada automaticamente com base nas suas seleções.</p>
                </div>
                {[{label:"Nome da Campanha",v:names.campaignName,dot:"bg-[#6B7CFF]"},{label:"Nome do Conjunto",v:names.adSetName,dot:"bg-violet-400"},{label:"Nome do Anúncio",v:names.adName,dot:"bg-emerald-400"}].map(r => (
                  <div key={r.label} className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4">
                    <div className="flex items-center gap-2 mb-3"><span className={`h-2 w-2 rounded-full ${r.dot}`}/><span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{r.label}</span></div>
                    <CopyRow label="" value={r.v}/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <Hash className="h-8 w-8 text-white/15"/>
                <p className="text-sm text-white/40">Selecione o público e o formato para gerar a nomenclatura.</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 – Revisão */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                {label:"Produto",v:data.product},{label:"Objetivo",v:data.objective},
                {label:"Campanha",v:data.campaignType},{label:"Período",v:data.period},
                {label:"Budget",v:data.budget},{label:"Prazo",v:data.dueDate},
              ].map(f => (
                <div key={f.label} className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
                  <p className="text-[10px] text-white/25 mb-0.5">{f.label}</p>
                  <p className="text-sm font-medium text-white/75">{f.v || <span className="italic text-white/25">—</span>}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
              <p className="text-[10px] text-white/25 mb-2">Responsáveis</p>
              <div className="flex gap-2">
                {data.responsible.map(id => <div key={id} className="flex items-center gap-1.5"><Av m={TEAM[id]} size="md"/><span className="text-xs text-white/65">{TEAM[id].name}</span></div>)}
              </div>
            </div>
            {names && (
              <div className="rounded-xl border border-[#6B7CFF]/20 bg-[#6B7CFF]/5 p-3 flex flex-col gap-2">
                <p className="text-[10px] text-[#6B7CFF]/70 font-semibold uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="h-3 w-3"/> Nomenclatura Gerada</p>
                <p className="font-mono text-xs text-white/55 break-all">{names.campaignName}</p>
              </div>
            )}
            {data.briefingObjetivo && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
                <p className="text-[10px] text-white/25 mb-1">Objetivo do Briefing</p>
                <p className="text-xs text-white/60 leading-relaxed">{data.briefingObjetivo}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-4">
        <button onClick={() => step>0 ? setStep(s=>s-1) : onClose()}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
          <ChevronLeft className="h-4 w-4"/>{step===0 ? "Cancelar" : "Voltar"}
        </button>
        {step < WIZARD_STEPS.length-1 ? (
          <button disabled={!canNext} onClick={() => setStep(s=>s+1)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6B7CFF]/20 hover:opacity-90 transition-all disabled:opacity-30">
            Próximo<ChevronRight className="h-4 w-4"/>
          </button>
        ) : (
          <button onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6B7CFF]/20 hover:opacity-90 transition-all">
            <Zap className="h-4 w-4"/> Criar Campanha
          </button>
        )}
      </div>
    </Modal>
  );
}

// ─── EDIT BRIEFING MODAL ───────────────────────────────────────────────────────
function EditBriefingModal({ campaign, onClose, onSave }: { campaign: Campaign; onClose: () => void; onSave: (b: Briefing) => void }) {
  const [b, setB] = useState<Briefing>(campaign.briefingData || {objetivo:"",publico:"",proposta:"",tom:"",referencias:"",criativos:""});
  const upd = (k: keyof Briefing) => (v: string) => setB(p=>({...p,[k]:v}));
  return (
    <Modal onClose={onClose} wide>
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
        <div>
          <h2 className="text-base font-bold text-white">Editar Briefing</h2>
          <p className="text-xs text-white/35 mt-0.5">{campaign.title}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/60 transition-all"><X className="h-4 w-4"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4">
        <div className="col-span-2"><TextareaField label="Objetivo da Campanha" value={b.objetivo} onChange={upd("objetivo")} rows={2}/></div>
        <div className="col-span-2"><TextareaField label="Público-alvo" value={b.publico} onChange={upd("publico")} rows={2}/></div>
        <TextareaField label="Proposta de Valor" value={b.proposta} onChange={upd("proposta")} rows={3}/>
        <TextareaField label="Tom de Voz" value={b.tom} onChange={upd("tom")} rows={3}/>
        <TextareaField label="Referências de Copy" value={b.referencias} onChange={upd("referencias")} rows={3}/>
        <TextareaField label="Criativos Necessários" value={b.criativos} onChange={upd("criativos")} rows={3}/>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] px-6 py-4">
        <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/40 hover:border-white/[0.14] transition-all">Cancelar</button>
        <button onClick={() => { onSave(b); onClose(); }} className="rounded-xl bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all">
          <Check className="inline h-3.5 w-3.5 mr-1.5"/>Salvar Briefing
        </button>
      </div>
    </Modal>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, danger=false, confirmLabel, onClose, onConfirm }: { title: string; message: string; danger?: boolean; confirmLabel: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start gap-4 p-6">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-red-500/10" : "bg-amber-500/10"}`}>
          {danger ? <AlertTriangle className="h-5 w-5 text-red-400"/> : <AlertCircle className="h-5 w-5 text-amber-400"/>}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/50 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] px-6 py-4">
        <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/40 hover:border-white/[0.14] transition-all">Cancelar</button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all ${danger ? "bg-red-500 hover:bg-red-400" : "bg-amber-500 hover:bg-amber-400"}`}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── NOTIFICATIONS PANEL ─────────────────────────────────────────────────────
function NotificationsPanel({ items, onClose, onMarkAll }: { items: Notification[]; onClose: () => void; onMarkAll: () => void }) {
  const typeMap = { success: { icon: CircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" }, warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" }, info: { icon: Bell, color: "text-blue-400", bg: "bg-blue-500/10" } };
  return (
    <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-white/[0.10] bg-[#0F1117] shadow-2xl shadow-black/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <span className="text-sm font-bold text-white">Notificações</span>
        <div className="flex items-center gap-1">
          <button onClick={onMarkAll} className="rounded-lg px-2 py-1 text-[11px] text-white/35 hover:text-white/60 hover:bg-white/5 transition-all">Marcar todas lidas</button>
          <button onClick={onClose} className="rounded-lg p-1 text-white/25 hover:text-white/50 hover:bg-white/5 transition-all"><X className="h-3.5 w-3.5"/></button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {items.map(n => {
          const T = typeMap[n.type];
          return (
            <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.03] transition-all ${!n.read ? "bg-white/[0.02]" : ""}`}>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${T.bg}`}><T.icon className={`h-3.5 w-3.5 ${T.color}`}/></div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${!n.read ? "text-white/80" : "text-white/50"}`}>{n.title}</p>
                <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-white/25 mt-1">{n.time}</p>
              </div>
              {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B7CFF]"/>}
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5">
        <button className="w-full text-center text-xs text-[#6B7CFF]/70 hover:text-[#8B9DFF] transition-colors">Ver todas as notificações</button>
      </div>
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClose, onClear }: { filters: FilterState; onChange: (k: keyof FilterState, v: string) => void; onClose: () => void; onClear: () => void }) {
  return (
    <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-white/[0.10] bg-[#0F1117] shadow-2xl shadow-black/50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-white">Filtros</span>
        <div className="flex items-center gap-1">
          <button onClick={onClear} className="rounded-lg px-2 py-1 text-[11px] text-white/35 hover:text-white/60 hover:bg-white/5 transition-all">Limpar</button>
          <button onClick={onClose} className="rounded-lg p-1 text-white/25 hover:text-white/50 hover:bg-white/5 transition-all"><X className="h-3.5 w-3.5"/></button>
        </div>
      </div>
      {[
        { key:"stage" as keyof FilterState, label:"Estágio", opts:["", ...STAGES.map(s=>s.label)], placeholder:"Todos os estágios" },
        { key:"product" as keyof FilterState, label:"Produto", opts:["", ...PRODUCTS], placeholder:"Todos os produtos" },
        { key:"priority" as keyof FilterState, label:"Prioridade", opts:["","Alta","Média","Baixa"], placeholder:"Todas" },
        { key:"responsible" as keyof FilterState, label:"Responsável", opts:["", ...ALL_MEMBERS.map(m=>m.name)], placeholder:"Todos" },
      ].map(f => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{f.label}</label>
          <select value={filters[f.key]} onChange={e => onChange(f.key, e.target.value)}
            className="h-9 rounded-xl border border-white/[0.08] bg-[#0A0C13] px-3 text-xs text-white/70 outline-none focus:border-[#6B7CFF]/50 transition-all appearance-none cursor-pointer">
            {f.opts.map(o => <option key={o} value={o}>{o || f.placeholder}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────
function CampaignCard({ c, onClick }: { c: Campaign; onClick: () => void }) {
  const done = Object.values(c.checklistState).filter(Boolean).length;
  const pct = Math.round((done / CHECKLIST_ITEMS.length) * 100);
  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl border border-white/[0.07] bg-[#14161F] p-4 hover:border-white/[0.14] hover:bg-[#181B27] transition-all flex flex-col gap-3 select-none">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/90 leading-tight line-clamp-2">{c.title}</p>
          <p className="mt-0.5 text-xs text-white/35">{c.product}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <PriorityIcon p={c.priority}/>
          <button onClick={e=>e.stopPropagation()} className="rounded p-1 text-white/20 opacity-0 group-hover:opacity-100 hover:text-white/60 transition-all"><MoreHorizontal className="h-3.5 w-3.5"/></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[#6B7CFF]/10 px-2 py-0.5 text-[10px] font-medium text-[#8B9DFF]">{c.objective}</span>
        {c.tags.slice(0,2).map(t => <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">#{t}</span>)}
      </div>
      {c.campaignName ? (
        <div className="rounded-lg border border-white/[0.05] bg-[#0A0C13]/50 px-2.5 py-1.5">
          <p className="font-mono text-[10px] text-white/35 truncate">{c.campaignName}</p>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5">
          <AlertCircle className="h-3 w-3 text-amber-400 shrink-0"/><p className="text-[10px] text-amber-400/70">Nomenclatura não gerada</p>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/25">Checklist</span>
          <span className="text-[10px] font-medium text-white/35">{done}/{CHECKLIST_ITEMS.length}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className={`h-full rounded-full transition-all ${pct===100?"bg-emerald-500":pct>50?"bg-violet-500":"bg-slate-500"}`} style={{width:`${pct}%`}}/>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">{c.responsible.map(m=><Av key={m.id} m={m}/>)}</div>
        <div className="flex items-center gap-2.5 text-white/25">
          <span className="flex items-center gap-1 text-[11px]"><MessageSquare className="h-3 w-3"/>{c.comments}</span>
          <span className="flex items-center gap-1 text-[11px]"><Paperclip className="h-3 w-3"/>{c.attachments}</span>
          <span className="flex items-center gap-1 text-[11px]"><Clock className="h-3 w-3"/>{c.dueDate}</span>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ c, onClose, onStageChange, onDeleteRequest, onArchiveRequest, onBriefingEdit }: {
  c: Campaign; onClose: () => void;
  onStageChange: (id: string, s: Stage) => void;
  onDeleteRequest: () => void; onArchiveRequest: () => void;
  onBriefingEdit: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("briefing");
  const [cl, setCl] = useState<Record<string,boolean>>(c.checklistState);

  // sync external changes
  useEffect(() => { setCl(c.checklistState); }, [c.id]);

  const clDone = CHECKLIST_ITEMS.filter(i=>cl[i.id]).length;
  const utmParams = c.campaignName ? `utm_source=meta&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` : "";
  const fullUrl = c.campaignName ? `https://acelerai.com.br/lp?utm_source=meta&utm_medium=cpc&utm_campaign=${c.campaignName.toLowerCase()}&utm_content=${c.adName.toLowerCase()}` : "";

  const tabs: {id:DetailTab;label:string}[] = [
    {id:"briefing",label:"Briefing"},{id:"nomenclatura",label:"Nomenclatura"},
    {id:"utms",label:"UTMs"},{id:"checklist",label:`Checklist ${clDone}/${CHECKLIST_ITEMS.length}`},{id:"criativos",label:"Criativos"},
  ];

  return (
    <div className="flex h-full w-[460px] shrink-0 flex-col border-l border-white/[0.07] bg-[#0F1117]">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4 border-b border-white/[0.06]">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5"><StagePill stage={c.stage}/><PriorityIcon p={c.priority}/></div>
          <h2 className="text-[15px] font-bold text-white leading-tight">{c.title}</h2>
          <p className="text-xs text-white/35 mt-0.5">{c.product} · {c.period} · {c.budget}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onArchiveRequest} title="Arquivar" className="rounded-lg p-1.5 text-white/25 hover:bg-white/5 hover:text-white/60 transition-all"><Archive className="h-3.5 w-3.5"/></button>
          <button onClick={onDeleteRequest} title="Excluir" className="rounded-lg p-1.5 text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-all"><Trash2 className="h-3.5 w-3.5"/></button>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/25 hover:bg-white/5 hover:text-white/60 transition-all"><X className="h-4 w-4"/></button>
        </div>
      </div>

      {/* Stage bar */}
      <div className="border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {STAGES.map((s,i) => {
            const curIdx = STAGES.findIndex(st=>st.id===c.stage);
            const isActive = s.id===c.stage; const isPast = i<curIdx;
            return (
              <button key={s.id} onClick={()=>onStageChange(c.id,s.id)}
                className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${isActive?`${s.bg} ${s.color}`:isPast?"text-white/25 hover:bg-white/5":"text-white/18 hover:bg-white/5"}`}>
                {isPast&&<Check className="h-2.5 w-2.5"/>}{s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] px-4 gap-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`shrink-0 py-3 px-2.5 text-xs font-medium border-b-2 transition-all ${tab===t.id?"border-[#6B7CFF] text-[#8B9DFF]":"border-transparent text-white/30 hover:text-white/55"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* BRIEFING */}
        {tab==="briefing" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Briefing</p>
              <button onClick={onBriefingEdit} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/30 hover:bg-white/5 hover:text-white/60 transition-all">
                <Edit3 className="h-3 w-3"/> Editar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[{l:"Produto",v:c.product},{l:"Objetivo",v:c.objective},{l:"Tipo",v:c.campaignType},{l:"Período",v:c.period},{l:"Budget",v:c.budget},{l:"Prazo",v:c.dueDate}].map(f=>(
                <div key={f.l} className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-2.5">
                  <p className="text-[10px] text-white/25 mb-0.5">{f.l}</p>
                  <p className="text-sm font-medium text-white/75">{f.v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
              <p className="text-[10px] text-white/25 mb-2">Responsáveis</p>
              <div className="flex flex-wrap gap-2">
                {c.responsible.map(m=><div key={m.id} className="flex items-center gap-1.5"><Av m={m} size="md"/><span className="text-xs text-white/65">{m.name}</span></div>)}
              </div>
            </div>
            {c.briefingFilled && c.briefingData ? (
              <div className="flex flex-col gap-2.5">
                {[
                  {l:"Objetivo",v:c.briefingData.objetivo},{l:"Público-alvo",v:c.briefingData.publico},
                  {l:"Proposta de Valor",v:c.briefingData.proposta},{l:"Tom de Voz",v:c.briefingData.tom},
                  {l:"Referências de Copy",v:c.briefingData.referencias},{l:"Criativos Necessários",v:c.briefingData.criativos},
                ].filter(f=>f.v).map(f=>(
                  <div key={f.l} className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
                    <p className="text-[10px] font-medium text-white/25 mb-1">{f.l}</p>
                    <p className="text-xs text-white/60 leading-relaxed">{f.v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/5 p-8 text-center">
                <AlertCircle className="h-6 w-6 text-amber-400/60"/>
                <div><p className="text-sm font-medium text-amber-400/80">Briefing não preenchido</p><p className="text-xs text-white/30 mt-1">Preencha antes de continuar com a criação.</p></div>
                <button onClick={onBriefingEdit} className="rounded-xl bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/25 transition-all">Preencher Briefing</button>
              </div>
            )}
          </div>
        )}

        {/* NOMENCLATURA */}
        {tab==="nomenclatura" && (
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Nomenclatura Padronizada</p>
            {c.campaignName ? (
              <>
                {[{label:"Campanha",v:c.campaignName,dot:"bg-[#6B7CFF]"},{label:"Conjunto de Anúncios",v:c.adSetName,dot:"bg-violet-400"},{label:"Anúncio",v:c.adName,dot:"bg-emerald-400"}].map(r=>(
                  <div key={r.label} className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${r.dot}`}/><span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{r.label}</span></div>
                    <CopyRow label="" value={r.v}/>
                  </div>
                ))}
                <div className="rounded-xl border border-[#6B7CFF]/15 bg-[#6B7CFF]/5 p-3 flex items-start gap-2">
                  <BadgeCheck className="h-4 w-4 text-[#6B7CFF] shrink-0 mt-0.5"/>
                  <p className="text-xs text-white/40 leading-relaxed">Padrão: <span className="font-mono text-white/55">PRODUTO_OBJETIVO_CAMPANHA_PERÍODO</span>. Copie e cole diretamente no Meta Ads Manager.</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <Hash className="h-8 w-8 text-white/15"/>
                <div><p className="text-sm font-medium text-white/50">Nomenclatura não gerada</p><p className="text-xs text-white/25 mt-1">Complete o briefing para gerar os nomes padronizados.</p></div>
                <button className="rounded-xl bg-[#6B7CFF]/15 px-4 py-2 text-xs font-semibold text-[#8B9DFF] hover:bg-[#6B7CFF]/25 transition-all flex items-center gap-1.5"><Zap className="h-3.5 w-3.5"/>Gerar Nomenclatura</button>
              </div>
            )}
          </div>
        )}

        {/* UTMs */}
        {tab==="utms" && (
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">UTM Parameters & Links</p>
            {c.campaignName ? (
              <>
                <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-sky-400/70 flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5"/>Parâmetros Meta Ads</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{k:"utm_source",v:"meta"},{k:"utm_medium",v:"cpc"},{k:"utm_campaign",v:"{{campaign.name}}"},{k:"utm_content",v:"{{ad.name}}"}].map(p=>(
                      <div key={p.k} className="rounded-lg border border-white/[0.05] bg-[#0F1117]/60 p-2.5">
                        <p className="text-[10px] text-white/25 mb-0.5">{p.k}</p>
                        <p className="font-mono text-xs text-white/65">{p.v}</p>
                      </div>
                    ))}
                  </div>
                  <CopyRow label="Colar no campo URL Parameters do Meta Ads" value={utmParams}/>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-emerald-400/70 flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5"/>URL Final com UTMs</p>
                  <CopyRow label="URL completa para verificação" value={fullUrl}/>
                  <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2.5 text-xs text-white/40 hover:border-emerald-500/20 hover:text-emerald-400 transition-all">
                    <ExternalLink className="h-3.5 w-3.5"/>Testar URL no navegador
                  </button>
                </div>
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5"/>
                  <p className="text-xs text-amber-400/70 leading-relaxed">Cole os parâmetros no campo <span className="font-semibold">URL Parameters</span> do Meta Ads. As variáveis <span className="font-mono">{"{{campaign.name}}"}</span> são preenchidas automaticamente.</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <Link2 className="h-8 w-8 text-white/15"/>
                <p className="text-sm text-white/40">Gere a nomenclatura primeiro para criar os UTMs.</p>
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST */}
        {tab==="checklist" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40">Progresso de Publicação</p>
                <span className="text-xs font-bold text-white">{clDone}<span className="text-white/30">/{CHECKLIST_ITEMS.length}</span></span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] transition-all duration-500" style={{width:`${(clDone/CHECKLIST_ITEMS.length)*100}%`}}/>
              </div>
              {clDone===CHECKLIST_ITEMS.length&&<p className="text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5"/>Pronto para publicar!</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              {CHECKLIST_ITEMS.map((item,idx) => {
                const checked = !!cl[item.id];
                return (
                  <button key={item.id} onClick={()=>setCl(p=>({...p,[item.id]:!p[item.id]}))}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${checked?"border-emerald-500/15 bg-emerald-500/5":"border-white/[0.06] bg-[#0A0C13]/40 hover:border-white/[0.10]"}`}>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${checked?"border-emerald-500 bg-emerald-500":"border-white/15"}`}>
                      {checked&&<Check className="h-3 w-3 text-white" strokeWidth={3}/>}
                    </div>
                    <span className={`flex-1 text-xs font-medium leading-relaxed ${checked?"text-white/30 line-through":"text-white/65"}`}>{item.label}</span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${checked?"bg-emerald-500/15 text-emerald-400":"bg-white/[0.05] text-white/20"}`}>{String(idx+1).padStart(2,"0")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CRIATIVOS */}
        {tab==="criativos" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Criativos</p>
              <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/30 hover:bg-white/5 hover:text-white/60 transition-all"><Plus className="h-3 w-3"/>Adicionar</button>
            </div>
            {c.attachments > 0 ? (
              <div className="flex flex-col gap-2">
                {[{name:"video_30s_v1.mp4",type:"Vídeo 30s",status:"aprovado",size:"48 MB"},{name:"video_15s_v1.mp4",type:"Vídeo 15s",status:"revisao",size:"22 MB"},{name:"carrossel_bf_v2.zip",type:"Carrossel",status:"aprovado",size:"12 MB"},{name:"static_imagem_1.jpg",type:"Imagem Estática",status:"briefing",size:"3.2 MB"}].slice(0,c.attachments).map(a=>{
                  const sm: Record<string,{label:string;color:string}> = {aprovado:{label:"Aprovado",color:"text-emerald-400 bg-emerald-500/10"},revisao:{label:"Em Revisão",color:"text-amber-400 bg-amber-500/10"},briefing:{label:"Aguardando",color:"text-slate-400 bg-slate-500/10"}};
                  const s = sm[a.status];
                  return (
                    <div key={a.name} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5"><Image className="h-3.5 w-3.5 text-white/30"/></div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium text-white/70 truncate">{a.name}</p><p className="text-[10px] text-white/30">{a.type} · {a.size}</p></div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.color}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.07] p-10 text-center">
                <Image className="h-8 w-8 text-white/15"/>
                <div><p className="text-sm font-medium text-white/50">Nenhum criativo anexado</p><p className="text-xs text-white/25 mt-1">Adicione vídeos, imagens e carrosséis.</p></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-4 flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#6B7CFF]/15 py-2.5 text-xs font-semibold text-[#8B9DFF] hover:bg-[#6B7CFF]/25 transition-all">
          <ArrowUpRight className="h-3.5 w-3.5"/>Abrir no Meta Ads
        </button>
        <button className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] px-3 py-2.5 text-xs text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
          <ExternalLink className="h-3.5 w-3.5"/>Ver LP
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({ campaigns }: { campaigns: Campaign[] }) {
  const active = campaigns.filter(c=>c.stage==="no-ar").length;
  const pending = campaigns.filter(c=>["briefing","criacao","revisao"].includes(c.stage)).length;
  const approved = campaigns.filter(c=>c.stage==="aprovado").length;
  const budgetTotal = "R$ 34.700";

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      <div><h1 className="text-xl font-bold text-white">Overview</h1><p className="text-sm text-white/35 mt-0.5">Visão geral das operações de tráfego pago.</p></div>
      <div className="grid grid-cols-4 gap-3">
        {[{v:active,l:"Campanhas No Ar",icon:Play,c:"text-emerald-400",bg:"bg-emerald-500/10"},{v:pending,l:"Em Produção",icon:Layers,c:"text-blue-400",bg:"bg-blue-500/10"},{v:approved,l:"Prontas p/ Publicar",icon:CheckCircle2,c:"text-violet-400",bg:"bg-violet-500/10"},{v:budgetTotal,l:"Budget Total Ativo",icon:DollarSign,c:"text-amber-400",bg:"bg-amber-500/10"}].map(s=>(
          <div key={s.l} className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-4 flex flex-col gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}><s.icon className={`h-4 w-4 ${s.c}`}/></div>
            <div><p className="text-2xl font-bold text-white">{s.v}</p><p className="text-xs text-white/35 mt-0.5">{s.l}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-white/70">Pipeline por Estágio</p>
          <div className="flex flex-col gap-3">
            {STAGES.map(s=>{const cnt=campaigns.filter(c=>c.stage===s.id).length;const pct=campaigns.length>0?(cnt/campaigns.length)*100:0;return(
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-white/40">{s.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className={`h-full rounded-full ${s.dot} transition-all`} style={{width:`${pct}%`,opacity:.7}}/></div>
                <span className="w-4 shrink-0 text-xs font-medium text-white/40 text-right">{cnt}</span>
              </div>
            );})}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-white/70">Checklist Status</p>
          <div className="flex flex-col gap-2.5">
            {campaigns.filter(c=>c.stage!=="encerrado").slice(0,5).map(c=>{
              const done=Object.values(c.checklistState).filter(Boolean).length;
              return(<div key={c.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-white/50 truncate">{c.title}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className={`h-full rounded-full transition-all ${done===CHECKLIST_ITEMS.length?"bg-emerald-500":"bg-[#6B7CFF]"}`} style={{width:`${(done/CHECKLIST_ITEMS.length)*100}%`}}/></div>
                <span className="w-8 shrink-0 text-right text-[11px] text-white/35">{done}/{CHECKLIST_ITEMS.length}</span>
              </div>);
            })}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-white/70">Atividade Recente</p>
        <div className="flex flex-col gap-0">
          {[{t:"Black Friday – Captação movida para 'No Ar'",u:TEAM.marina,time:"há 10 min"},{t:"Lançamento Mentoria aprovada por Joana Reis",u:TEAM.joana,time:"há 1h"},{t:"Briefing de Reengajamento Novembro preenchido",u:TEAM.pedro,time:"há 3h"},{t:"Evergreen Pro enviada para revisão",u:TEAM.thiago,time:"há 5h"}].map((a,i)=>(
            <div key={i} className={`flex items-start gap-3 py-3 ${i>0?"border-t border-white/[0.05]":""}`}>
              <Av m={a.u} size="md"/>
              <div className="flex-1 min-w-0"><p className="text-xs text-white/60 leading-relaxed">{a.t}</p><p className="text-[10px] text-white/25 mt-0.5">{a.time}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({ campaigns, onSelect }: { campaigns: Campaign[]; onSelect: (c: Campaign) => void }) {
  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
      <div><h1 className="text-xl font-bold text-white">Lista de Campanhas</h1><p className="text-sm text-white/35 mt-0.5">{campaigns.length} campanhas no total.</p></div>
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] bg-[#0F1117]">
              {["Campanha","Produto","Estágio","Prioridade","Responsável","Prazo","Checklist","Budget"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/25">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c,i)=>{
              const done=Object.values(c.checklistState).filter(Boolean).length;
              return(
                <tr key={c.id} onClick={()=>onSelect(c)} className={`border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-all ${i%2===0?"bg-[#14161F]":"bg-[#0F1117]"}`}>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-white/80">{c.title}</p><p className="text-[10px] text-white/30 mt-0.5 font-mono truncate max-w-[200px]">{c.campaignName||"—"}</p></td>
                  <td className="px-4 py-3 text-xs text-white/50">{c.product}</td>
                  <td className="px-4 py-3"><StagePill stage={c.stage}/></td>
                  <td className="px-4 py-3"><PriorityIcon p={c.priority}/></td>
                  <td className="px-4 py-3"><div className="flex -space-x-1.5">{c.responsible.slice(0,2).map(m=><Av key={m.id} m={m}/>)}</div></td>
                  <td className="px-4 py-3 text-xs text-white/50">{c.dueDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className={`h-full rounded-full ${done===CHECKLIST_ITEMS.length?"bg-emerald-500":"bg-[#6B7CFF]"}`} style={{width:`${(done/CHECKLIST_ITEMS.length)*100}%`}}/></div>
                      <span className="text-[10px] text-white/30">{done}/{CHECKLIST_ITEMS.length}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">{c.budget}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SETTINGS VIEW ────────────────────────────────────────────────────────────
function SettingsView() {
  const [activeSection, setActiveSection] = useState("nomenclatura");
  const sections = [{id:"nomenclatura",label:"Nomenclatura"},{id:"utm",label:"UTM Padrão"},{id:"equipe",label:"Equipe"},{id:"produtos",label:"Produtos & Tipos"},{id:"integrações",label:"Integrações"}];
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-52 shrink-0 border-r border-white/[0.06] p-4 flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-2 mb-2">Configurações</p>
        {sections.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-left transition-all ${activeSection===s.id?"bg-[#6B7CFF]/15 text-[#8B9DFF] font-medium":"text-white/40 hover:bg-white/5 hover:text-white/65"}`}>
            {s.label}
          </button>
        ))}
      </aside>
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection==="nomenclatura" && (
          <div className="max-w-xl flex flex-col gap-6">
            <div><h2 className="text-lg font-bold text-white">Regras de Nomenclatura</h2><p className="text-sm text-white/40 mt-1">Configure os padrões de geração automática de nomes.</p></div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Estrutura do Nome de Campanha</p>
              <div className="flex items-center gap-2">
                {["PRODUTO","OBJETIVO","CAMPANHA","PERÍODO"].map((t,i)=>(
                  <div key={t} className="flex items-center gap-2">
                    <div className="rounded-xl border border-[#6B7CFF]/30 bg-[#6B7CFF]/10 px-3 py-2 text-xs font-mono font-bold text-[#8B9DFF]">{t}</div>
                    {i<3&&<span className="text-white/30 font-bold">_</span>}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed">Exemplo: <span className="font-mono text-white/50">ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026</span></p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Separador de Palavras</p>
              <div className="flex gap-2">
                {["-","_","."," "].map(s=>(
                  <button key={s} className={`rounded-xl border px-4 py-2 text-sm font-mono font-bold transition-all ${s==="-"?"border-[#6B7CFF]/40 bg-[#6B7CFF]/10 text-[#8B9DFF]":"border-white/[0.07] text-white/35 hover:border-white/[0.14]"}`}>{s||"espaço"}</button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Case</p>
              <div className="flex gap-2">
                {["MAIÚSCULAS","minúsculas","Title Case"].map((s,i)=>(
                  <button key={s} className={`rounded-xl border px-4 py-2 text-sm transition-all ${i===0?"border-[#6B7CFF]/40 bg-[#6B7CFF]/10 text-[#8B9DFF] font-semibold":"border-white/[0.07] text-white/35 hover:border-white/[0.14]"}`}>{s}</button>
                ))}
              </div>
            </div>
            <button className="self-start rounded-xl bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all">Salvar Configurações</button>
          </div>
        )}
        {activeSection==="utm" && (
          <div className="max-w-xl flex flex-col gap-6">
            <div><h2 className="text-lg font-bold text-white">UTM Padrão</h2><p className="text-sm text-white/40 mt-1">Defina os valores padrão de UTM para todas as campanhas.</p></div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
              {[{l:"utm_source",v:"meta",locked:true},{l:"utm_medium",v:"cpc",locked:true},{l:"utm_campaign",v:"{{campaign.name}}",locked:true},{l:"utm_content",v:"{{ad.name}}",locked:true}].map(f=>(
                <div key={f.l} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-white/30">{f.l}</label>
                  <div className="flex items-center gap-2">
                    <input defaultValue={f.v} disabled={f.locked} className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-[#0F1117] px-3 text-sm font-mono text-white/65 outline-none disabled:opacity-60"/>
                    {f.locked&&<span className="text-[10px] text-white/25 shrink-0">gerado automaticamente</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSection==="equipe" && (
          <div className="max-w-xl flex flex-col gap-6">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Equipe</h2><p className="text-sm text-white/40 mt-1">Gerencie os membros do time de marketing.</p></div><button className="flex items-center gap-1.5 rounded-xl bg-[#6B7CFF]/15 px-3 py-2 text-xs font-semibold text-[#8B9DFF] hover:bg-[#6B7CFF]/25 transition-all"><UserPlus className="h-3.5 w-3.5"/>Convidar</button></div>
            <div className="flex flex-col gap-2">
              {ALL_MEMBERS.map(m=>(
                <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#14161F] p-4">
                  <Av m={m} size="lg"/>
                  <div className="flex-1"><p className="text-sm font-semibold text-white/80">{m.name}</p><p className="text-xs text-white/35">Marketing · Ads Manager</p></div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">Ativo</span>
                  <button className="rounded-lg p-1.5 text-white/25 hover:bg-white/5 hover:text-white/50 transition-all"><MoreHorizontal className="h-3.5 w-3.5"/></button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSection==="produtos" && (
          <div className="max-w-xl flex flex-col gap-6">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Produtos & Tipos de Campanha</h2><p className="text-sm text-white/40 mt-1">Gerencie as opções dos dropdowns.</p></div><button className="flex items-center gap-1.5 rounded-xl bg-[#6B7CFF]/15 px-3 py-2 text-xs font-semibold text-[#8B9DFF] hover:bg-[#6B7CFF]/25 transition-all"><Plus className="h-3.5 w-3.5"/>Adicionar</button></div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Produtos</p>
              <div className="flex flex-col gap-1.5">
                {PRODUCTS.map(p=>(
                  <div key={p} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 px-4 py-3">
                    <span className="text-sm text-white/70">{p}</span>
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1 text-white/20 hover:text-white/50 transition-all"><Edit3 className="h-3 w-3"/></button>
                      <button className="rounded p-1 text-white/20 hover:text-red-400 transition-all"><Trash2 className="h-3 w-3"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Tipos de Campanha</p>
              <div className="flex flex-col gap-1.5">
                {CAMPAIGN_TYPES.map(t=>(
                  <div key={t} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 px-4 py-3">
                    <span className="text-sm text-white/70">{t}</span>
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1 text-white/20 hover:text-white/50 transition-all"><Edit3 className="h-3 w-3"/></button>
                      <button className="rounded p-1 text-white/20 hover:text-red-400 transition-all"><Trash2 className="h-3 w-3"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeSection==="integrações" && (
          <div className="max-w-xl flex flex-col gap-6">
            <div><h2 className="text-lg font-bold text-white">Integrações</h2><p className="text-sm text-white/40 mt-1">Conecte as ferramentas do time de marketing.</p></div>
            <div className="flex flex-col gap-3">
              {[{name:"Meta Ads Manager",desc:"Sincronize campanhas e nomes automaticamente.",connected:true,icon:Globe},{name:"Google Analytics 4",desc:"Verifique UTMs e conversões em tempo real.",connected:true,icon:BarChart3},{name:"Google Sheets",desc:"Exporte nomenclaturas para planilhas do time.",connected:false,icon:FileText},{name:"Slack",desc:"Receba notificações no canal do time de marketing.",connected:false,icon:MessageSquare}].map(i=>(
                <div key={i.name} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#14161F] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5"><i.icon className="h-5 w-5 text-white/40"/></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-white/80">{i.name}</p><p className="text-xs text-white/35">{i.desc}</p></div>
                  <button className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${i.connected?"bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400":"border border-white/[0.10] text-white/40 hover:border-[#6B7CFF]/40 hover:text-[#8B9DFF]"}`}>
                    {i.connected?"Conectado":"Conectar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export function AceleraiPlatform() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [sideView, setSideView] = useState<SideView>("kanban");
  const [viewMode, setViewMode] = useState<"kanban"|"list">("kanban");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({stage:"",product:"",priority:"",responsible:""});
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // Modals
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showEditBriefing, setShowEditBriefing] = useState<Campaign|null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Campaign|null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<Campaign|null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const unread = notifications.filter(n=>!n.read).length;

  const updateCampaign = (id: string, patch: Partial<Campaign>) => {
    setCampaigns(p => p.map(c => c.id===id ? {...c,...patch} : c));
    if (selected?.id===id) setSelected(p => p ? {...p,...patch} : p);
  };

  const addCampaign = (c: Campaign) => setCampaigns(p => [c, ...p]);
  const deleteCampaign = (id: string) => { setCampaigns(p=>p.filter(c=>c.id!==id)); if(selected?.id===id) setSelected(null); };

  const filtered = campaigns.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.product.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.stage && STAGES.find(s=>s.label===filters.stage)?.id !== c.stage) return false;
    if (filters.product && c.product !== filters.product) return false;
    if (filters.priority) { const mp: Record<string,Priority> = {"Alta":"high","Média":"medium","Baixa":"low"}; if(mp[filters.priority]!==c.priority) return false; }
    if (filters.responsible && !c.responsible.some(r=>r.name===filters.responsible)) return false;
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const navItems: {id:SideView;icon:React.ElementType;label:string}[] = [
    {id:"dashboard",icon:BarChart3,label:"Overview"},
    {id:"kanban",icon:Kanban,label:"Campanhas"},
    {id:"settings",icon:Settings,label:"Configurações"},
  ];

  return (
    <div className="flex h-screen bg-[#0A0C13] font-['Inter'] text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="flex w-16 shrink-0 flex-col items-center border-r border-white/[0.06] py-4 gap-1">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B7CFF] to-[#A78BFF]"><Zap className="h-4 w-4 text-white"/></div>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>setSideView(item.id)} title={item.label}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${sideView===item.id?"bg-[#6B7CFF]/15 text-[#8B9DFF]":"text-white/25 hover:bg-white/5 hover:text-white/60"}`}>
            <item.icon className="h-4.5 w-4.5"/>
          </button>
        ))}
        <div className="mt-auto">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6B7CFF] to-[#A78BFF] flex items-center justify-center text-[11px] font-bold">MC</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* TOPBAR */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">Aceleraí <span className="font-normal text-white/30">Ads Ops</span></span>
            <Separator orientation="vertical" className="h-4 bg-white/[0.08]"/>
            <span className="text-sm text-white/45">{sideView==="dashboard"?"Overview":sideView==="settings"?"Configurações":"Campanhas"}</span>
          </div>
          <div className="flex items-center gap-2">
            {(sideView==="kanban"||sideView==="dashboard") && (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0F1117]/60 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-white/25"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm text-white/70 placeholder:text-white/25 outline-none w-36"/>
                  {search && <button onClick={()=>setSearch("")}><X className="h-3 w-3 text-white/25 hover:text-white/50"/></button>}
                </div>
                <div className="relative">
                  <button onClick={()=>{setShowFilter(f=>!f);setShowNotifications(false);}}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition-all ${activeFilterCount>0?"border-[#6B7CFF]/40 bg-[#6B7CFF]/10 text-[#8B9DFF]":"border-white/[0.08] text-white/40 hover:border-white/[0.14] hover:text-white/60"}`}>
                    <Filter className="h-3.5 w-3.5"/>Filtrar{activeFilterCount>0&&<span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6B7CFF] text-[10px] font-bold text-white">{activeFilterCount}</span>}
                  </button>
                  {showFilter && <FilterPanel filters={filters} onChange={(k,v)=>setFilters(p=>({...p,[k]:v}))} onClose={()=>setShowFilter(false)} onClear={()=>setFilters({stage:"",product:"",priority:"",responsible:""})}/>}
                </div>
                {sideView==="kanban" && (
                  <div className="flex items-center rounded-xl border border-white/[0.08] overflow-hidden">
                    {([{id:"kanban",icon:Kanban},{id:"list",icon:LayoutList}] as const).map(v=>(
                      <button key={v.id} onClick={()=>setViewMode(v.id as "kanban"|"list")}
                        className={`flex items-center justify-center px-3 py-2 transition-all ${viewMode===v.id?"bg-[#6B7CFF]/15 text-[#8B9DFF]":"text-white/30 hover:text-white/55"}`}>
                        <v.icon className="h-4 w-4"/>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <button onClick={()=>{setShowNewCampaign(true);}} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-[#6B7CFF]/20 hover:opacity-90 transition-all">
              <Plus className="h-3.5 w-3.5"/>Nova Campanha
            </button>
            <div className="relative">
              <button onClick={()=>{setShowNotifications(n=>!n);setShowFilter(false);}} className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/5 hover:text-white/60 transition-all">
                <Bell className="h-4 w-4"/>
                {unread>0&&<span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#6B7CFF] text-[9px] font-bold text-white">{unread}</span>}
              </button>
              {showNotifications&&<NotificationsPanel items={notifications} onClose={()=>setShowNotifications(false)} onMarkAll={()=>{setNotifications(p=>p.map(n=>({...n,read:true})));}}/>}
            </div>
          </div>
        </header>

        {/* BODY */}
        <div className="flex flex-1 min-h-0">
          {sideView==="dashboard" && <DashboardView campaigns={campaigns}/>}
          {sideView==="settings" && <SettingsView/>}
          {sideView==="kanban" && (
            <>
              {viewMode==="list" ? (
                <ListView campaigns={filtered} onSelect={c=>{setSelected(c);setSideView("kanban");setViewMode("kanban");}}/>
              ) : (
                <div className="flex flex-1 min-w-0 overflow-x-auto p-5 gap-4">
                  {STAGES.map(stage=>{
                    const cols = filtered.filter(c=>c.stage===stage.id);
                    return(
                      <div key={stage.id} className="flex shrink-0 w-[270px] flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${stage.dot}`}/>
                            <span className="text-sm font-semibold text-white/65">{stage.label}</span>
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/[0.07] px-1.5 text-[11px] font-medium text-white/35">{cols.length}</span>
                          </div>
                          <button className="rounded-lg p-1 text-white/20 hover:bg-white/5 hover:text-white/50 transition-all"><Plus className="h-3.5 w-3.5"/></button>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {cols.map(c=><CampaignCard key={c.id} c={c} onClick={()=>setSelected(c)}/>)}
                          {cols.length===0&&<div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-white/[0.06] text-xs text-white/20">Sem campanhas</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selected && (
                <DetailPanel
                  c={selected}
                  onClose={()=>setSelected(null)}
                  onStageChange={(id,s)=>updateCampaign(id,{stage:s})}
                  onDeleteRequest={()=>setShowDeleteConfirm(selected)}
                  onArchiveRequest={()=>setShowArchiveConfirm(selected)}
                  onBriefingEdit={()=>setShowEditBriefing(selected)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showNewCampaign && <NewCampaignModal onClose={()=>setShowNewCampaign(false)} onSave={addCampaign}/>}

      {showEditBriefing && (
        <EditBriefingModal
          campaign={showEditBriefing}
          onClose={()=>setShowEditBriefing(null)}
          onSave={b => updateCampaign(showEditBriefing.id, {briefingData:b, briefingFilled:!!(b.objetivo&&b.publico)})}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Excluir campanha"
          message={`Tem certeza que deseja excluir "${showDeleteConfirm.title}"? Essa ação não pode ser desfeita.`}
          danger confirmLabel="Excluir"
          onClose={()=>setShowDeleteConfirm(null)}
          onConfirm={()=>deleteCampaign(showDeleteConfirm.id)}
        />
      )}

      {showArchiveConfirm && (
        <ConfirmModal
          title="Arquivar campanha"
          message={`Arquivar "${showArchiveConfirm.title}"? Ela ficará visível no histórico mas sairá do Kanban.`}
          confirmLabel="Arquivar"
          onClose={()=>setShowArchiveConfirm(null)}
          onConfirm={()=>{ updateCampaign(showArchiveConfirm.id,{stage:"encerrado"}); setShowArchiveConfirm(null); }}
        />
      )}
    </div>
  );
}
