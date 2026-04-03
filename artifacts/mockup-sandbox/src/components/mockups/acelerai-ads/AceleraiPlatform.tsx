import { useState } from "react";
import {
  Zap, LayoutDashboard, Kanban, Settings, Bell, Search, Plus, MoreHorizontal,
  ChevronRight, Copy, Check, X, Target, Users, CalendarDays, Link2, FileText,
  AlertCircle, CheckCircle2, Clock, TrendingUp, Layers, BookOpen, RefreshCw,
  ArrowUpRight, Filter, SortAsc, Image, MessageSquare, Paperclip, Star,
  ChevronDown, ExternalLink, Edit3, Trash2, Archive, Flag, DollarSign,
  BarChart3, Eye, Play, Pause, Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Stage = "briefing" | "criacao" | "revisao" | "aprovado" | "no-ar" | "pausado" | "encerrado";

interface TeamMember { id: string; name: string; initials: string; color: string; }
interface Campaign {
  id: string; title: string; product: string; objective: string; campaignType: string;
  period: string; budget: string; stage: Stage; priority: "high" | "medium" | "low";
  dueDate: string; responsible: TeamMember[]; tags: string[];
  campaignName: string; adSetName: string; adName: string;
  briefingFilled: boolean; checklistDone: number; checklistTotal: number;
  comments: number; attachments: number;
}

type SideView = "dashboard" | "kanban" | "settings";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const TEAM: Record<string, TeamMember> = {
  marina: { id: "marina", name: "Marina", initials: "M", color: "bg-violet-500" },
  pedro: { id: "pedro", name: "Pedro", initials: "P", color: "bg-sky-500" },
  joana: { id: "joana", name: "Joana", initials: "J", color: "bg-emerald-500" },
  thiago: { id: "thiago", name: "Thiago", initials: "T", color: "bg-amber-500" },
};

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "c1", title: "Black Friday – Captação", product: "Aceleraí", objective: "Captação de Leads",
    campaignType: "Black Friday", period: "Q4 2026", budget: "R$ 12.000", stage: "no-ar",
    priority: "high", dueDate: "Nov 29", responsible: [TEAM.marina, TEAM.pedro], tags: ["bf2026", "captacao"],
    campaignName: "ACELERAI_CAPTACAO_BLACK-FRIDAY_Q4-2026",
    adSetName: "ACELERAI_CAPTACAO_BLACK-FRIDAY_Q4-2026_COLD-LOOKALIKE-1%",
    adName: "ACELERAI_CAPTACAO_BLACK-FRIDAY_Q4-2026_COLD-LOOKALIKE-1%_VIDEO-30S",
    briefingFilled: true, checklistDone: 9, checklistTotal: 10, comments: 8, attachments: 4,
  },
  {
    id: "c2", title: "Lançamento Mentoria Elite", product: "Mentoria Elite", objective: "Conversão",
    campaignType: "Lançamento", period: "Q3 2026", budget: "R$ 8.500", stage: "aprovado",
    priority: "high", dueDate: "Out 15", responsible: [TEAM.joana], tags: ["lancamento", "mentoria"],
    campaignName: "MENTORIA_CONVERSAO_LANCAMENTO_Q3-2026",
    adSetName: "MENTORIA_CONVERSAO_LANCAMENTO_Q3-2026_WARM-ENGAJADOS-30D",
    adName: "MENTORIA_CONVERSAO_LANCAMENTO_Q3-2026_WARM-ENGAJADOS-30D_CARROSSEL",
    briefingFilled: true, checklistDone: 10, checklistTotal: 10, comments: 12, attachments: 7,
  },
  {
    id: "c3", title: "Evergreen Pro – Conversão", product: "Aceleraí Pro", objective: "Conversão",
    campaignType: "Evergreen", period: "Q2 2026", budget: "R$ 5.000", stage: "revisao",
    priority: "medium", dueDate: "Set 30", responsible: [TEAM.thiago, TEAM.marina], tags: ["evergreen", "pro"],
    campaignName: "ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026",
    adSetName: "ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026_HOT-LEADS",
    adName: "ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026_HOT-LEADS_VIDEO-15S",
    briefingFilled: true, checklistDone: 6, checklistTotal: 10, comments: 5, attachments: 2,
  },
  {
    id: "c4", title: "Reengajamento Novembro", product: "Aceleraí", objective: "Reengajamento",
    campaignType: "Novembro Negro", period: "Q4 2026", budget: "R$ 3.200", stage: "criacao",
    priority: "medium", dueDate: "Nov 10", responsible: [TEAM.pedro], tags: ["reengajamento"],
    campaignName: "ACELERAI_REENGAJAMENTO_NOV-NEGRO_Q4-2026",
    adSetName: "ACELERAI_REENGAJAMENTO_NOV-NEGRO_Q4-2026_HOT-ABANDONO",
    adName: "ACELERAI_REENGAJAMENTO_NOV-NEGRO_Q4-2026_HOT-ABANDONO_STORIES",
    briefingFilled: true, checklistDone: 0, checklistTotal: 10, comments: 3, attachments: 1,
  },
  {
    id: "c5", title: "Oferta Relâmpago Imersão", product: "Imersão Intensiva", objective: "Conversão",
    campaignType: "Oferta Relâmpago", period: "Q3 2026", budget: "R$ 2.000", stage: "briefing",
    priority: "low", dueDate: "Set 20", responsible: [TEAM.joana, TEAM.thiago], tags: ["oferta", "imersao"],
    campaignName: "",
    adSetName: "",
    adName: "",
    briefingFilled: false, checklistDone: 0, checklistTotal: 10, comments: 1, attachments: 0,
  },
  {
    id: "c6", title: "Awareness Aceleraí Q3", product: "Aceleraí", objective: "Awareness",
    campaignType: "Evergreen", period: "Q3 2026", budget: "R$ 4.000", stage: "pausado",
    priority: "low", dueDate: "Ago 31", responsible: [TEAM.marina], tags: ["awareness"],
    campaignName: "ACELERAI_AWARENESS_EVERGREEN_Q3-2026",
    adSetName: "ACELERAI_AWARENESS_EVERGREEN_Q3-2026_COLD-INTERESSE",
    adName: "ACELERAI_AWARENESS_EVERGREEN_Q3-2026_COLD-INTERESSE_REELS",
    briefingFilled: true, checklistDone: 7, checklistTotal: 10, comments: 2, attachments: 3,
  },
];

