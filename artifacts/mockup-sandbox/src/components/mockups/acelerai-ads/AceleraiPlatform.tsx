import { useState, useEffect } from "react";
import {
  Zap, Settings, Bell, Search, Plus, MoreHorizontal, X, Target, Users,
  CalendarDays, Link2, FileText, AlertCircle, CheckCircle2, Clock, Layers,
  ArrowUpRight, Filter, Image, MessageSquare, Paperclip, Flag, DollarSign,
  BarChart3, Play, Check, Hash, Edit3, Trash2, Archive, ExternalLink, Copy,
  ChevronRight, ChevronLeft, List, Kanban, AlertTriangle, CircleCheck, Globe,
  Tag, UserPlus, LayoutList, BadgeCheck, Sparkles, BookOpen, Eye, TrendingUp,
  RefreshCw, MousePointerClick, BarChart2, Unlink2, Pause, CheckCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Stage = "briefing"|"criacao"|"revisao"|"aprovado"|"no-ar"|"pausado"|"encerrado";
type Priority = "high"|"medium"|"low";
type SideView = "dashboard"|"kanban"|"landingpages"|"settings";
type DetailTab = "briefing"|"nomenclatura"|"utms"|"checklist"|"criativos";
type LPStatus = "no-ar"|"em-teste"|"pausada"|"rascunho";

interface TeamMember { id:string; name:string; initials:string; color:string; }
interface Briefing { objetivo:string; publico:string; proposta:string; tom:string; referencias:string; criativos:string; }
interface LandingPage {
  id:string; name:string; url:string; status:LPStatus;
  connectedCampaigns:string[]; visits:number; conversions:number;
  convRate:number; lastUpdated:string; description:string;
}
interface Campaign {
  id:string; title:string; product:string; objective:string; campaignType:string;
  period:string; budget:string; stage:Stage; priority:Priority; dueDate:string;
  responsible:TeamMember[]; tags:string[]; campaignName:string; adSetName:string;
  adName:string; briefingFilled:boolean; briefingData?:Briefing;
  checklistState:Record<string,boolean>; comments:number; attachments:number;
  createdAt:string; landingPageId?:string;
}
interface FilterState { stage:string; product:string; priority:string; responsible:string; }
interface Notification { id:string; type:"info"|"success"|"warning"; title:string; message:string; time:string; read:boolean; }

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TEAM:Record<string,TeamMember> = {
  marina:{ id:"marina", name:"Marina Costa", initials:"MC", color:"bg-violet-500" },
  pedro:{ id:"pedro", name:"Pedro Alves", initials:"PA", color:"bg-sky-500" },
  joana:{ id:"joana", name:"Joana Reis", initials:"JR", color:"bg-emerald-500" },
  thiago:{ id:"thiago", name:"Thiago Lima", initials:"TL", color:"bg-amber-500" },
};
const ALL_MEMBERS = Object.values(TEAM);

const STAGES:{id:Stage;label:string;dot:string;bg:string;text:string;border:string}[] = [
  {id:"briefing",  label:"Briefing",   dot:"bg-slate-400",   bg:"bg-slate-50",    text:"text-slate-500", border:"border-slate-200"},
  {id:"criacao",   label:"Em Criação", dot:"bg-blue-400",    bg:"bg-blue-50",     text:"text-blue-600",  border:"border-blue-200"},
  {id:"revisao",   label:"Em Revisão", dot:"bg-amber-400",   bg:"bg-amber-50",    text:"text-amber-600", border:"border-amber-200"},
  {id:"aprovado",  label:"Aprovado",   dot:"bg-violet-400",  bg:"bg-violet-50",   text:"text-violet-600",border:"border-violet-200"},
  {id:"no-ar",     label:"No Ar",      dot:"bg-emerald-500", bg:"bg-emerald-50",  text:"text-emerald-700",border:"border-emerald-200"},
  {id:"pausado",   label:"Pausado",    dot:"bg-orange-400",  bg:"bg-orange-50",   text:"text-orange-600",border:"border-orange-200"},
  {id:"encerrado", label:"Encerrado",  dot:"bg-slate-300",   bg:"bg-slate-50",    text:"text-slate-400", border:"border-slate-100"},
];

const LP_STATUS:{[k in LPStatus]:{label:string;bg:string;text:string;dot:string}} = {
  "no-ar":    {label:"No Ar",     bg:"bg-emerald-50",  text:"text-emerald-700", dot:"bg-emerald-500"},
  "em-teste": {label:"Em Teste",  bg:"bg-blue-50",     text:"text-blue-600",    dot:"bg-blue-400"},
  "pausada":  {label:"Pausada",   bg:"bg-orange-50",   text:"text-orange-600",  dot:"bg-orange-400"},
  "rascunho": {label:"Rascunho",  bg:"bg-slate-100",   text:"text-slate-500",   dot:"bg-slate-300"},
};

const PRODUCTS = ["Aceleraí","Aceleraí Pro","Mentoria Elite","Imersão Intensiva"];
const OBJECTIVES = ["Captação de Leads","Conversão","Retenção","Reengajamento","Awareness"];
const CAMPAIGN_TYPES = ["Black Friday","Lançamento","Evergreen","Liquidação","Novembro Negro","Oferta Relâmpago"];
const PERIODS = ["Q1 2026","Q2 2026","Q3 2026","Q4 2026","Mai 2026","Jun 2026","Jul 2026","Ago 2026","Set 2026","Out 2026","Nov 2026"];
const AUD_MAP:Record<string,string> = {"cl":"COLD-LOOKALIKE-1%","ci":"COLD-INTERESSE","wp":"WARM-VISITANTES","we":"WARM-ENGAJADOS-30D","hl":"HOT-LEADS","ha":"HOT-ABANDONO","rv":"RET-VIDEO-75%"};
const AUDIENCES = [{v:"cl",l:"Cold – Lookalike 1%"},{v:"ci",l:"Cold – Interesse Amplo"},{v:"wp",l:"Warm – Visitantes Página"},{v:"we",l:"Warm – Engajados 30d"},{v:"hl",l:"Hot – Leads Não Comprados"},{v:"ha",l:"Hot – Abandono de Carrinho"},{v:"rv",l:"Retargeting – Vídeo 75%"}];
const FMT_MAP:Record<string,string> = {"v30":"VIDEO-30S","v15":"VIDEO-15S","ca":"CARROSSEL","im":"IMAGEM-UNICA","st":"STORIES","re":"REELS"};
const FORMATS = [{v:"v30",l:"Vídeo 30s"},{v:"v15",l:"Vídeo 15s"},{v:"ca",l:"Carrossel"},{v:"im",l:"Imagem Única"},{v:"st",l:"Stories"},{v:"re",l:"Reels"}];
const CHECKLIST_ITEMS = [
  {id:"c1",label:"Nome da campanha gerado e copiado"},
  {id:"c2",label:"Nome do conjunto de anúncios copiado"},
  {id:"c3",label:"Nome do anúncio copiado"},
  {id:"c4",label:"URL Parameters configurados no Meta Ads"},
  {id:"c5",label:"URL com UTM testada e verificada no GA4"},
  {id:"c6",label:"Pixel disparando corretamente na LP"},
  {id:"c7",label:"Landing page revisada e sem erros"},
  {id:"c8",label:"Orçamento definido e revisado"},
  {id:"c9",label:"Data e horário de início corretos"},
  {id:"c10",label:"Revisão final antes de publicar"},
];

function slugify(v:string){return v.toUpperCase().replace(/\s+/g,"-").replace(/[^\w-]/g,"");}
function genNames(product:string,objective:string,campaignType:string,period:string,audience:string,format:string){
  const p=slugify(product),o=slugify(objective),c=slugify(campaignType),pe=period.toUpperCase().replace(" ","-");
  const a=AUD_MAP[audience]||slugify(audience),f=FMT_MAP[format]||slugify(format);
  return {campaignName:`${p}_${o}_${c}_${pe}`,adSetName:`${p}_${o}_${c}_${pe}_${a}`,adName:`${p}_${o}_${c}_${pe}_${a}_${f}`};
}

const INIT_LPS:LandingPage[] = [
  {id:"lp1",name:"LP Principal – Aceleraí",url:"acelerai.com.br/lp",status:"no-ar",connectedCampaigns:["c1","c4"],visits:12840,conversions:1027,convRate:8.0,lastUpdated:"Hoje",description:"Página principal de captação para o produto Aceleraí."},
  {id:"lp2",name:"LP Mentoria Elite",url:"acelerai.com.br/mentoria",status:"no-ar",connectedCampaigns:["c2"],visits:5320,conversions:238,convRate:4.5,lastUpdated:"Ontem",description:"LP exclusiva para a Mentoria Elite — foco em conversão de leads quentes."},
  {id:"lp3",name:"LP Lançamento Q3",url:"acelerai.com.br/lancamento",status:"em-teste",connectedCampaigns:["c3"],visits:890,conversions:0,convRate:0,lastUpdated:"2 dias atrás",description:"LP de lançamento para testes A/B com variação de headline."},
  {id:"lp4",name:"LP Black Friday 2026",url:"acelerai.com.br/bf2026",status:"rascunho",connectedCampaigns:[],visits:0,conversions:0,convRate:0,lastUpdated:"3 dias atrás",description:"Em desenvolvimento para a campanha de Black Friday."},
  {id:"lp5",name:"LP Imersão Intensiva",url:"acelerai.com.br/imersao",status:"pausada",connectedCampaigns:["c5"],visits:2140,conversions:94,convRate:4.4,lastUpdated:"5 dias atrás",description:"Pausada até confirmação de data de nova turma."},
];

const INIT_CAMPAIGNS:Campaign[] = [
  {id:"c1",title:"Black Friday – Captação",product:"Aceleraí",objective:"Captação de Leads",campaignType:"Black Friday",period:"Q4 2026",budget:"R$ 12.000",stage:"no-ar",priority:"high",dueDate:"Nov 29",responsible:[TEAM.marina,TEAM.pedro],tags:["bf2026"],campaignName:"ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026",adSetName:"ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026_COLD-LOOKALIKE-1%",adName:"ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026_COLD-LOOKALIKE-1%_VIDEO-30S",briefingFilled:true,briefingData:{objetivo:"Captar leads qualificados com CPL abaixo de R$ 18.",publico:"Empreendedores de 28–45 anos que tentaram escalar e não conseguiram.",proposta:"Sistema completo para escalar vendas online.",tom:"Direto, empático e orientado a resultado.",referencias:"VSL Q2 (conv. 3,2%). Estrutura: problema → agitação → solução.",criativos:"3 vídeos (30s, 15s, Stories), 2 carrosséis, 4 imagens."},checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true,c7:true,c8:true,c9:true},comments:8,attachments:4,createdAt:"Hoje, 14:22",landingPageId:"lp1"},
  {id:"c2",title:"Lançamento Mentoria Elite",product:"Mentoria Elite",objective:"Conversão",campaignType:"Lançamento",period:"Q3 2026",budget:"R$ 8.500",stage:"aprovado",priority:"high",dueDate:"Out 15",responsible:[TEAM.joana],tags:["lancamento"],campaignName:"MENTORIA-ELITE_CONVERSAO_LANCAMENTO_Q3-2026",adSetName:"MENTORIA-ELITE_CONVERSAO_LANCAMENTO_Q3-2026_WARM-ENGAJADOS-30D",adName:"MENTORIA-ELITE_CONVERSAO_LANCAMENTO_Q3-2026_WARM-ENGAJADOS-30D_CARROSSEL",briefingFilled:true,briefingData:{objetivo:"Converter leads quentes da lista de espera.",publico:"Leads que assistiram ao webinar e não compraram nos últimos 90 dias.",proposta:"Mentoria 1:1 com especialistas que escalaram R$ 10M+.",tom:"Exclusivo, urgente, resultado comprovado.",referencias:"Email de abertura gerou 42% de abertura. Usar prova social.",criativos:"2 depoimentos em vídeo, 3 imagens com screenshot de resultados."},checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true,c7:true,c8:true,c9:true,c10:true},comments:12,attachments:7,createdAt:"Ontem, 10:05",landingPageId:"lp2"},
  {id:"c3",title:"Evergreen Pro – Conversão",product:"Aceleraí Pro",objective:"Conversão",campaignType:"Evergreen",period:"Q2 2026",budget:"R$ 5.000",stage:"revisao",priority:"medium",dueDate:"Set 30",responsible:[TEAM.thiago,TEAM.marina],tags:["evergreen"],campaignName:"ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026",adSetName:"ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026_HOT-LEADS",adName:"ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026_HOT-LEADS_VIDEO-15S",briefingFilled:true,briefingData:{objetivo:"Converter leads mornos da base via retargeting contínuo.",publico:"Leads que baixaram material gratuito mas não compraram.",proposta:"Módulo avançado para quem já tem resultado.",tom:"Consultivo, especialista, sem hype.",referencias:"Anúncio 'Você já tem os leads' — CTR 4.2%.",criativos:"1 vídeo 15s, 2 imagens, 1 carrossel de prova social."},checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true},comments:5,attachments:2,createdAt:"2 dias atrás",landingPageId:"lp3"},
  {id:"c4",title:"Reengajamento Novembro",product:"Aceleraí",objective:"Reengajamento",campaignType:"Novembro Negro",period:"Q4 2026",budget:"R$ 3.200",stage:"criacao",priority:"medium",dueDate:"Nov 10",responsible:[TEAM.pedro],tags:["reengajamento"],campaignName:"ACELERAI_REENGAJAMENTO_NOVEMBRO-NEGRO_Q4-2026",adSetName:"ACELERAI_REENGAJAMENTO_NOVEMBRO-NEGRO_Q4-2026_HOT-ABANDONO",adName:"ACELERAI_REENGAJAMENTO_NOVEMBRO-NEGRO_Q4-2026_HOT-ABANDONO_STORIES",briefingFilled:true,briefingData:{objetivo:"Reativar base de leads inativos há mais de 60 dias.",publico:"Leads que pararam de abrir emails.",proposta:"Oferta exclusiva com 30% de desconto.",tom:"Pessoal, direto, senso de urgência real.",referencias:"Nada aprovado ainda.",criativos:"3 Stories, 2 imagens de oferta."},checklistState:{},comments:3,attachments:1,createdAt:"3 dias atrás",landingPageId:"lp1"},
  {id:"c5",title:"Oferta Relâmpago Imersão",product:"Imersão Intensiva",objective:"Conversão",campaignType:"Oferta Relâmpago",period:"Q3 2026",budget:"R$ 2.000",stage:"briefing",priority:"low",dueDate:"Set 20",responsible:[TEAM.joana,TEAM.thiago],tags:["oferta"],campaignName:"",adSetName:"",adName:"",briefingFilled:false,checklistState:{},comments:1,attachments:0,createdAt:"4 dias atrás",landingPageId:"lp5"},
  {id:"c6",title:"Awareness Aceleraí Q3",product:"Aceleraí",objective:"Awareness",campaignType:"Evergreen",period:"Q3 2026",budget:"R$ 4.000",stage:"pausado",priority:"low",dueDate:"Ago 31",responsible:[TEAM.marina],tags:["awareness"],campaignName:"ACELERAI_AWARENESS_EVERGREEN_Q3-2026",adSetName:"ACELERAI_AWARENESS_EVERGREEN_Q3-2026_COLD-INTERESSE",adName:"ACELERAI_AWARENESS_EVERGREEN_Q3-2026_COLD-INTERESSE_REELS",briefingFilled:true,briefingData:{objetivo:"Aumentar reconhecimento de marca.",publico:"Empreendedores 25–50 anos interessados em marketing digital.",proposta:"A plataforma que organiza o caos do marketing digital.",tom:"Educativo, inspirador.",referencias:"Conteúdo orgânico de maior alcance.",criativos:"Série de Reels educativos."},checklistState:{c1:true,c2:true,c3:true,c4:true,c5:true,c6:true,c7:true},comments:2,attachments:3,createdAt:"5 dias atrás",landingPageId:undefined},
];