const STAGES: { id: Stage; label: string; color: string; dot: string; bg: string }[] = [
  { id: "briefing",  label: "Briefing",   color: "text-slate-400",  dot: "bg-slate-400",  bg: "bg-slate-400/10" },
  { id: "criacao",   label: "Em Criação", color: "text-blue-400",   dot: "bg-blue-400",   bg: "bg-blue-400/10" },
  { id: "revisao",   label: "Em Revisão", color: "text-amber-400",  dot: "bg-amber-400",  bg: "bg-amber-400/10" },
  { id: "aprovado",  label: "Aprovado",   color: "text-violet-400", dot: "bg-violet-400", bg: "bg-violet-400/10" },
  { id: "no-ar",     label: "No Ar",      color: "text-emerald-400",dot: "bg-emerald-400",bg: "bg-emerald-400/10" },
  { id: "pausado",   label: "Pausado",    color: "text-orange-400", dot: "bg-orange-400", bg: "bg-orange-400/10" },
  { id: "encerrado", label: "Encerrado",  color: "text-zinc-500",   dot: "bg-zinc-500",   bg: "bg-zinc-500/10" },
];

const CHECKLIST_ITEMS = [
  { id: "nome-campanha", label: "Nome da campanha gerado e copiado" },
  { id: "nome-conjunto", label: "Nome do conjunto de anúncios copiado" },
  { id: "nome-anuncio", label: "Nome do anúncio copiado" },
  { id: "utm-configurado", label: "URL Parameters configurados no Meta Ads" },
  { id: "url-testada", label: "URL com UTM testada e verificada no GA4" },
  { id: "pixel-verificado", label: "Pixel disparando corretamente na LP" },
  { id: "lp-revisada", label: "Landing page revisada e sem erros" },
  { id: "orcamento-definido", label: "Orçamento definido e revisado" },
  { id: "agendamento-correto", label: "Data e horário de início corretos" },
  { id: "revisao-final", label: "Revisão final antes de publicar" },
];

const BRIEFING_FIELDS = [
  { label: "Objetivo Principal", value: "Captar leads qualificados para o funil de vendas do produto Aceleraí, com custo por lead abaixo de R$ 18." },
  { label: "Público-alvo", value: "Empreendedores e profissionais liberais de 28–45 anos, que já tentaram escalar o negócio e não conseguiram. Interessados em marketing digital." },
  { label: "Proposta de Valor", value: "Sistema completo para escalar vendas online sem depender de sorte ou feeling." },
  { label: "Tom de Voz", value: "Direto, empático e orientado a resultado. Sem promessas mirabolantes." },
  { label: "Referências de Copy", value: "VSL do lançamento Q2 converteu 3,2%. Usar estrutura: problema → agitação → solução." },
  { label: "Criativos Necessários", value: "3 variações de vídeo (30s, 15s, Stories), 2 carrosséis, 4 imagens estáticas." },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Avatar({ member, size = "sm" }: { member: TeamMember; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <div className={`${s} ${member.color} flex items-center justify-center rounded-full font-bold text-white ring-2 ring-[#0F1117]`}>
      {member.initials}
    </div>
  );
}

function PriorityBadge({ p }: { p: Campaign["priority"] }) {
  const map = { high: "text-red-400", medium: "text-amber-400", low: "text-slate-400" };
  const labels = { high: "Alta", medium: "Média", low: "Baixa" };
  return <Flag className={`h-3 w-3 ${map[p]}`} title={labels[p]} />;
}

function StagePill({ stage }: { stage: Stage }) {
  const s = STAGES.find((st) => st.id === stage)!;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.bg} ${s.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{label}</span>
      <div onClick={copy} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.07] bg-[#0A0C13]/60 px-3 py-2.5 hover:border-[#6B7CFF]/30 transition-all group">
        <span className="flex-1 font-mono text-xs text-white/70 break-all leading-relaxed">{value || <span className="text-white/20 italic">Ainda não gerado</span>}</span>
        {value && (
          <button className="shrink-0 rounded p-1 text-white/20 group-hover:text-[#6B7CFF] transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const checkPct = Math.round((campaign.checklistDone / campaign.checklistTotal) * 100);
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-white/[0.07] bg-[#14161F] p-4 hover:border-white/[0.14] hover:bg-[#181B27] transition-all flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/90 leading-tight line-clamp-2">{campaign.title}</p>
          <p className="mt-0.5 text-xs text-white/35">{campaign.product}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <PriorityBadge p={campaign.priority} />
          <button className="rounded p-1 text-white/20 opacity-0 group-hover:opacity-100 hover:text-white/60 transition-all" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[#6B7CFF]/10 px-2 py-0.5 text-[10px] font-medium text-[#8B9DFF]">
          {campaign.objective}
        </span>
        {campaign.tags.map((t) => (
          <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/35">#{t}</span>
        ))}
      </div>

      {/* Naming status */}
      {campaign.campaignName ? (
        <div className="rounded-lg border border-white/[0.05] bg-[#0A0C13]/50 px-2.5 py-2">
          <p className="font-mono text-[10px] text-white/40 truncate">{campaign.campaignName}</p>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2">
          <AlertCircle className="h-3 w-3 text-amber-400 shrink-0" />
          <p className="text-[10px] text-amber-400/70">Nomenclatura não gerada</p>
        </div>
      )}

      {/* Checklist progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">Checklist</span>
          <span className="text-[10px] font-medium text-white/40">{campaign.checklistDone}/{campaign.checklistTotal}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full transition-all ${checkPct === 100 ? "bg-emerald-500" : checkPct > 50 ? "bg-violet-500" : "bg-slate-500"}`}
            style={{ width: `${checkPct}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {campaign.responsible.map((m) => <Avatar key={m.id} member={m} />)}
        </div>
        <div className="flex items-center gap-3 text-white/25">
          <span className="flex items-center gap-1 text-[11px]">
            <MessageSquare className="h-3 w-3" />{campaign.comments}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Paperclip className="h-3 w-3" />{campaign.attachments}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Clock className="h-3 w-3" />{campaign.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── KANBAN COLUMN ────────────────────────────────────────────────────────────

function KanbanColumn({ stage, campaigns, onCardClick, onMove }: {
  stage: typeof STAGES[0]; campaigns: Campaign[];
  onCardClick: (c: Campaign) => void;
  onMove: (id: string, direction: "left" | "right") => void;
}) {
  const stageIdx = STAGES.findIndex(s => s.id === stage.id);
  return (
    <div className="flex shrink-0 w-[290px] flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${stage.dot}`} />
          <span className="text-sm font-semibold text-white/70">{stage.label}</span>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/[0.07] px-1.5 text-[11px] font-medium text-white/40">
            {campaigns.length}
          </span>
        </div>
        <button className="rounded-lg p-1 text-white/20 hover:bg-white/5 hover:text-white/50 transition-all">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
        {campaigns.map((c) => (
          <div key={c.id} className="relative group/move">
            <CampaignCard campaign={c} onClick={() => onCardClick(c)} />
            {/* Move arrows on hover */}
            <div className="absolute -bottom-1 left-0 right-0 flex justify-between opacity-0 group-hover/move:opacity-100 transition-opacity px-2">
              {stageIdx > 0 && (
                <button onClick={(e) => { e.stopPropagation(); onMove(c.id, "left"); }}
                  className="flex items-center gap-0.5 rounded-full bg-[#0F1117] border border-white/10 px-2 py-0.5 text-[10px] text-white/30 hover:text-white/60 hover:border-white/20 transition-all">
                  ← {STAGES[stageIdx - 1].label}
                </button>
              )}
              {stageIdx < STAGES.length - 1 && (
                <button onClick={(e) => { e.stopPropagation(); onMove(c.id, "right"); }}
                  className="ml-auto flex items-center gap-0.5 rounded-full bg-[#0F1117] border border-white/10 px-2 py-0.5 text-[10px] text-white/30 hover:text-white/60 hover:border-white/20 transition-all">
                  {STAGES[stageIdx + 1].label} →
                </button>
              )}
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/[0.06] text-xs text-white/20">
            Sem campanhas
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────

type DetailTab = "briefing" | "nomenclatura" | "utms" | "checklist" | "criativos";

function DetailPanel({ campaign, onClose, onStageChange }: {
  campaign: Campaign;
  onClose: () => void;
  onStageChange: (id: string, stage: Stage) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("briefing");
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    CHECKLIST_ITEMS.slice(0, campaign.checklistDone).forEach(i => { s[i.id] = true; });
    return s;
  });

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "briefing", label: "Briefing" },
    { id: "nomenclatura", label: "Nomenclatura" },
    { id: "utms", label: "UTMs & Links" },
    { id: "checklist", label: "Checklist" },
    { id: "criativos", label: "Criativos" },
  ];

  const checklistProgress = CHECKLIST_ITEMS.filter(i => checklistState[i.id]).length;

  const utmSource = "meta";
  const utmMedium = "cpc";
  const utmCampaign = campaign.campaignName.toLowerCase();
  const utmContent = campaign.adName.toLowerCase();
  const metaUrlParams = campaign.campaignName
    ? `utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
    : "";
  const fullUrl = campaign.campaignName
    ? `https://acelerai.com.br/lp?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}`
    : "";

  return (
    <div className="flex h-full w-[480px] shrink-0 flex-col border-l border-white/[0.07] bg-[#0F1117]">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4 border-b border-white/[0.06]">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <StagePill stage={campaign.stage} />
            <PriorityBadge p={campaign.priority} />
          </div>
          <h2 className="text-base font-bold text-white leading-tight">{campaign.title}</h2>
          <p className="text-xs text-white/35 mt-0.5">{campaign.product} · {campaign.period} · {campaign.budget}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white/70 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Stage mover */}
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {STAGES.map((s, idx) => {
            const currentIdx = STAGES.findIndex(st => st.id === campaign.stage);
            const isActive = s.id === campaign.stage;
            const isPast = idx < currentIdx;
            return (
              <button
                key={s.id}
                onClick={() => onStageChange(campaign.id, s.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  isActive ? `${s.bg} ${s.color}` : isPast ? "text-white/25 hover:bg-white/5" : "text-white/20 hover:bg-white/5"
                }`}
              >
                {isPast && <Check className="h-2.5 w-2.5" />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] px-5 gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 py-3 px-2 text-xs font-medium border-b-2 transition-all ${
              tab === t.id
                ? "border-[#6B7CFF] text-[#8B9DFF]"
                : "border-transparent text-white/35 hover:text-white/60"
            }`}
          >
            {t.label}
            {t.id === "checklist" && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${checklistProgress === CHECKLIST_ITEMS.length ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.07] text-white/30"}`}>
                {checklistProgress}/{CHECKLIST_ITEMS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* BRIEFING */}
        {tab === "briefing" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Briefing da Campanha</p>
              <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/30 hover:bg-white/5 hover:text-white/60 transition-all">
                <Edit3 className="h-3 w-3" /> Editar
              </button>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Produto", value: campaign.product },
                { label: "Objetivo", value: campaign.objective },
                { label: "Tipo de Campanha", value: campaign.campaignType },
                { label: "Período", value: campaign.period },
                { label: "Budget Total", value: campaign.budget },
                { label: "Prazo", value: campaign.dueDate },
              ].map((f) => (
                <div key={f.label} className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
                  <p className="text-[10px] text-white/30 mb-1">{f.label}</p>
                  <p className="text-sm font-medium text-white/80">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Responsible */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
              <p className="text-[10px] text-white/30 mb-2">Responsáveis</p>
              <div className="flex items-center gap-2">
                {campaign.responsible.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5">
                    <Avatar member={m} size="md" />
                    <span className="text-sm text-white/70">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Briefing fields */}
            {campaign.briefingFilled ? (
              <div className="flex flex-col gap-3">
                {BRIEFING_FIELDS.map((f) => (
                  <div key={f.label} className="rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
                    <p className="text-[10px] font-medium text-white/30 mb-1.5">{f.label}</p>
                    <p className="text-xs text-white/65 leading-relaxed">{f.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/5 p-8 text-center">
                <AlertCircle className="h-6 w-6 text-amber-400/60" />
                <div>
                  <p className="text-sm font-medium text-amber-400/80">Briefing não preenchido</p>
                  <p className="text-xs text-white/30 mt-1">Preencha o briefing antes de prosseguir com a criação.</p>
                </div>
                <button className="rounded-xl bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/25 transition-all">
                  Preencher Briefing
                </button>
              </div>
            )}
          </div>
        )}

        {/* NOMENCLATURA */}
        {tab === "nomenclatura" && (
          <div className="flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Nomenclatura Padronizada</p>

            {campaign.campaignName ? (
              <>
                <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#6B7CFF]" />
                    <span className="text-xs font-semibold text-white/40">Campanha</span>
                  </div>
                  <CopyField label="Nome da Campanha" value={campaign.campaignName} />
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-violet-400" />
                    <span className="text-xs font-semibold text-white/40">Conjunto de Anúncios</span>
                  </div>
                  <CopyField label="Nome do Conjunto" value={campaign.adSetName} />
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-white/40">Anúncio</span>
                  </div>
                  <CopyField label="Nome do Anúncio" value={campaign.adName} />
                </div>

                <div className="rounded-2xl border border-[#6B7CFF]/15 bg-[#6B7CFF]/5 p-3 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#6B7CFF] shrink-0 mt-0.5" />
                  <p className="text-xs text-white/40 leading-relaxed">
                    Nomenclatura gerada automaticamente seguindo o padrão <span className="text-white/60 font-mono">PRODUTO_OBJETIVO_CAMPANHA_PERÍODO</span>. Copie e cole diretamente no Meta Ads Manager.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <Hash className="h-8 w-8 text-white/15" />
                <div>
                  <p className="text-sm font-medium text-white/50">Nomenclatura não gerada</p>
                  <p className="text-xs text-white/25 mt-1">Complete o briefing para gerar os nomes padronizados.</p>
                </div>
                <button className="rounded-xl bg-[#6B7CFF]/15 px-4 py-2 text-xs font-semibold text-[#8B9DFF] hover:bg-[#6B7CFF]/25 transition-all flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Gerar Nomenclatura
                </button>
              </div>
            )}
          </div>
        )}

        {/* UTMs */}
        {tab === "utms" && (
          <div className="flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/25">UTM Parameters & Links</p>

            {campaign.campaignName ? (
              <>
                <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-4">
                  <p className="text-xs font-semibold text-sky-400/70 flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" /> Parâmetros para o Meta Ads
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { k: "utm_source", v: "meta" },
                      { k: "utm_medium", v: "cpc" },
                      { k: "utm_campaign", v: "{{campaign.name}}" },
                      { k: "utm_content", v: "{{ad.name}}" },
                    ].map((p) => (
                      <div key={p.k} className="rounded-lg border border-white/[0.05] bg-[#0F1117]/60 p-2.5">
                        <p className="text-[10px] text-white/25 mb-0.5">{p.k}</p>
                        <p className="font-mono text-xs text-white/70">{p.v}</p>
                      </div>
                    ))}
                  </div>
                  <CopyField label="URL Parameters (colar no campo do Meta Ads)" value={metaUrlParams} />
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-emerald-400/70 flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" /> URL Final com UTMs
                  </p>
                  <CopyField label="URL completa para teste e verificação" value={fullUrl} />
                  <button className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2.5 text-xs text-white/40 hover:border-emerald-500/20 hover:text-emerald-400 transition-all">
                    <ExternalLink className="h-3.5 w-3.5" /> Testar URL no navegador
                  </button>
                </div>

                <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-400/70 leading-relaxed">
                    Lembrete: cole os URL Parameters no campo específico do Meta Ads (não na URL final). As variáveis <span className="font-mono">{"{{campaign.name}}"}</span> são preenchidas automaticamente pelo Meta.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <Link2 className="h-8 w-8 text-white/15" />
                <p className="text-sm font-medium text-white/50">UTMs não disponíveis</p>
                <p className="text-xs text-white/25">Gere a nomenclatura primeiro para criar os UTMs automáticos.</p>
              </div>
            )}
          </div>
        )}

        {/* CHECKLIST */}
        {tab === "checklist" && (
          <div className="flex flex-col gap-5">
            {/* Progress */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0A0C13]/60 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/40">Progresso de Publicação</p>
                <span className="text-xs font-bold text-white">{checklistProgress}<span className="text-white/30">/{CHECKLIST_ITEMS.length}</span></span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] transition-all duration-500"
                  style={{ width: `${(checklistProgress / CHECKLIST_ITEMS.length) * 100}%` }}
                />
              </div>
              {checklistProgress === CHECKLIST_ITEMS.length && (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Pronto para publicar!
                </p>
              )}
            </div>

            {/* Items */}
            <div className="flex flex-col gap-2">
              {CHECKLIST_ITEMS.map((item, idx) => {
                const checked = !!checklistState[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => setChecklistState((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                      checked ? "border-emerald-500/15 bg-emerald-500/5" : "border-white/[0.06] bg-[#0A0C13]/40 hover:border-white/[0.10]"
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${checked ? "border-emerald-500 bg-emerald-500" : "border-white/15"}`}>
                      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className={`flex-1 text-xs font-medium transition-colors leading-relaxed ${checked ? "text-white/35 line-through decoration-emerald-500/30" : "text-white/70"}`}>
                      {item.label}
                    </span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${checked ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.05] text-white/20"}`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CRIATIVOS */}
        {tab === "criativos" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Criativos</p>
              <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/30 hover:bg-white/5 hover:text-white/60 transition-all">
                <Plus className="h-3 w-3" /> Adicionar
              </button>
            </div>

            {campaign.attachments > 0 ? (
              <div className="flex flex-col gap-2.5">
                {[
                  { name: "video_30s_v1.mp4", type: "Vídeo 30s", status: "aprovado", size: "48 MB" },
                  { name: "video_15s_v1.mp4", type: "Vídeo 15s", status: "revisao", size: "22 MB" },
                  { name: "carrossel_bf_v2.zip", type: "Carrossel", status: "aprovado", size: "12 MB" },
                  { name: "static_imagem_1.jpg", type: "Imagem Estática", status: "briefing", size: "3.2 MB" },
                ].slice(0, campaign.attachments).map((a) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    aprovado: { label: "Aprovado", color: "text-emerald-400 bg-emerald-500/10" },
                    revisao: { label: "Em Revisão", color: "text-amber-400 bg-amber-500/10" },
                    briefing: { label: "Aguardando", color: "text-slate-400 bg-slate-500/10" },
                  };
                  const s = statusMap[a.status];
                  return (
                    <div key={a.name} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0A0C13]/50 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Image className="h-4 w-4 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/70 truncate">{a.name}</p>
                        <p className="text-[10px] text-white/30">{a.type} · {a.size}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.color}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.07] p-10 text-center">
                <Image className="h-8 w-8 text-white/15" />
                <div>
                  <p className="text-sm font-medium text-white/50">Nenhum criativo anexado</p>
                  <p className="text-xs text-white/25 mt-1">Adicione vídeos, imagens e carrosséis.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-white/[0.06] p-4 flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#6B7CFF]/15 py-2.5 text-xs font-semibold text-[#8B9DFF] hover:bg-[#6B7CFF]/25 transition-all">
          <ArrowUpRight className="h-3.5 w-3.5" /> Abrir no Meta Ads
        </button>
        <button className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] px-3 py-2.5 text-xs text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
          <Archive className="h-3.5 w-3.5" />
        </button>
        <button className="flex items-center gap-1.5 rounded-xl border border-red-500/15 px-3 py-2.5 text-xs text-red-400/60 hover:border-red-500/30 hover:text-red-400 transition-all">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD VIEW ────────────────────────────────────────────────────────────

function DashboardView({ campaigns }: { campaigns: Campaign[] }) {
  const active = campaigns.filter(c => c.stage === "no-ar").length;
  const pending = campaigns.filter(c => ["briefing","criacao","revisao"].includes(c.stage)).length;
  const approved = campaigns.filter(c => c.stage === "aprovado").length;
  const totalBudget = "R$ 34.700";

  const stats = [
    { label: "Campanhas No Ar", value: active, icon: Play, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Em Produção", value: pending, icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Aprovadas p/ Publicar", value: approved, icon: CheckCircle2, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Budget Total Ativo", value: totalBudget, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-sm text-white/35 mt-0.5">Visão geral das operações de tráfego pago.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-4 flex flex-col gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/35 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-white/70">Pipeline por Estágio</p>
          <div className="flex flex-col gap-2.5">
            {STAGES.map((s) => {
              const count = campaigns.filter(c => c.stage === s.id).length;
              const pct = campaigns.length > 0 ? (count / campaigns.length) * 100 : 0;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-white/40">{s.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${s.dot} transition-all`} style={{ width: `${pct}%`, opacity: 0.8 }} />
                  </div>
                  <span className="w-4 shrink-0 text-xs font-medium text-white/40 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-white/70">Campanhas Recentes</p>
          <div className="flex flex-col gap-2">
            {campaigns.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${STAGES.find(s => s.id === c.stage)?.dot}`} />
                <span className="flex-1 text-xs text-white/60 truncate">{c.title}</span>
                <StagePill stage={c.stage} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-[#14161F] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white/70">Checklist Status</p>
          <span className="text-xs text-white/30">{campaigns.filter(c => c.checklistDone === c.checklistTotal).length} prontas para publicar</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {campaigns.filter(c => c.stage !== "encerrado").map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs text-white/50 truncate">{c.title}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${c.checklistDone === c.checklistTotal ? "bg-emerald-500" : "bg-[#6B7CFF]"}`}
                  style={{ width: `${(c.checklistDone / c.checklistTotal) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[11px] text-white/35">{c.checklistDone}/{c.checklistTotal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function AceleraiPlatform() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [sideView, setSideView] = useState<SideView>("kanban");
  const [search, setSearch] = useState("");

  const moveCard = (id: string, direction: "left" | "right") => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STAGES.findIndex((s) => s.id === c.stage);
        const newIdx = direction === "left" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= STAGES.length) return c;
        return { ...c, stage: STAGES[newIdx].id };
      })
    );
    if (selectedCampaign?.id === id) {
      const camp = campaigns.find(c => c.id === id)!;
      const idx = STAGES.findIndex(s => s.id === camp.stage);
      const newIdx = direction === "left" ? idx - 1 : idx + 1;
      if (newIdx >= 0 && newIdx < STAGES.length) {
        setSelectedCampaign({ ...camp, stage: STAGES[newIdx].id });
      }
    }
  };

  const handleStageChange = (id: string, stage: Stage) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
    if (selectedCampaign?.id === id) setSelectedCampaign(prev => prev ? { ...prev, stage } : prev);
  };

  const filteredCampaigns = campaigns.filter(
    (c) => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase())
  );

  const navItems: { id: SideView; icon: React.ElementType; label: string }[] = [
    { id: "dashboard", icon: BarChart3, label: "Overview" },
    { id: "kanban", icon: Kanban, label: "Kanban" },
  ];

  return (
    <div className="flex h-screen bg-[#0A0C13] font-['Inter'] text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="flex w-16 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#0A0C13] py-4 gap-1">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B7CFF] to-[#A78BFF]">
          <Zap className="h-4.5 w-4.5 text-white" />
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSideView(item.id)}
            title={item.label}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              sideView === item.id ? "bg-[#6B7CFF]/15 text-[#8B9DFF]" : "text-white/25 hover:bg-white/5 hover:text-white/60"
            }`}
          >
            <item.icon className="h-4.5 w-4.5" />
          </button>
        ))}

        <div className="mt-auto flex flex-col items-center gap-1">
          <button title="Configurações" className="flex h-10 w-10 items-center justify-center rounded-xl text-white/20 hover:bg-white/5 hover:text-white/50 transition-all">
            <Settings className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6B7CFF] to-[#A78BFF] flex items-center justify-center text-[11px] font-bold">
            M
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* TOP BAR */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3 bg-[#0A0C13] shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-sm font-bold text-white">Aceleraí</span>
              <span className="ml-1.5 text-sm text-white/30">Ads Ops</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-white/[0.08]" />
            <span className="text-sm text-white/50">{sideView === "kanban" ? "Kanban" : "Overview"}</span>
          </div>

          <div className="flex items-center gap-2">
            {sideView === "kanban" && (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0F1117]/60 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-white/25" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar campanha..."
                    className="bg-transparent text-sm text-white/70 placeholder:text-white/25 outline-none w-44"
                  />
                </div>
                <button className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
                  <Filter className="h-3.5 w-3.5" /> Filtrar
                </button>
                <button className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-white/40 hover:border-white/[0.14] hover:text-white/60 transition-all">
                  <SortAsc className="h-3.5 w-3.5" /> Ordenar
                </button>
              </>
            )}
            <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-[#6B7CFF]/20 hover:opacity-90 transition-all">
              <Plus className="h-3.5 w-3.5" /> Nova Campanha
            </button>
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/5 hover:text-white/60 transition-all">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#6B7CFF]" />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex flex-1 min-h-0">
          {sideView === "dashboard" && <DashboardView campaigns={campaigns} />}

          {sideView === "kanban" && (
            <>
              {/* KANBAN BOARD */}
              <div className={`flex flex-1 min-w-0 overflow-x-auto p-5 gap-4 ${selectedCampaign ? "max-w-none" : ""}`}>
                {STAGES.map((stage) => (
                  <KanbanColumn
                    key={stage.id}
                    stage={stage}
                    campaigns={filteredCampaigns.filter((c) => c.stage === stage.id)}
                    onCardClick={(c) => setSelectedCampaign(c)}
                    onMove={moveCard}
                  />
                ))}
              </div>

              {/* DETAIL PANEL */}
              {selectedCampaign && (
                <DetailPanel
                  campaign={selectedCampaign}
                  onClose={() => setSelectedCampaign(null)}
                  onStageChange={handleStageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