const INIT_NOTIFS:Notification[] = [
  {id:"n1",type:"warning",title:"Checklist incompleto",message:"'Black Friday – Captação' está No Ar com 1 item pendente.",time:"há 10 min",read:false},
  {id:"n2",type:"success",title:"Campanha aprovada",message:"'Lançamento Mentoria Elite' foi aprovada por Joana.",time:"há 1h",read:false},
  {id:"n3",type:"info",title:"LP em teste",message:"LP Lançamento Q3 entrou em fase de teste A/B.",time:"há 3h",read:true},
  {id:"n4",type:"warning",title:"Briefing pendente",message:"'Oferta Relâmpago' aguarda preenchimento.",time:"há 4h",read:true},
];

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Av({m,size="sm"}:{m:TeamMember;size?:"sm"|"md"|"lg"}){
  const s=size==="lg"?"h-9 w-9 text-xs":size==="md"?"h-7 w-7 text-[11px]":"h-6 w-6 text-[10px]";
  return <div className={`${s} ${m.color} flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white`}>{m.initials}</div>;
}
function StagePill({stage}:{stage:Stage}){
  const s=STAGES.find(st=>st.id===stage)!;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text} ${s.border}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>{s.label}</span>;
}
function LPStatusPill({status}:{status:LPStatus}){
  const s=LP_STATUS[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>{s.label}</span>;
}
function PIcon({p}:{p:Priority}){
  const c=p==="high"?"text-red-500":p==="medium"?"text-amber-500":"text-slate-300";
  return <Flag className={`h-3.5 w-3.5 ${c}`}/>;
}
function CopyBtn({value}:{value:string}){
  const[ok,setOk]=useState(false);
  return <button onClick={()=>{navigator.clipboard.writeText(value).catch(()=>{});setOk(true);setTimeout(()=>setOk(false),2000);}} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">{ok?<Check className="h-3.5 w-3.5 text-emerald-500"/>:<Copy className="h-3.5 w-3.5"/>}</button>;
}
function CopyRow({label,value}:{label:string;value:string}){
  return(
    <div className="flex flex-col gap-1">
      {label&&<span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 hover:border-indigo-200 transition-all group">
        <span className="flex-1 font-mono text-xs text-slate-600 break-all leading-relaxed">{value||<span className="italic text-slate-300">Não gerado</span>}</span>
        {value&&<CopyBtn value={value}/>}
      </div>
    </div>
  );
}
function Sel({label,opts,value,onChange}:{label:string;opts:string[];value:string;onChange:(v:string)=>void}){
  return(
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer">
        <option value="" disabled>Selecione…</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function TA({label,value,onChange,rows=3}:{label:string;value:string;onChange:(v:string)=>void;rows?:number}){
  return(
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={`Digite ${label.toLowerCase()}…`}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none placeholder:text-slate-300"/>
    </div>
  );
}

// ─── MODAL SHELL ─────────────────────────────────────────────────────────────
function Modal({onClose,children,wide=false}:{onClose:()=>void;children:React.ReactNode;wide?:boolean}){
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative z-10 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 ${wide?"w-[760px] max-h-[88vh]":"w-[480px] max-h-[88vh]"} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}

// ─── NEW CAMPAIGN WIZARD ──────────────────────────────────────────────────────
interface WD{product:string;objective:string;campaignType:string;period:string;budget:string;priority:Priority;dueDate:string;responsible:string[];briefingObjetivo:string;briefingPublico:string;briefingProposta:string;briefingTom:string;briefingRefs:string;briefingCriativos:string;audience:string;format:string;landingPageId:string;}
const WSTEPS=["Campanha","Equipe","Briefing","LP & Nomenclatura","Revisão"];

function NewCampaignModal({onClose,onSave,lps}:{onClose:()=>void;onSave:(c:Campaign)=>void;lps:LandingPage[]}){
  const[step,setStep]=useState(0);
  const[d,setD]=useState<WD>({product:"",objective:"",campaignType:"",period:"",budget:"",priority:"medium",dueDate:"",responsible:[],briefingObjetivo:"",briefingPublico:"",briefingProposta:"",briefingTom:"",briefingRefs:"",briefingCriativos:"",audience:"",format:"",landingPageId:""});
  const u=(k:keyof WD)=>(v:string)=>setD(p=>({...p,[k]:v}));
  const n=d.product&&d.objective&&d.campaignType&&d.period&&d.audience&&d.format?genNames(d.product,d.objective,d.campaignType,d.period,d.audience,d.format):null;
  const canNext=[d.product&&d.objective&&d.campaignType&&d.period&&d.budget,d.responsible.length>0&&d.dueDate,d.briefingObjetivo&&d.briefingPublico,true,true][step];
  const toggleR=(id:string)=>setD(p=>({...p,responsible:p.responsible.includes(id)?p.responsible.filter(r=>r!==id):[...p.responsible,id]}));
  const create=()=>{
    const names=n||{campaignName:"",adSetName:"",adName:""};
    onSave({id:`c${Date.now()}`,title:`${d.product} – ${d.campaignType}`,product:d.product,objective:d.objective,campaignType:d.campaignType,period:d.period,budget:d.budget,stage:"briefing",priority:d.priority,dueDate:d.dueDate,responsible:d.responsible.map(id=>TEAM[id]),tags:[d.product.toLowerCase().replace(/\s/g,"-")],campaignName:names.campaignName,adSetName:names.adSetName,adName:names.adName,briefingFilled:!!(d.briefingObjetivo&&d.briefingPublico),briefingData:{objetivo:d.briefingObjetivo,publico:d.briefingPublico,proposta:d.briefingProposta,tom:d.briefingTom,referencias:d.briefingRefs,criativos:d.briefingCriativos},checklistState:{},comments:0,attachments:0,createdAt:"Agora",landingPageId:d.landingPageId||undefined});
    onClose();
  };
  return(
    <Modal onClose={onClose} wide>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div><h2 className="text-base font-bold text-slate-900">Nova Campanha</h2><p className="text-xs text-slate-400 mt-0.5">Passo {step+1} de {WSTEPS.length} — {WSTEPS[step]}</p></div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-all"><X className="h-4 w-4"/></button>
      </div>
      <div className="flex items-center gap-0 border-b border-slate-100 px-6 py-3">
        {WSTEPS.map((s,i)=>(
          <div key={s} className="flex items-center gap-0">
            <button onClick={()=>i<step&&setStep(i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i===step?"bg-indigo-50 text-indigo-600":i<step?"text-slate-500 hover:text-slate-700":"text-slate-300"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i===step?"bg-indigo-600 text-white":i<step?"bg-emerald-500 text-white":"bg-slate-200 text-slate-400"}`}>{i<step?<Check className="h-2.5 w-2.5"/>:i+1}</span>{s}
            </button>
            {i<WSTEPS.length-1&&<ChevronRight className="h-3.5 w-3.5 text-slate-200 mx-0.5"/>}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {step===0&&<div className="grid grid-cols-2 gap-4">
          <Sel label="Produto" opts={PRODUCTS} value={d.product} onChange={u("product")}/>
          <Sel label="Objetivo" opts={OBJECTIVES} value={d.objective} onChange={u("objective")}/>
          <Sel label="Tipo de Campanha" opts={CAMPAIGN_TYPES} value={d.campaignType} onChange={u("campaignType")}/>
          <Sel label="Período" opts={PERIODS} value={d.period} onChange={u("period")}/>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Budget</label><input value={d.budget} onChange={e=>u("budget")(e.target.value)} placeholder="Ex: R$ 5.000" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"/></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Prazo</label><input value={d.dueDate} onChange={e=>u("dueDate")(e.target.value)} placeholder="Ex: Nov 29" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"/></div>
        </div>}
        {step===1&&<div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2"><label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Responsáveis</label><div className="grid grid-cols-2 gap-2">{ALL_MEMBERS.map(m=><button key={m.id} onClick={()=>toggleR(m.id)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${d.responsible.includes(m.id)?"border-indigo-300 bg-indigo-50":"border-slate-200 hover:border-slate-300"}`}><Av m={m} size="md"/><span className="text-sm text-slate-700 font-medium">{m.name}</span>{d.responsible.includes(m.id)&&<Check className="ml-auto h-4 w-4 text-indigo-600"/>}</button>)}</div></div>
          <div className="flex flex-col gap-2"><label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Prioridade</label><div className="flex gap-2">{(["high","medium","low"] as Priority[]).map(p=>{const info=p==="high"?{l:"Alta",c:"border-red-200 bg-red-50 text-red-600"}:p==="medium"?{l:"Média",c:"border-amber-200 bg-amber-50 text-amber-600"}:{l:"Baixa",c:"border-slate-200 bg-slate-50 text-slate-500"};return<button key={p} onClick={()=>setD(dd=>({...dd,priority:p}))} className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all ${d.priority===p?info.c:"border-slate-200 text-slate-400 hover:border-slate-300"}`}><Flag className="h-3.5 w-3.5"/>{info.l}</button>;})}
          </div></div>
        </div>}
        {step===2&&<div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><TA label="Objetivo da Campanha" value={d.briefingObjetivo} onChange={u("briefingObjetivo")} rows={2}/></div>
          <div className="col-span-2"><TA label="Público-alvo" value={d.briefingPublico} onChange={u("briefingPublico")} rows={2}/></div>
          <TA label="Proposta de Valor" value={d.briefingProposta} onChange={u("briefingProposta")} rows={2}/>
          <TA label="Tom de Voz" value={d.briefingTom} onChange={u("briefingTom")} rows={2}/>
          <TA label="Referências de Copy" value={d.briefingRefs} onChange={u("briefingRefs")} rows={2}/>
          <TA label="Criativos Necessários" value={d.briefingCriativos} onChange={u("briefingCriativos")} rows={2}/>
        </div>}
        {step===3&&<div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2"><label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Landing Page</label>
            <div className="flex flex-col gap-2">
              {lps.map(lp=><button key={lp.id} onClick={()=>setD(dd=>({...dd,landingPageId:dd.landingPageId===lp.id?"":lp.id}))} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${d.landingPageId===lp.id?"border-indigo-300 bg-indigo-50":"border-slate-200 hover:border-slate-300"}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${LP_STATUS[lp.status].bg}`}><Globe className={`h-4 w-4 ${LP_STATUS[lp.status].text}`}/></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700">{lp.name}</p><p className="text-xs text-slate-400 font-mono">{lp.url}</p></div>
                <LPStatusPill status={lp.status}/>
                {d.landingPageId===lp.id&&<Check className="h-4 w-4 text-indigo-600 shrink-0"/>}
              </button>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Sel label="Público" opts={AUDIENCES.map(a=>a.l)} value={AUDIENCES.find(a=>a.v===d.audience)?.l||""} onChange={v=>{const f=AUDIENCES.find(a=>a.l===v);if(f)setD(dd=>({...dd,audience:f.v}));}}/>
            <Sel label="Formato" opts={FORMATS.map(f=>f.l)} value={FORMATS.find(f=>f.v===d.format)?.l||""} onChange={v=>{const f=FORMATS.find(ff=>ff.l===v);if(f)setD(dd=>({...dd,format:f.v}));}}/>
          </div>
          {n&&<div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500"/><span className="text-xs font-semibold text-indigo-600">Nomenclatura gerada automaticamente</span></div>
            {[{l:"Campanha",v:n.campaignName},{l:"Conjunto",v:n.adSetName},{l:"Anúncio",v:n.adName}].map(r=><div key={r.l}><p className="text-[10px] text-indigo-400 mb-1">{r.l}</p><CopyRow label="" value={r.v}/></div>)}
          </div>}
        </div>}
        {step===4&&<div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[{l:"Produto",v:d.product},{l:"Objetivo",v:d.objective},{l:"Campanha",v:d.campaignType},{l:"Período",v:d.period},{l:"Budget",v:d.budget},{l:"Prazo",v:d.dueDate}].map(f=><div key={f.l} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] text-slate-400 mb-0.5">{f.l}</p><p className="text-sm font-semibold text-slate-700">{f.v||"—"}</p></div>)}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] text-slate-400 mb-2">Responsáveis</p><div className="flex gap-2">{d.responsible.map(id=><div key={id} className="flex items-center gap-1.5"><Av m={TEAM[id]} size="md"/><span className="text-xs text-slate-600">{TEAM[id].name}</span></div>)}</div></div>
          {d.landingPageId&&(()=>{const lp=lps.find(l=>l.id===d.landingPageId);return lp&&<div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] text-slate-400 mb-1">Landing Page</p><div className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400"/><span className="text-sm font-medium text-slate-700">{lp.name}</span><LPStatusPill status={lp.status}/></div></div>;})()}
          {n&&<div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3"><p className="text-[10px] text-indigo-400 mb-1">Nomenclatura</p><p className="font-mono text-xs text-slate-600 break-all">{n.campaignName}</p></div>}
        </div>}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <button onClick={()=>step>0?setStep(s=>s-1):onClose()} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"><ChevronLeft className="h-4 w-4"/>{step===0?"Cancelar":"Voltar"}</button>
        {step<WSTEPS.length-1?<button disabled={!canNext} onClick={()=>setStep(s=>s+1)} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-30">Próximo<ChevronRight className="h-4 w-4"/></button>:<button onClick={create} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"><Zap className="h-4 w-4"/>Criar Campanha</button>}
      </div>
    </Modal>
  );
}

// ─── EDIT BRIEFING ────────────────────────────────────────────────────────────
function EditBriefingModal({campaign,onClose,onSave}:{campaign:Campaign;onClose:()=>void;onSave:(b:Briefing)=>void}){
  const[b,setB]=useState<Briefing>(campaign.briefingData||{objetivo:"",publico:"",proposta:"",tom:"",referencias:"",criativos:""});
  const u=(k:keyof Briefing)=>(v:string)=>setB(p=>({...p,[k]:v}));
  return<Modal onClose={onClose} wide>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h2 className="text-base font-bold text-slate-900">Editar Briefing</h2><p className="text-xs text-slate-400 mt-0.5">{campaign.title}</p></div><button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-all"><X className="h-4 w-4"/></button></div>
    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4">
      <div className="col-span-2"><TA label="Objetivo da Campanha" value={b.objetivo} onChange={u("objetivo")} rows={2}/></div>
      <div className="col-span-2"><TA label="Público-alvo" value={b.publico} onChange={u("publico")} rows={2}/></div>
      <TA label="Proposta de Valor" value={b.proposta} onChange={u("proposta")} rows={3}/>
      <TA label="Tom de Voz" value={b.tom} onChange={u("tom")} rows={3}/>
      <TA label="Referências de Copy" value={b.referencias} onChange={u("referencias")} rows={3}/>
      <TA label="Criativos Necessários" value={b.criativos} onChange={u("criativos")} rows={3}/>
    </div>
    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
      <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-500 hover:border-slate-300 transition-all">Cancelar</button>
      <button onClick={()=>{onSave(b);onClose();}} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all flex items-center gap-1.5"><Check className="h-3.5 w-3.5"/>Salvar Briefing</button>
    </div>
  </Modal>;
}

// ─── CONFIRM ──────────────────────────────────────────────────────────────────
function ConfirmModal({title,message,danger=false,confirmLabel,onClose,onConfirm}:{title:string;message:string;danger?:boolean;confirmLabel:string;onClose:()=>void;onConfirm:()=>void}){
  return<Modal onClose={onClose}>
    <div className="flex items-start gap-4 p-6">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger?"bg-red-50":"bg-amber-50"}`}>{danger?<AlertTriangle className="h-5 w-5 text-red-500"/>:<AlertCircle className="h-5 w-5 text-amber-500"/>}</div>
      <div><h3 className="text-base font-bold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500 leading-relaxed">{message}</p></div>
    </div>
    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
      <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-500 hover:border-slate-300 transition-all">Cancelar</button>
      <button onClick={()=>{onConfirm();onClose();}} className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all ${danger?"bg-red-500 hover:bg-red-600":"bg-amber-500 hover:bg-amber-600"}`}>{confirmLabel}</button>
    </div>
  </Modal>;
}

// ─── LP CONNECT MODAL ─────────────────────────────────────────────────────────
function ConnectLPModal({campaign,lps,onClose,onSave}:{campaign:Campaign;lps:LandingPage[];onClose:()=>void;onSave:(lpId:string)=>void}){
  const[sel,setSel]=useState(campaign.landingPageId||"");
  return<Modal onClose={onClose}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h2 className="text-base font-bold text-slate-900">Conectar Landing Page</h2><p className="text-xs text-slate-400 mt-0.5">{campaign.title}</p></div><button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-all"><X className="h-4 w-4"/></button></div>
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {lps.map(lp=><button key={lp.id} onClick={()=>setSel(sel===lp.id?"":lp.id)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${sel===lp.id?"border-indigo-300 bg-indigo-50":"border-slate-200 hover:border-slate-300"}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${LP_STATUS[lp.status].bg}`}><Globe className={`h-4.5 w-4.5 ${LP_STATUS[lp.status].text}`}/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800">{lp.name}</p><p className="text-xs text-slate-400 font-mono">{lp.url}</p><p className="text-[10px] text-slate-400 mt-0.5">{lp.connectedCampaigns.length} campanha(s) conectada(s)</p></div>
        <LPStatusPill status={lp.status}/>
        {sel===lp.id&&<Check className="h-4 w-4 text-indigo-600 shrink-0"/>}
      </button>)}
    </div>
    <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
      <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-500 hover:border-slate-300 transition-all">Cancelar</button>
      <button onClick={()=>{onSave(sel);onClose();}} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5"/>Conectar LP</button>
    </div>
  </Modal>;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotifPanel({items,onClose,onMarkAll}:{items:Notification[];onClose:()=>void;onMarkAll:()=>void}){
  const tm={success:{icon:CircleCheck,c:"text-emerald-600",bg:"bg-emerald-50"},warning:{icon:AlertTriangle,c:"text-amber-500",bg:"bg-amber-50"},info:{icon:Bell,c:"text-blue-600",bg:"bg-blue-50"}};
  return<div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100"><span className="text-sm font-bold text-slate-900">Notificações</span><div className="flex items-center gap-1"><button onClick={onMarkAll} className="rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">Marcar lidas</button><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-all"><X className="h-3.5 w-3.5"/></button></div></div>
    <div className="max-h-72 overflow-y-auto">
      {items.map(n=>{const T=tm[n.type];return<div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-all ${!n.read?"bg-indigo-50/30":""}`}><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${T.bg}`}><T.icon className={`h-3.5 w-3.5 ${T.c}`}/></div><div className="flex-1 min-w-0"><p className={`text-xs font-semibold ${!n.read?"text-slate-800":"text-slate-500"}`}>{n.title}</p><p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p><p className="text-[10px] text-slate-300 mt-1">{n.time}</p></div>{!n.read&&<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"/>}</div>;})}
    </div>
    <div className="px-4 py-2.5"><button className="w-full text-center text-xs text-indigo-500 hover:text-indigo-700 transition-colors">Ver todas</button></div>
  </div>;
}

// ─── FILTER ───────────────────────────────────────────────────────────────────
function FilterPanel({f,onChange,onClose,onClear}:{f:FilterState;onChange:(k:keyof FilterState,v:string)=>void;onClose:()=>void;onClear:()=>void}){
  return<div className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between mb-1"><span className="text-sm font-bold text-slate-900">Filtros</span><div className="flex items-center gap-1"><button onClick={onClear} className="rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">Limpar</button><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-all"><X className="h-3.5 w-3.5"/></button></div></div>
    {([{k:"stage" as keyof FilterState,l:"Estágio",o:["",...STAGES.map(s=>s.label)],p:"Todos"},{k:"product" as keyof FilterState,l:"Produto",o:["",...PRODUCTS],p:"Todos"},{k:"priority" as keyof FilterState,l:"Prioridade",o:["","Alta","Média","Baixa"],p:"Todas"},{k:"responsible" as keyof FilterState,l:"Responsável",o:["",...ALL_MEMBERS.map(m=>m.name)],p:"Todos"}]).map(ff=><div key={ff.k} className="flex flex-col gap-1"><label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{ff.l}</label><select value={f[ff.k]} onChange={e=>onChange(ff.k,e.target.value)} className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer"><option value="">{ff.p}</option>{ff.o.slice(1).map(o=><option key={o} value={o}>{o}</option>)}</select></div>)}
  </div>;
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────
function CampaignCard({c,onClick,lp}:{c:Campaign;onClick:()=>void;lp?:LandingPage}){
  const done=Object.values(c.checklistState).filter(Boolean).length;
  const pct=Math.round((done/CHECKLIST_ITEMS.length)*100);
  return<div onClick={onClick} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-200 hover:shadow-md hover:shadow-slate-100 transition-all flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">{c.title}</p><p className="mt-0.5 text-xs text-slate-400">{c.product}</p></div>
      <div className="flex items-center gap-1 shrink-0"><PIcon p={c.priority}/><button onClick={e=>e.stopPropagation()} className="rounded p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-500 transition-all"><MoreHorizontal className="h-3.5 w-3.5"/></button></div>
    </div>
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">{c.objective}</span>
      {c.tags.slice(0,2).map(t=><span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">#{t}</span>)}
    </div>
    {c.campaignName?<div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5"><p className="font-mono text-[10px] text-slate-400 truncate">{c.campaignName}</p></div>:<div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5"><AlertCircle className="h-3 w-3 text-amber-500 shrink-0"/><p className="text-[10px] text-amber-600">Nomenclatura não gerada</p></div>}
    {lp?<div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5"><Globe className="h-3 w-3 text-slate-400 shrink-0"/><p className="text-[10px] text-slate-500 truncate">{lp.name}</p><LPStatusPill status={lp.status}/></div>:<div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5"><Globe className="h-3 w-3 text-slate-300 shrink-0"/><p className="text-[10px] text-slate-300 italic">Sem LP conectada</p></div>}
    <div className="flex flex-col gap-1"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Checklist</span><span className="text-[10px] font-medium text-slate-500">{done}/{CHECKLIST_ITEMS.length}</span></div><div className="h-1 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${pct===100?"bg-emerald-500":pct>50?"bg-indigo-500":"bg-slate-300"}`} style={{width:`${pct}%`}}/></div></div>
    <div className="flex items-center justify-between"><div className="flex -space-x-1.5">{c.responsible.map(m=><Av key={m.id} m={m}/>)}</div><div className="flex items-center gap-2.5 text-slate-400"><span className="flex items-center gap-1 text-[11px]"><MessageSquare className="h-3 w-3"/>{c.comments}</span><span className="flex items-center gap-1 text-[11px]"><Paperclip className="h-3 w-3"/>{c.attachments}</span><span className="flex items-center gap-1 text-[11px]"><Clock className="h-3 w-3"/>{c.dueDate}</span></div></div>
  </div>;
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({c,onClose,onStageChange,onDeleteRequest,onArchiveRequest,onBriefingEdit,onConnectLP,lps}:{c:Campaign;onClose:()=>void;onStageChange:(id:string,s:Stage)=>void;onDeleteRequest:()=>void;onArchiveRequest:()=>void;onBriefingEdit:()=>void;onConnectLP:()=>void;lps:LandingPage[]}){
  const[tab,setTab]=useState<DetailTab>("briefing");
  const[cl,setCl]=useState<Record<string,boolean>>(c.checklistState);
  useEffect(()=>{setCl(c.checklistState);},[c.id]);
  const clDone=CHECKLIST_ITEMS.filter(i=>cl[i.id]).length;
  const lp=lps.find(l=>l.id===c.landingPageId);
  const utmParams=c.campaignName?`utm_source=meta&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`:"";
  const fullUrl=c.campaignName&&lp?`https://${lp.url}?utm_source=meta&utm_medium=cpc&utm_campaign=${c.campaignName.toLowerCase()}&utm_content=${c.adName.toLowerCase()}`:c.campaignName?`https://acelerai.com.br/lp?utm_source=meta&utm_medium=cpc&utm_campaign=${c.campaignName.toLowerCase()}`:"";
  const tabs:[DetailTab,string][]=[["briefing","Briefing"],["nomenclatura","Nomenclatura"],["utms","UTMs"],["checklist",`Checklist ${clDone}/${CHECKLIST_ITEMS.length}`],["criativos","Criativos"]];
  return<div className="flex h-full w-[460px] shrink-0 flex-col border-l border-slate-200 bg-white">
    <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100">
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2 mb-1.5"><StagePill stage={c.stage}/><PIcon p={c.priority}/></div>
        <h2 className="text-[15px] font-bold text-slate-900 leading-tight">{c.title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{c.product} · {c.period} · {c.budget}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onArchiveRequest} title="Arquivar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><Archive className="h-3.5 w-3.5"/></button>
        <button onClick={onDeleteRequest} title="Excluir" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 className="h-3.5 w-3.5"/></button>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><X className="h-4 w-4"/></button>
      </div>
    </div>
    {/* LP Banner */}
    <div className="border-b border-slate-100 px-4 py-2.5">
      {lp?<div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-slate-400 shrink-0"/><span className="text-xs font-medium text-slate-600 flex-1 truncate">{lp.name}</span><span className="font-mono text-[10px] text-slate-400">{lp.url}</span><LPStatusPill status={lp.status}/><button onClick={onConnectLP} className="ml-1 rounded-lg px-2 py-1 text-[10px] text-indigo-500 hover:bg-indigo-50 transition-all">Trocar</button></div>:<button onClick={onConnectLP} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-500 hover:bg-indigo-100 transition-all"><Link2 className="h-3.5 w-3.5"/>Conectar Landing Page</button>}
    </div>
    {/* Stage bar */}
    <div className="border-b border-slate-100 px-4 py-2.5">
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {STAGES.map((s,i)=>{const curIdx=STAGES.findIndex(st=>st.id===c.stage);const isActive=s.id===c.stage;const isPast=i<curIdx;return<button key={s.id} onClick={()=>onStageChange(c.id,s.id)} className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${isActive?`${s.bg} ${s.text}`:isPast?"text-slate-400 hover:bg-slate-100":"text-slate-300 hover:bg-slate-50"}`}>{isPast&&<Check className="h-2.5 w-2.5"/>}{s.label}</button>;})}
      </div>
    </div>
    <div className="flex border-b border-slate-100 px-4 gap-0 overflow-x-auto">
      {tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`shrink-0 py-3 px-2.5 text-xs font-medium border-b-2 transition-all ${tab===id?"border-indigo-500 text-indigo-600":"border-transparent text-slate-400 hover:text-slate-600"}`}>{label}</button>)}
    </div>
    <div className="flex-1 overflow-y-auto p-4">
      {/* BRIEFING */}
      {tab==="briefing"&&<div className="flex flex-col gap-4">
        <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Briefing</p><button onClick={onBriefingEdit} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><Edit3 className="h-3 w-3"/>Editar</button></div>
        <div className="grid grid-cols-2 gap-2">{[{l:"Produto",v:c.product},{l:"Objetivo",v:c.objective},{l:"Tipo",v:c.campaignType},{l:"Período",v:c.period},{l:"Budget",v:c.budget},{l:"Prazo",v:c.dueDate}].map(f=><div key={f.l} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5"><p className="text-[10px] text-slate-400 mb-0.5">{f.l}</p><p className="text-sm font-semibold text-slate-700">{f.v}</p></div>)}</div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[10px] text-slate-400 mb-2">Responsáveis</p><div className="flex flex-wrap gap-2">{c.responsible.map(m=><div key={m.id} className="flex items-center gap-1.5"><Av m={m} size="md"/><span className="text-xs text-slate-600">{m.name}</span></div>)}</div></div>
        {c.briefingFilled&&c.briefingData?<div className="flex flex-col gap-2.5">{[{l:"Objetivo",v:c.briefingData.objetivo},{l:"Público-alvo",v:c.briefingData.publico},{l:"Proposta de Valor",v:c.briefingData.proposta},{l:"Tom de Voz",v:c.briefingData.tom},{l:"Referências de Copy",v:c.briefingData.referencias},{l:"Criativos Necessários",v:c.briefingData.criativos}].filter(f=>f.v).map(f=><div key={f.l} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-400 mb-1">{f.l}</p><p className="text-xs text-slate-600 leading-relaxed">{f.v}</p></div>)}</div>:<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center"><AlertCircle className="h-6 w-6 text-amber-400"/><div><p className="text-sm font-semibold text-amber-700">Briefing não preenchido</p><p className="text-xs text-amber-500 mt-1">Preencha antes de continuar.</p></div><button onClick={onBriefingEdit} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-all">Preencher Briefing</button></div>}
      </div>}
      {/* NOMENCLATURA */}
      {tab==="nomenclatura"&&<div className="flex flex-col gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Nomenclatura Padronizada</p>
        {c.campaignName?<>{[{l:"Campanha",v:c.campaignName,dot:"bg-indigo-500"},{l:"Conjunto de Anúncios",v:c.adSetName,dot:"bg-violet-500"},{l:"Anúncio",v:c.adName,dot:"bg-emerald-500"}].map(r=><div key={r.l} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${r.dot}`}/><span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{r.l}</span></div><CopyRow label="" value={r.v}/></div>)}<div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 flex items-start gap-2"><BadgeCheck className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5"/><p className="text-xs text-slate-500 leading-relaxed">Padrão: <span className="font-mono text-slate-600">PRODUTO_OBJETIVO_CAMPANHA_PERÍODO</span>. Copie e cole no Meta Ads Manager.</p></div></>:<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 p-10 text-center"><Hash className="h-8 w-8 text-slate-200"/><div><p className="text-sm font-semibold text-slate-500">Nomenclatura não gerada</p><p className="text-xs text-slate-400 mt-1">Complete o briefing para gerar os nomes.</p></div></div>}
      </div>}
      {/* UTMs */}
      {tab==="utms"&&<div className="flex flex-col gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">UTM Parameters & Links</p>
        {lp?<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-600 shrink-0"/><div className="flex-1 min-w-0"><p className="text-xs font-semibold text-emerald-700">{lp.name}</p><p className="font-mono text-[10px] text-emerald-600">{lp.url}</p></div><LPStatusPill status={lp.status}/></div>:<button onClick={onConnectLP} className="flex items-center gap-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-3 py-3 text-xs text-indigo-500 hover:bg-indigo-100 transition-all w-full"><Link2 className="h-3.5 w-3.5"/>Conectar LP para gerar a URL final</button>}
        {c.campaignName?<><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3"><p className="text-xs font-semibold text-sky-600 flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5"/>Parâmetros Meta Ads</p><div className="grid grid-cols-2 gap-2">{[{k:"utm_source",v:"meta"},{k:"utm_medium",v:"cpc"},{k:"utm_campaign",v:"{{campaign.name}}"},{k:"utm_content",v:"{{ad.name}}"}].map(p=><div key={p.k} className="rounded-lg border border-slate-200 bg-white p-2.5"><p className="text-[10px] text-slate-400 mb-0.5">{p.k}</p><p className="font-mono text-xs text-slate-600">{p.v}</p></div>)}</div><CopyRow label="Colar no campo URL Parameters do Meta Ads" value={utmParams}/></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3"><p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5"/>URL Final com UTMs</p><CopyRow label="URL completa para verificação" value={fullUrl}/><button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><ExternalLink className="h-3.5 w-3.5"/>Testar URL no navegador</button></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2"><AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5"/><p className="text-xs text-amber-600 leading-relaxed">Cole os parâmetros no campo <span className="font-semibold">URL Parameters</span> do Meta Ads. As variáveis <span className="font-mono">{"{{campaign.name}}"}</span> são preenchidas automaticamente.</p></div></>:<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 p-10 text-center"><Link2 className="h-8 w-8 text-slate-200"/><p className="text-sm text-slate-400">Gere a nomenclatura primeiro para criar os UTMs.</p></div>}
      </div>}
      {/* CHECKLIST */}
      {tab==="checklist"&&<div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-600">Progresso de Publicação</p><span className="text-xs font-bold text-slate-800">{clDone}<span className="text-slate-400">/{CHECKLIST_ITEMS.length}</span></span></div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{width:`${(clDone/CHECKLIST_ITEMS.length)*100}%`}}/></div>
          {clDone===CHECKLIST_ITEMS.length&&<p className="text-xs text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5"/>Pronto para publicar!</p>}
        </div>
        <div className="flex flex-col gap-1.5">{CHECKLIST_ITEMS.map((item,idx)=>{const checked=!!cl[item.id];return<button key={item.id} onClick={()=>setCl(p=>({...p,[item.id]:!p[item.id]}))} className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${checked?"border-emerald-200 bg-emerald-50":"border-slate-200 bg-white hover:border-slate-300"}`}><div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${checked?"border-emerald-500 bg-emerald-500":"border-slate-300"}`}>{checked&&<Check className="h-3 w-3 text-white" strokeWidth={3}/>}</div><span className={`flex-1 text-xs font-medium leading-relaxed ${checked?"text-slate-400 line-through":"text-slate-700"}`}>{item.label}</span><span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${checked?"bg-emerald-100 text-emerald-600":"bg-slate-100 text-slate-400"}`}>{String(idx+1).padStart(2,"0")}</span></button>;})}</div>
      </div>}
      {/* CRIATIVOS */}
      {tab==="criativos"&&<div className="flex flex-col gap-4">
        <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Criativos</p><button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><Plus className="h-3 w-3"/>Adicionar</button></div>
        {c.attachments>0?<div className="flex flex-col gap-2">{[{name:"video_30s_v1.mp4",type:"Vídeo 30s",status:"aprovado",size:"48 MB"},{name:"video_15s_v1.mp4",type:"Vídeo 15s",status:"revisao",size:"22 MB"},{name:"carrossel_bf_v2.zip",type:"Carrossel",status:"aprovado",size:"12 MB"},{name:"static_imagem_1.jpg",type:"Imagem",status:"briefing",size:"3.2 MB"}].slice(0,c.attachments).map(a=>{const sm:Record<string,{l:string;c:string}>={aprovado:{l:"Aprovado",c:"text-emerald-600 bg-emerald-50"},revisao:{l:"Em Revisão",c:"text-amber-600 bg-amber-50"},briefing:{l:"Aguardando",c:"text-slate-500 bg-slate-100"}};const s=sm[a.status];return<div key={a.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100"><Image className="h-3.5 w-3.5 text-slate-400"/></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-700 truncate">{a.name}</p><p className="text-[10px] text-slate-400">{a.type} · {a.size}</p></div><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.c}`}>{s.l}</span></div>;})}</div>:<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-10 text-center"><Image className="h-8 w-8 text-slate-200"/><div><p className="text-sm font-semibold text-slate-500">Nenhum criativo anexado</p><p className="text-xs text-slate-400 mt-1">Adicione vídeos, imagens e carrosséis.</p></div></div>}
      </div>}
    </div>
    <div className="border-t border-slate-100 p-4 flex items-center gap-2">
      <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-all"><ArrowUpRight className="h-3.5 w-3.5"/>Abrir no Meta Ads</button>
      {lp&&<button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"><Eye className="h-3.5 w-3.5"/>Ver LP</button>}
    </div>
  </div>;
}

// ─── LANDING PAGES VIEW ───────────────────────────────────────────────────────
function LandingPagesView({lps,campaigns,onAddLP,onEditLP}:{lps:LandingPage[];campaigns:Campaign[];onAddLP:()=>void;onEditLP:(lp:LandingPage)=>void}){
  const[selectedLP,setSelectedLP]=useState<LandingPage|null>(null);
  return<div className="flex flex-1 min-h-0">
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">Landing Pages</h1><p className="text-sm text-slate-400 mt-0.5">Gerencie suas LPs e veja quais campanhas estão conectadas.</p></div>
        <button onClick={onAddLP} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm"><Plus className="h-4 w-4"/>Nova LP</button>
      </div>
      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {([{s:"no-ar",icon:Play},{s:"em-teste",icon:BarChart2},{s:"pausada",icon:Pause},{s:"rascunho",icon:FileText}] as const).map(({s,icon:Icon})=>{const cnt=lps.filter(l=>l.status===s).length;const st=LP_STATUS[s];return<div key={s} className={`rounded-2xl border p-4 flex items-center gap-3 ${st.bg} border-transparent`}><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70"><Icon className={`h-4 w-4 ${st.text}`}/></div><div><p className="text-xl font-bold text-slate-900">{cnt}</p><p className={`text-xs font-medium ${st.text}`}>{st.label}</p></div></div>;})}
      </div>
      {/* LP Cards */}
      <div className="flex flex-col gap-3">
        {lps.map(lp=>{
          const lpCampaigns=campaigns.filter(c=>c.landingPageId===lp.id);
          return<div key={lp.id} onClick={()=>setSelectedLP(selectedLP?.id===lp.id?null:lp)} className={`group cursor-pointer rounded-2xl border bg-white p-5 transition-all hover:shadow-md hover:shadow-slate-100 ${selectedLP?.id===lp.id?"border-indigo-300 shadow-md shadow-indigo-100/50":"border-slate-200 hover:border-indigo-200"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${LP_STATUS[lp.status].bg}`}><Globe className={`h-5 w-5 ${LP_STATUS[lp.status].text}`}/></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-bold text-slate-900">{lp.name}</h3><LPStatusPill status={lp.status}/></div>
                  <p className="font-mono text-xs text-slate-400 mt-0.5">{lp.url}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{lp.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                {lp.status!=="rascunho"&&<><div className="text-right"><p className="text-lg font-bold text-slate-900">{lp.visits.toLocaleString()}</p><p className="text-[10px] text-slate-400">Visitantes</p></div><div className="text-right"><p className="text-lg font-bold text-slate-900">{lp.convRate}%</p><p className="text-[10px] text-slate-400">Conv. Rate</p></div></>}
                <div className="text-right"><p className="text-lg font-bold text-slate-900">{lpCampaigns.length}</p><p className="text-[10px] text-slate-400">Campanhas</p></div>
                <button onClick={e=>{e.stopPropagation();onEditLP(lp);}} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100"><Edit3 className="h-4 w-4"/></button>
              </div>
            </div>
            {/* Connected campaigns */}
            {selectedLP?.id===lp.id&&<div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Campanhas Conectadas</p>
              {lpCampaigns.length>0?<div className="flex flex-col gap-2">{lpCampaigns.map(c=>{const done=Object.values(c.checklistState).filter(Boolean).length;return<div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5"><StagePill stage={c.stage}/><span className="text-xs font-semibold text-slate-700">{c.title}</span></div><div className="font-mono text-[10px] text-slate-400 truncate">{c.campaignName||"Nomenclatura não gerada"}</div></div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5"><div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className={`h-full rounded-full ${done===CHECKLIST_ITEMS.length?"bg-emerald-500":"bg-indigo-500"}`} style={{width:`${(done/CHECKLIST_ITEMS.length)*100}%`}}/></div><span className="text-[10px] text-slate-400">{done}/{CHECKLIST_ITEMS.length}</span></div>
                  <div className="flex -space-x-1">{c.responsible.slice(0,2).map(m=><Av key={m.id} m={m}/>)}</div>
                  {c.campaignName&&<button onClick={e=>{e.stopPropagation();navigator.clipboard.writeText(`utm_source=meta&utm_medium=cpc&utm_campaign=${c.campaignName.toLowerCase()}&utm_content=${c.adName.toLowerCase()}`).catch(()=>{});}} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-1"><Copy className="h-3 w-3"/>UTM</button>}
                </div>
              </div>;})}
              </div>:<div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 p-4 text-slate-400"><Unlink2 className="h-4 w-4 shrink-0"/><span className="text-xs">Nenhuma campanha conectada a esta LP.</span></div>}
              {/* UTM Preview */}
              {lpCampaigns.length>0&&lpCampaigns[0].campaignName&&<div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-400 mb-2">Exemplo de URL com UTM (primeira campanha)</p><div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 break-all"><span className="flex-1 leading-relaxed">{`https://${lp.url}?utm_source=meta&utm_medium=cpc&utm_campaign=${lpCampaigns[0].campaignName.toLowerCase()}&utm_content=${lpCampaigns[0].adName.toLowerCase()}`}</span><CopyBtn value={`https://${lp.url}?utm_source=meta&utm_medium=cpc&utm_campaign=${lpCampaigns[0].campaignName.toLowerCase()}&utm_content=${lpCampaigns[0].adName.toLowerCase()}`}/></div></div>}
            </div>}
          </div>;
        })}
      </div>
    </div>
  </div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({campaigns,lps}:{campaigns:Campaign[];lps:LandingPage[]}){
  const active=campaigns.filter(c=>c.stage==="no-ar").length,pending=campaigns.filter(c=>["briefing","criacao","revisao"].includes(c.stage)).length,approved=campaigns.filter(c=>c.stage==="aprovado").length;
  return<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
    <div><h1 className="text-xl font-bold text-slate-900">Overview</h1><p className="text-sm text-slate-400 mt-0.5">Visão geral das operações de tráfego pago.</p></div>
    <div className="grid grid-cols-4 gap-3">
      {[{v:active,l:"No Ar",icon:Play,bg:"bg-emerald-50",ic:"text-emerald-600"},{v:pending,l:"Em Produção",icon:Layers,bg:"bg-blue-50",ic:"text-blue-600"},{v:approved,l:"Prontas p/ Publicar",icon:CheckCircle2,bg:"bg-violet-50",ic:"text-violet-600"},{v:lps.filter(l=>l.status==="no-ar").length,l:"LPs No Ar",icon:Globe,bg:"bg-indigo-50",ic:"text-indigo-600"}].map(s=><div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}><s.icon className={`h-4 w-4 ${s.ic}`}/></div><div><p className="text-2xl font-bold text-slate-900">{s.v}</p><p className="text-xs text-slate-400 mt-0.5">{s.l}</p></div></div>)}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4"><p className="text-sm font-semibold text-slate-700">Pipeline por Estágio</p><div className="flex flex-col gap-3">{STAGES.map(s=>{const cnt=campaigns.filter(c=>c.stage===s.id).length;const pct=campaigns.length>0?(cnt/campaigns.length)*100:0;return<div key={s.id} className="flex items-center gap-3"><span className="w-24 shrink-0 text-xs text-slate-400">{s.label}</span><div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${s.dot}`} style={{width:`${pct}%`}}/></div><span className="w-4 shrink-0 text-xs font-medium text-slate-500 text-right">{cnt}</span></div>;})}</div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4"><p className="text-sm font-semibold text-slate-700">LPs por Status</p><div className="flex flex-col gap-3">{(["no-ar","em-teste","pausada","rascunho"] as LPStatus[]).map(s=>{const cnt=lps.filter(l=>l.status===s).length;const totalVisits=lps.filter(l=>l.status===s).reduce((a,l)=>a+l.visits,0);const st=LP_STATUS[s];return<div key={s} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${st.dot}`}/><span className="text-xs text-slate-500">{st.label}</span></div><div className="flex items-center gap-4"><span className="text-xs text-slate-400">{totalVisits>0?totalVisits.toLocaleString()+" visits":""}</span><span className="text-xs font-semibold text-slate-700">{cnt} LP{cnt!==1?"s":""}</span></div></div>;})}
      </div></div>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4">
      <p className="text-sm font-semibold text-slate-700">LPs No Ar — Performance</p>
      <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-100">{["Landing Page","URL","Campanhas Ativas","Visitantes","Conversões","Conv. Rate"].map(h=><th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>)}</tr></thead><tbody>{lps.filter(l=>l.status==="no-ar").map((lp,i)=>{const lpC=campaigns.filter(c=>c.landingPageId===lp.id&&c.stage==="no-ar").length;return<tr key={lp.id} className={`border-b border-slate-50 ${i%2===0?"bg-white":"bg-slate-50"}`}><td className="px-3 py-2.5 text-sm font-medium text-slate-700">{lp.name}</td><td className="px-3 py-2.5 font-mono text-xs text-slate-400">{lp.url}</td><td className="px-3 py-2.5 text-xs text-slate-600">{lpC}</td><td className="px-3 py-2.5 text-xs font-semibold text-slate-700">{lp.visits.toLocaleString()}</td><td className="px-3 py-2.5 text-xs text-slate-600">{lp.conversions.toLocaleString()}</td><td className="px-3 py-2.5"><span className={`text-xs font-bold ${lp.convRate>=5?"text-emerald-600":lp.convRate>=3?"text-amber-600":"text-red-500"}`}>{lp.convRate}%</span></td></tr>;})}
      </tbody></table></div>
    </div>
  </div>;
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({campaigns,lps,onSelect}:{campaigns:Campaign[];lps:LandingPage[];onSelect:(c:Campaign)=>void}){
  return<div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
    <div><h1 className="text-xl font-bold text-slate-900">Lista de Campanhas</h1><p className="text-sm text-slate-400 mt-0.5">{campaigns.length} campanhas</p></div>
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <table className="w-full">
        <thead><tr className="border-b border-slate-100 bg-slate-50">{["Campanha","Produto","Estágio","LP Conectada","Responsável","Checklist","Budget","Prazo"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">{h}</th>)}</tr></thead>
        <tbody>{campaigns.map((c,i)=>{const done=Object.values(c.checklistState).filter(Boolean).length;const lp=lps.find(l=>l.id===c.landingPageId);return<tr key={c.id} onClick={()=>onSelect(c)} className={`border-b border-slate-50 hover:bg-indigo-50/40 cursor-pointer transition-all ${i%2===0?"bg-white":"bg-slate-50/50"}`}><td className="px-4 py-3"><p className="text-sm font-semibold text-slate-800">{c.title}</p><p className="font-mono text-[10px] text-slate-400 mt-0.5 max-w-[200px] truncate">{c.campaignName||"—"}</p></td><td className="px-4 py-3 text-xs text-slate-500">{c.product}</td><td className="px-4 py-3"><StagePill stage={c.stage}/></td><td className="px-4 py-3">{lp?<div className="flex items-center gap-1.5"><Globe className="h-3 w-3 text-slate-400 shrink-0"/><span className="text-xs text-slate-600 truncate max-w-[120px]">{lp.name}</span><LPStatusPill status={lp.status}/></div>:<span className="text-xs text-slate-300 italic">Sem LP</span>}</td><td className="px-4 py-3"><div className="flex -space-x-1.5">{c.responsible.slice(0,2).map(m=><Av key={m.id} m={m}/>)}</div></td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className={`h-full rounded-full ${done===CHECKLIST_ITEMS.length?"bg-emerald-500":"bg-indigo-500"}`} style={{width:`${(done/CHECKLIST_ITEMS.length)*100}%`}}/></div><span className="text-[10px] text-slate-400">{done}/{CHECKLIST_ITEMS.length}</span></div></td><td className="px-4 py-3 text-xs text-slate-500">{c.budget}</td><td className="px-4 py-3 text-xs text-slate-500">{c.dueDate}</td></tr>;})}
        </tbody>
      </table>
    </div>
  </div>;
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsView(){
  const[sec,setSec]=useState("nomenclatura");
  const secs=[{id:"nomenclatura",l:"Nomenclatura"},{id:"utm",l:"UTM Padrão"},{id:"equipe",l:"Equipe"},{id:"produtos",l:"Produtos & Tipos"},{id:"integracoes",l:"Integrações"}];
  return<div className="flex flex-1 overflow-hidden">
    <aside className="w-52 shrink-0 border-r border-slate-200 p-4 flex flex-col gap-1 bg-white">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-2">Configurações</p>
      {secs.map(s=><button key={s.id} onClick={()=>setSec(s.id)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-left transition-all ${sec===s.id?"bg-indigo-50 text-indigo-700 font-semibold":"text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}>{s.l}</button>)}
    </aside>
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      {sec==="nomenclatura"&&<div className="max-w-xl flex flex-col gap-6">
        <div><h2 className="text-lg font-bold text-slate-900">Regras de Nomenclatura</h2><p className="text-sm text-slate-500 mt-1">Configure os padrões de geração automática de nomes.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Estrutura</p><div className="flex items-center gap-2 flex-wrap">{["PRODUTO","OBJETIVO","CAMPANHA","PERÍODO"].map((t,i)=><div key={t} className="flex items-center gap-2"><div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-mono font-bold text-indigo-600">{t}</div>{i<3&&<span className="text-slate-400 font-bold">_</span>}</div>)}</div><p className="text-[11px] text-slate-400">Ex: <span className="font-mono text-slate-600">ACELERAI_CAPTACAO-DE-LEADS_BLACK-FRIDAY_Q4-2026</span></p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Separador</p><div className="flex gap-2">{["-","_","."," "].map(s=><button key={s} className={`rounded-xl border px-4 py-2 text-sm font-mono font-bold transition-all ${s==="-"?"border-indigo-300 bg-indigo-50 text-indigo-600":"border-slate-200 text-slate-400 hover:border-slate-300"}`}>{s||"espaço"}</button>)}</div></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Case</p><div className="flex gap-2">{["MAIÚSCULAS","minúsculas","Title Case"].map((s,i)=><button key={s} className={`rounded-xl border px-4 py-2 text-sm transition-all ${i===0?"border-indigo-300 bg-indigo-50 text-indigo-600 font-semibold":"border-slate-200 text-slate-400 hover:border-slate-300"}`}>{s}</button>)}</div></div>
        <button className="self-start rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all">Salvar Configurações</button>
      </div>}
      {sec==="equipe"&&<div className="max-w-xl flex flex-col gap-6">
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Equipe</h2><p className="text-sm text-slate-500 mt-1">Membros do time de marketing.</p></div><button className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-all"><UserPlus className="h-3.5 w-3.5"/>Convidar</button></div>
        <div className="flex flex-col gap-2">{ALL_MEMBERS.map(m=><div key={m.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"><Av m={m} size="lg"/><div className="flex-1"><p className="text-sm font-semibold text-slate-800">{m.name}</p><p className="text-xs text-slate-400">Marketing · Ads Manager</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">Ativo</span><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"><MoreHorizontal className="h-3.5 w-3.5"/></button></div>)}</div>
      </div>}
      {sec==="produtos"&&<div className="max-w-xl flex flex-col gap-6">
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Produtos & Tipos</h2></div><button className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-all"><Plus className="h-3.5 w-3.5"/>Adicionar</button></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Produtos</p>{PRODUCTS.map(p=><div key={p} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"><span className="text-sm text-slate-700 font-medium">{p}</span><div className="flex items-center gap-1"><button className="rounded p-1 text-slate-400 hover:text-slate-600 transition-all"><Edit3 className="h-3 w-3"/></button><button className="rounded p-1 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="h-3 w-3"/></button></div></div>)}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tipos de Campanha</p>{CAMPAIGN_TYPES.map(t=><div key={t} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"><span className="text-sm text-slate-700 font-medium">{t}</span><div className="flex items-center gap-1"><button className="rounded p-1 text-slate-400 hover:text-slate-600 transition-all"><Edit3 className="h-3 w-3"/></button><button className="rounded p-1 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="h-3 w-3"/></button></div></div>)}</div>
      </div>}
      {sec==="integracoes"&&<div className="max-w-xl flex flex-col gap-6">
        <div><h2 className="text-lg font-bold text-slate-900">Integrações</h2><p className="text-sm text-slate-500 mt-1">Conecte as ferramentas do time.</p></div>
        <div className="flex flex-col gap-3">{[{name:"Meta Ads Manager",desc:"Sincronize campanhas e nomes automaticamente.",connected:true,icon:BarChart3},{name:"Google Analytics 4",desc:"Verifique UTMs e conversões em tempo real.",connected:true,icon:TrendingUp},{name:"Google Sheets",desc:"Exporte nomenclaturas para planilhas.",connected:false,icon:FileText},{name:"Slack",desc:"Notificações no canal do time.",connected:false,icon:MessageSquare}].map(item=><div key={item.name} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"><item.icon className="h-5 w-5 text-slate-500"/></div><div className="flex-1"><p className="text-sm font-semibold text-slate-800">{item.name}</p><p className="text-xs text-slate-400">{item.desc}</p></div><button className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${item.connected?"bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500":"border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"}`}>{item.connected?"Conectado":"Conectar"}</button></div>)}</div>
      </div>}
      {sec==="utm"&&<div className="max-w-xl flex flex-col gap-6">
        <div><h2 className="text-lg font-bold text-slate-900">UTM Padrão</h2><p className="text-sm text-slate-500 mt-1">Valores padrão de UTM para todas as campanhas.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4">{[{l:"utm_source",v:"meta",locked:true},{l:"utm_medium",v:"cpc",locked:true},{l:"utm_campaign",v:"{{campaign.name}}",locked:true},{l:"utm_content",v:"{{ad.name}}",locked:true}].map(f=><div key={f.l} className="flex flex-col gap-1.5"><label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{f.l}</label><div className="flex items-center gap-2"><input defaultValue={f.v} disabled={f.locked} className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-mono text-slate-600 outline-none disabled:opacity-60"/>{f.locked&&<span className="text-[10px] text-slate-400 shrink-0">gerado automaticamente</span>}</div></div>)}</div>
      </div>}
    </div>
  </div>;
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export function AceleraiPlatform(){
  const[campaigns,setCampaigns]=useState<Campaign[]>(INIT_CAMPAIGNS);
  const[lps,setLps]=useState<LandingPage[]>(INIT_LPS);
  const[selected,setSelected]=useState<Campaign|null>(null);
  const[sideView,setSideView]=useState<SideView>("kanban");
  const[viewMode,setViewMode]=useState<"kanban"|"list">("kanban");
  const[search,setSearch]=useState("");
  const[filters,setFilters]=useState<FilterState>({stage:"",product:"",priority:"",responsible:""});
  const[notifs,setNotifs]=useState<Notification[]>(INIT_NOTIFS);
  const[showNew,setShowNew]=useState(false);
  const[showEditB,setShowEditB]=useState<Campaign|null>(null);
  const[showDel,setShowDel]=useState<Campaign|null>(null);
  const[showArc,setShowArc]=useState<Campaign|null>(null);
  const[showNotif,setShowNotif]=useState(false);
  const[showFilter,setShowFilter]=useState(false);
  const[showConnLP,setShowConnLP]=useState<Campaign|null>(null);
  const unread=notifs.filter(n=>!n.read).length;
  const updCamp=(id:string,p:Partial<Campaign>)=>{setCampaigns(c=>c.map(x=>x.id===id?{...x,...p}:x));if(selected?.id===id)setSelected(x=>x?{...x,...p}:x);};
  const connectLP=(campaignId:string,lpId:string)=>{
    const oldLpId=campaigns.find(c=>c.id===campaignId)?.landingPageId;
    setLps(ls=>ls.map(l=>{if(l.id===oldLpId)return{...l,connectedCampaigns:l.connectedCampaigns.filter(c=>c!==campaignId)};if(l.id===lpId)return{...l,connectedCampaigns:[...l.connectedCampaigns,campaignId]};return l;}));
    updCamp(campaignId,{landingPageId:lpId||undefined});
  };
  const filtered=campaigns.filter(c=>{
    if(search&&!c.title.toLowerCase().includes(search.toLowerCase())&&!c.product.toLowerCase().includes(search.toLowerCase()))return false;
    if(filters.stage&&STAGES.find(s=>s.label===filters.stage)?.id!==c.stage)return false;
    if(filters.product&&c.product!==filters.product)return false;
    if(filters.priority){const mp:Record<string,Priority>={"Alta":"high","Média":"medium","Baixa":"low"};if(mp[filters.priority]!==c.priority)return false;}
    if(filters.responsible&&!c.responsible.some(r=>r.name===filters.responsible))return false;
    return true;
  });
  const activeFCount=Object.values(filters).filter(Boolean).length;
  const mainNav:{id:SideView;icon:React.ElementType;label:string;badge?:number}[]=[
    {id:"dashboard",icon:BarChart3,label:"Overview"},
    {id:"kanban",icon:Kanban,label:"Campanhas",badge:campaigns.filter(c=>c.stage==="no-ar").length},
    {id:"landingpages",icon:Globe,label:"Landing Pages",badge:lps.filter(l=>l.status==="no-ar").length},
  ];
  const pageTitle:{[k in SideView]:{label:string;icon:React.ElementType}}={
    dashboard:{label:"Overview",icon:BarChart3},
    kanban:{label:"Campanhas",icon:Kanban},
    landingpages:{label:"Landing Pages",icon:Globe},
    settings:{label:"Configurações",icon:Settings},
  };
  const PageIcon=pageTitle[sideView].icon;
  return(
    <div className="flex h-screen bg-slate-50 font-['Inter'] text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-200/60">
            <Zap className="h-4 w-4 text-white"/>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">Aceleraí</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ads Operations</p>
          </div>
        </div>
        {/* Main nav */}
        <nav className="flex flex-col gap-0.5 px-3 py-3 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-300 px-2 py-1.5 mt-1 mb-0.5">Principal</p>
          {mainNav.map(item=>(
            <button key={item.id} onClick={()=>{setSideView(item.id);if(item.id!=="kanban")setSelected(null);}}
              className={`group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-left transition-all ${sideView===item.id?"bg-indigo-50 text-indigo-700 font-semibold":"text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium"}`}>
              <item.icon className={`h-4 w-4 shrink-0 transition-colors ${sideView===item.id?"text-indigo-600":"text-slate-400 group-hover:text-slate-600"}`}/>
              <span className="flex-1">{item.label}</span>
              {item.badge!=null&&item.badge>0&&(
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${sideView===item.id?"bg-indigo-600 text-white":"bg-slate-200 text-slate-500"}`}>{item.badge}</span>
              )}
            </button>
          ))}
          <div className="my-2 border-t border-slate-100"/>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-300 px-2 py-1.5 mb-0.5">Sistema</p>
          <button onClick={()=>{setSideView("settings");setSelected(null);}}
            className={`group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-left transition-all ${sideView==="settings"?"bg-indigo-50 text-indigo-700 font-semibold":"text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium"}`}>
            <Settings className={`h-4 w-4 shrink-0 transition-colors ${sideView==="settings"?"text-indigo-600":"text-slate-400 group-hover:text-slate-600"}`}/>
            <span className="flex-1">Configurações</span>
          </button>
        </nav>
        {/* User profile */}
        <div className="border-t border-slate-100 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100 cursor-pointer transition-all">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-bold text-white">MC</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 leading-none">Marina Costa</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ads Manager</p>
            </div>
            <MoreHorizontal className="h-3.5 w-3.5 text-slate-300 shrink-0"/>
          </div>
        </div>
      </aside>
      {/* MAIN */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* TOPBAR */}
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-5 shrink-0" style={{minHeight:"56px"}}>
          {/* Left: page title + sub-nav tabs for kanban */}
          <div className="flex items-center gap-3 flex-1 min-w-0 h-full">
            <div className="flex items-center gap-2">
              <PageIcon className="h-4 w-4 text-slate-400 shrink-0"/>
              <span className="text-sm font-bold text-slate-900">{pageTitle[sideView].label}</span>
            </div>
            {sideView==="kanban"&&(
              <>
                <Separator orientation="vertical" className="h-5 bg-slate-200 mx-1"/>
                <div className="flex items-center h-full">
                  {([{id:"kanban",icon:Kanban,label:"Quadro"},{id:"list",icon:LayoutList,label:"Lista"}] as const).map(v=>(
                    <button key={v.id} onClick={()=>setViewMode(v.id as "kanban"|"list")}
                      className={`flex items-center gap-1.5 px-3 h-full text-xs font-medium border-b-2 transition-all ${viewMode===v.id?"border-indigo-500 text-indigo-600":"border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}>
                      <v.icon className="h-3.5 w-3.5"/>{v.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {sideView==="landingpages"&&(
              <>
                <Separator orientation="vertical" className="h-5 bg-slate-200 mx-1"/>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-medium text-emerald-600">{lps.filter(l=>l.status==="no-ar").length} no ar</span>
                  <span>·</span>
                  <span>{lps.filter(l=>l.status==="em-teste").length} em teste</span>
                  <span>·</span>
                  <span>{lps.filter(l=>l.status==="pausada").length} pausada(s)</span>
                </div>
              </>
            )}
          </div>
          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            {(sideView==="kanban"||sideView==="dashboard")&&(
              <>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-slate-400 shrink-0"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar campanha…" className="bg-transparent text-sm text-slate-700 placeholder:text-slate-300 outline-none w-40"/>
                  {search&&<button onClick={()=>setSearch("")}><X className="h-3 w-3 text-slate-400 hover:text-slate-600"/></button>}
                </div>
                <div className="relative">
                  <button onClick={()=>{setShowFilter(f=>!f);setShowNotif(false);}}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${activeFCount>0?"border-indigo-300 bg-indigo-50 text-indigo-600":"border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}>
                    <Filter className="h-3.5 w-3.5"/>
                    Filtrar
                    {activeFCount>0&&<span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">{activeFCount}</span>}
                  </button>
                  {showFilter&&<FilterPanel f={filters} onChange={(k,v)=>setFilters(p=>({...p,[k]:v}))} onClose={()=>setShowFilter(false)} onClear={()=>setFilters({stage:"",product:"",priority:"",responsible:""})}/>}
                </div>
              </>
            )}
            <Separator orientation="vertical" className="h-5 bg-slate-200"/>
            <button onClick={()=>setShowNew(true)} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all">
              <Plus className="h-3.5 w-3.5"/>Nova Campanha
            </button>
            <div className="relative">
              <button onClick={()=>{setShowNotif(n=>!n);setShowFilter(false);}} className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                <Bell className="h-4 w-4"/>
                {unread>0&&<span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">{unread}</span>}
              </button>
              {showNotif&&<NotifPanel items={notifs} onClose={()=>setShowNotif(false)} onMarkAll={()=>setNotifs(p=>p.map(n=>({...n,read:true})))}/>}
            </div>
          </div>
        </header>
        {/* BODY */}
        <div className="flex flex-1 min-h-0">
          {sideView==="dashboard"&&<DashboardView campaigns={campaigns} lps={lps}/>}
          {sideView==="settings"&&<SettingsView/>}
          {sideView==="landingpages"&&<LandingPagesView lps={lps} campaigns={campaigns} onAddLP={()=>{}} onEditLP={()=>{}}/>}
          {sideView==="kanban"&&<>
            {viewMode==="list"?<ListView campaigns={filtered} lps={lps} onSelect={c=>{setSelected(c);setViewMode("kanban");}}/>:
            <div className="flex flex-1 min-w-0 overflow-x-auto p-5 gap-4 bg-slate-50">
              {STAGES.map(stage=>{const cols=filtered.filter(c=>c.stage===stage.id);return<div key={stage.id} className="flex shrink-0 w-[270px] flex-col gap-3">
                <div className="flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${stage.dot}`}/><span className="text-sm font-semibold text-slate-600">{stage.label}</span><span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[11px] font-semibold text-slate-500">{cols.length}</span></div><button className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"><Plus className="h-3.5 w-3.5"/></button></div>
                <div className="flex flex-col gap-2.5">{cols.map(c=><CampaignCard key={c.id} c={c} onClick={()=>setSelected(c)} lp={lps.find(l=>l.id===c.landingPageId)}/>)}{cols.length===0&&<div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-300">Sem campanhas</div>}</div>
              </div>;})}
            </div>}
            {selected&&<DetailPanel c={selected} lps={lps} onClose={()=>setSelected(null)} onStageChange={(id,s)=>updCamp(id,{stage:s})} onDeleteRequest={()=>setShowDel(selected)} onArchiveRequest={()=>setShowArc(selected)} onBriefingEdit={()=>setShowEditB(selected)} onConnectLP={()=>setShowConnLP(selected)}/>}
          </>}
        </div>
      </div>
      {/* MODALS */}
      {showNew&&<NewCampaignModal lps={lps} onClose={()=>setShowNew(false)} onSave={c=>{setCampaigns(p=>[c,...p]);if(c.landingPageId)setLps(ls=>ls.map(l=>l.id===c.landingPageId?{...l,connectedCampaigns:[...l.connectedCampaigns,c.id]}:l));}}/>}
      {showEditB&&<EditBriefingModal campaign={showEditB} onClose={()=>setShowEditB(null)} onSave={b=>updCamp(showEditB.id,{briefingData:b,briefingFilled:!!(b.objetivo&&b.publico)})}/>}
      {showConnLP&&<ConnectLPModal campaign={showConnLP} lps={lps} onClose={()=>setShowConnLP(null)} onSave={lpId=>connectLP(showConnLP.id,lpId)}/>}
      {showDel&&<ConfirmModal title="Excluir campanha" message={`Excluir "${showDel.title}"? Esta ação não pode ser desfeita.`} danger confirmLabel="Excluir" onClose={()=>setShowDel(null)} onConfirm={()=>{setCampaigns(p=>p.filter(c=>c.id!==showDel.id));if(selected?.id===showDel.id)setSelected(null);}}/>}
      {showArc&&<ConfirmModal title="Arquivar campanha" message={`Arquivar "${showArc.title}"? Ela sairá do Kanban mas ficará no histórico.`} confirmLabel="Arquivar" onClose={()=>setShowArc(null)} onConfirm={()=>updCamp(showArc.id,{stage:"encerrado"})}/>}
    </div>
  );
}
