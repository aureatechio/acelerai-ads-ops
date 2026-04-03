import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Copy,
  CheckCircle2,
  ClipboardList,
  History,
  ChevronRight,
  AlertCircle,
  LayoutDashboard,
  Layers,
  Target,
  Users,
  CalendarDays,
  Link2,
  FileText,
  ExternalLink,
  RefreshCw,
  Check,
  Clock,
  TrendingUp,
  BookOpen,
} from "lucide-react";

// ─── CONFIG DATA ────────────────────────────────────────────────────────────

const PRODUCTS = [
  { value: "acelerai", label: "Aceleraí" },
  { value: "acelerai-pro", label: "Aceleraí Pro" },
  { value: "mentoria", label: "Mentoria Elite" },
  { value: "imersao", label: "Imersão Intensiva" },
];

const OBJECTIVES = [
  { value: "captacao", label: "Captação de Leads" },
  { value: "conversao", label: "Conversão" },
  { value: "retencao", label: "Retenção" },
  { value: "reengajamento", label: "Reengajamento" },
  { value: "awarenes", label: "Awareness" },
];

const CAMPAIGNS = [
  { value: "black-friday", label: "Black Friday" },
  { value: "lancamento", label: "Lançamento" },
  { value: "evergreen", label: "Evergreen" },
  { value: "liquidacao", label: "Liquidação" },
  { value: "novembro-negro", label: "Novembro Negro" },
  { value: "oferta-relampago", label: "Oferta Relâmpago" },
];

const PERIODS = [
  { value: "q1-2026", label: "Q1 2026" },
  { value: "q2-2026", label: "Q2 2026" },
  { value: "q3-2026", label: "Q3 2026" },
  { value: "q4-2026", label: "Q4 2026" },
  { value: "mai-2026", label: "Mai 2026" },
  { value: "jun-2026", label: "Jun 2026" },
  { value: "jul-2026", label: "Jul 2026" },
  { value: "ago-2026", label: "Ago 2026" },
];

const AUDIENCES = [
  { value: "cold-lookalike", label: "Cold – Lookalike 1%" },
  { value: "cold-interesse", label: "Cold – Interesse Amplo" },
  { value: "warm-pagina", label: "Warm – Visitantes Página" },
  { value: "warm-engajados", label: "Warm – Engajados 30d" },
  { value: "hot-leads", label: "Hot – Leads Não Comprados" },
  { value: "hot-abandonos", label: "Hot – Abandono de Carrinho" },
  { value: "retargeting-video", label: "Retargeting – Vídeo 75%" },
];

const AD_FORMATS = [
  { value: "video-15s", label: "Vídeo 15s" },
  { value: "video-30s", label: "Vídeo 30s" },
  { value: "carrossel", label: "Carrossel" },
  { value: "imagem-unica", label: "Imagem Única" },
  { value: "stories", label: "Stories" },
  { value: "reels", label: "Reels" },
];

const LANDING_PAGES = [
  { value: "lp-principal", label: "LP Principal" },
  { value: "lp-captacao", label: "LP Captação" },
  { value: "lp-vendas", label: "LP Vendas" },
  { value: "lp-webinar", label: "LP Webinar" },
  { value: "lp-teste-ab", label: "LP Teste A/B" },
];

const CHECKLIST_ITEMS = [
  { id: "nome-campanha", label: "Nome da campanha gerado e copiado", icon: FileText },
  { id: "nome-conjunto", label: "Nome do conjunto de anúncios copiado", icon: Layers },
  { id: "nome-anuncio", label: "Nome do anúncio copiado", icon: Target },
  { id: "utm-configurado", label: "URL Parameters configurados no Meta Ads", icon: Link2 },
  { id: "url-testada", label: "URL com UTM testada (clicar e conferir GA4)", icon: ExternalLink },
  { id: "pixel-verificado", label: "Pixel do Facebook disparando na LP", icon: Zap },
  { id: "lp-revisada", label: "Landing page revisada (link correto, sem erros)", icon: BookOpen },
  { id: "orcamento-definido", label: "Orçamento definido e revisado", icon: TrendingUp },
  { id: "agendamento-correto", label: "Data/horário de início correto", icon: CalendarDays },
  { id: "revisao-final", label: "Revisão final antes de publicar", icon: CheckCircle2 },
];

const HISTORY_ITEMS = [
  {
    id: 1,
    product: "Aceleraí",
    campaign: "Black Friday",
    period: "Q4 2026",
    audience: "Cold – Lookalike 1%",
    campaignName: "ACELERAI_CAPTACAO_BLACK-FRIDAY_Q4-2026",
    createdAt: "Hoje, 14:22",
    status: "ativo",
  },
  {
    id: 2,
    product: "Mentoria Elite",
    campaign: "Lançamento",
    period: "Q3 2026",
    audience: "Warm – Engajados 30d",
    campaignName: "MENTORIA_CONVERSAO_LANCAMENTO_Q3-2026",
    createdAt: "Ontem, 10:05",
    status: "pausado",
  },
  {
    id: 3,
    product: "Aceleraí Pro",
    campaign: "Evergreen",
    period: "Q2 2026",
    audience: "Hot – Leads Não Comprados",
    campaignName: "ACELERAI-PRO_CONVERSAO_EVERGREEN_Q2-2026",
    createdAt: "2 dias atrás",
    status: "encerrado",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function slugify(val: string): string {
  return val.toUpperCase().replace(/\s+/g, "-");
}

function generateNames(form: FormState) {
  if (!form.product || !form.objective || !form.campaign || !form.period || !form.audience || !form.adFormat) {
    return null;
  }

  const prod = slugify(PRODUCTS.find((p) => p.value === form.product)?.label ?? form.product);
  const obj = slugify(OBJECTIVES.find((o) => o.value === form.objective)?.label ?? form.objective);
  const camp = slugify(CAMPAIGNS.find((c) => c.value === form.campaign)?.label ?? form.campaign);
  const period = form.period.toUpperCase();
  const aud = slugify(AUDIENCES.find((a) => a.value === form.audience)?.label ?? form.audience);
  const fmt = slugify(AD_FORMATS.find((f) => f.value === form.adFormat)?.label ?? form.adFormat);

  const campaignName = `${prod}_${obj}_${camp}_${period}`;
  const adSetName = `${prod}_${obj}_${camp}_${period}_${aud}`;
  const adName = `${prod}_${obj}_${camp}_${period}_${aud}_${fmt}`;

  const utmSource = "meta";
  const utmMedium = "cpc";
  const utmCampaign = campaignName.toLowerCase();
  const utmContent = adName.toLowerCase();

  const lpBase = form.landingPage
    ? LANDING_PAGES.find((l) => l.value === form.landingPage)?.label ?? "https://acelerai.com.br/"
    : "https://acelerai.com.br/";

  const urlWithUtm = `https://acelerai.com.br/lp?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}`;
  const metaUrlParams = `utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`;

  return { campaignName, adSetName, adName, urlWithUtm, metaUrlParams, lpBase };
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FormState {
  product: string;
  objective: string;
  campaign: string;
  period: string;
  audience: string;
  adFormat: string;
  landingPage: string;
}

type Tab = "generator" | "history" | "checklist";

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="group flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7CFF]/70">{label}</span>
      <div
        className={`flex items-center gap-2 rounded-xl border border-white/10 bg-[#0F1117]/60 px-4 py-3 transition-all hover:border-[#6B7CFF]/40 hover:bg-[#0F1117]/90 cursor-pointer ${
          mono ? "font-mono" : ""
        }`}
        onClick={handleCopy}
      >
        <span className="flex-1 text-sm text-white/90 break-all leading-relaxed">{value}</span>
        <button
          className="ml-2 shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-[#6B7CFF]/20 hover:text-[#6B7CFF]"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon: React.ElementType;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 rounded-xl border-white/10 bg-[#0F1117]/60 text-white/80 text-sm focus:border-[#6B7CFF]/60 focus:ring-[#6B7CFF]/20 hover:border-white/20 transition-all">
          <SelectValue placeholder={<span className="text-white/30">{placeholder}</span>} />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-[#181B27] text-white">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-white/80 focus:bg-[#6B7CFF]/20 focus:text-white">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    ativo: { label: "Ativo", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
    pausado: { label: "Pausado", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20" },
    encerrado: { label: "Encerrado", color: "bg-white/10 text-white/40 border-white/10" },
  };
  const s = map[status] ?? map.encerrado;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function AceleraiPlatform() {
  const [activeTab, setActiveTab] = useState<Tab>("generator");
  const [form, setForm] = useState<FormState>({
    product: "",
    objective: "",
    campaign: "",
    period: "",
    audience: "",
    adFormat: "",
    landingPage: "",
  });
  const [generated, setGenerated] = useState<ReturnType<typeof generateNames>>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [hasGenerated, setHasGenerated] = useState(false);

  const updateForm = (key: keyof FormState) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setGenerated(null);
    setHasGenerated(false);
  };

  const handleGenerate = () => {
    const result = generateNames(form);
    setGenerated(result);
    setHasGenerated(true);
  };

  const allFieldsFilled = Object.values(form).filter((_, i) => i < 6).every(Boolean) && 
    form.product && form.objective && form.campaign && form.period && form.audience && form.adFormat;

  const checklistProgress = CHECKLIST_ITEMS.filter((item) => checklistState[item.id]).length;
  const checklistPercent = Math.round((checklistProgress / CHECKLIST_ITEMS.length) * 100);

  const navItems: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "generator", label: "Gerador", icon: Zap },
    { id: "history", label: "Histórico", icon: History, badge: HISTORY_ITEMS.length },
    { id: "checklist", label: "Checklist", icon: ClipboardList, badge: checklistProgress < CHECKLIST_ITEMS.length ? CHECKLIST_ITEMS.length - checklistProgress : undefined },
  ];

  return (
    <div className="min-h-screen bg-[#0A0C13] font-['Inter'] text-white flex flex-col">
      {/* TOP NAV */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0A0C13]/95 px-6 py-3.5 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6B7CFF] to-[#A78BFF]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">Aceleraí</span>
            <span className="ml-1.5 text-sm font-normal text-white/30">Ads Ops</span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-[#6B7CFF]/15 text-[#8B9DFF]"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.badge !== undefined && item.badge > 0 && activeTab !== item.id && (
                <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#6B7CFF]/30 px-1 text-[10px] font-semibold text-[#8B9DFF]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#6B7CFF] to-[#A78BFF] flex items-center justify-center text-[11px] font-bold">
            M
          </div>
          <span className="text-sm text-white/40">Marina</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">

        {/* ── GENERATOR TAB ── */}
        {activeTab === "generator" && (
          <div className="mx-auto max-w-[1100px] px-6 py-8 flex flex-col gap-8">
            {/* Page title */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Gerador de Nomenclatura</h1>
                <p className="mt-1 text-sm text-white/40">
                  Selecione as opções abaixo — nomes e UTMs são gerados automaticamente, sem digitação.
                </p>
              </div>
              <button
                onClick={() => {
                  setForm({ product: "", objective: "", campaign: "", period: "", audience: "", adFormat: "", landingPage: "" });
                  setGenerated(null);
                  setHasGenerated(false);
                }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white/30 hover:bg-white/5 hover:text-white/60 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Limpar
              </button>
            </div>

            <div className="grid grid-cols-12 gap-5">
              {/* LEFT: form */}
              <div className="col-span-5 flex flex-col gap-4">
                <div className="rounded-2xl border border-white/[0.07] bg-[#0F1117]/80 p-5 flex flex-col gap-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Configuração da Campanha
                  </p>

                  <SelectField
                    label="Produto"
                    placeholder="Selecione o produto"
                    icon={BookOpen}
                    options={PRODUCTS}
                    value={form.product}
                    onChange={updateForm("product")}
                  />
                  <SelectField
                    label="Objetivo"
                    placeholder="Selecione o objetivo"
                    icon={Target}
                    options={OBJECTIVES}
                    value={form.objective}
                    onChange={updateForm("objective")}
                  />
                  <SelectField
                    label="Campanha"
                    placeholder="Selecione a campanha"
                    icon={Layers}
                    options={CAMPAIGNS}
                    value={form.campaign}
                    onChange={updateForm("campaign")}
                  />
                  <SelectField
                    label="Período"
                    placeholder="Selecione o período"
                    icon={CalendarDays}
                    options={PERIODS}
                    value={form.period}
                    onChange={updateForm("period")}
                  />

                  <Separator className="bg-white/[0.06]" />

                  <p className="text-xs font-semibold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Conjunto de Anúncios
                  </p>

                  <SelectField
                    label="Público"
                    placeholder="Selecione o público"
                    icon={Users}
                    options={AUDIENCES}
                    value={form.audience}
                    onChange={updateForm("audience")}
                  />
                  <SelectField
                    label="Formato do Anúncio"
                    placeholder="Selecione o formato"
                    icon={FileText}
                    options={AD_FORMATS}
                    value={form.adFormat}
                    onChange={updateForm("adFormat")}
                  />
                  <SelectField
                    label="Landing Page"
                    placeholder="Selecione a LP (opcional)"
                    icon={Link2}
                    options={LANDING_PAGES}
                    value={form.landingPage}
                    onChange={updateForm("landingPage")}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!allFieldsFilled}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] text-sm font-semibold text-white shadow-lg shadow-[#6B7CFF]/20 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Gerar Nomenclatura Padronizada
                </Button>

                {!allFieldsFilled && (
                  <p className="text-center text-xs text-white/25 flex items-center justify-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Preencha todos os campos obrigatórios
                  </p>
                )}
              </div>

              {/* RIGHT: output */}
              <div className="col-span-7 flex flex-col gap-4">
                {!hasGenerated && (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0F1117]/40 p-12 text-center gap-4 min-h-[400px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6B7CFF]/10">
                      <Zap className="h-6 w-6 text-[#6B7CFF]/60" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/50">Os nomes gerados aparecem aqui</p>
                      <p className="mt-1 text-xs text-white/25">Selecione os campos à esquerda e clique em Gerar</p>
                    </div>
                  </div>
                )}

                {hasGenerated && !generated && (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8 gap-3 min-h-[200px]">
                    <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
                    <p className="text-sm text-yellow-400/80">Preencha todos os campos para gerar a nomenclatura.</p>
                  </div>
                )}

                {generated && (
                  <div className="flex flex-col gap-5">
                    {/* Campaign */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0F1117]/80 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#6B7CFF]" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Campanha</p>
                      </div>
                      <CopyField label="Nome da Campanha" value={generated.campaignName} />
                    </div>

                    {/* Ad Set */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0F1117]/80 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#A78BFF]" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Conjunto de Anúncios</p>
                      </div>
                      <CopyField label="Nome do Conjunto" value={generated.adSetName} />
                    </div>

                    {/* Ad */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0F1117]/80 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Anúncio</p>
                      </div>
                      <CopyField label="Nome do Anúncio" value={generated.adName} />
                    </div>

                    {/* UTMs */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0F1117]/80 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-sky-400" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">UTM Parameters</p>
                      </div>
                      <CopyField label="URL Parameters (colar no Meta Ads)" value={generated.metaUrlParams} />
                      <CopyField label="URL Completa com UTM" value={generated.urlWithUtm} mono={false} />
                    </div>

                    {/* CTA Checklist */}
                    <button
                      onClick={() => setActiveTab("checklist")}
                      className="flex items-center justify-between rounded-2xl border border-[#6B7CFF]/20 bg-[#6B7CFF]/10 px-5 py-4 text-sm font-medium text-[#8B9DFF] hover:bg-[#6B7CFF]/15 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <ClipboardList className="h-4 w-4" />
                        Ir para o Checklist de Publicação
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="mx-auto max-w-[1100px] px-6 py-8 flex flex-col gap-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Histórico</h1>
              <p className="mt-1 text-sm text-white/40">Nomenclaturas geradas pelo time de marketing.</p>
            </div>

            <div className="flex flex-col gap-3">
              {HISTORY_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-white/[0.07] bg-[#0F1117]/80 p-5 flex items-start justify-between hover:border-white/[0.12] transition-all cursor-pointer"
                >
                  <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={item.status} />
                      <span className="text-[11px] text-white/30 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.createdAt}
                      </span>
                    </div>
                    <div className="font-mono text-sm text-white/80 bg-[#0A0C13]/50 rounded-lg px-3 py-2 border border-white/[0.05]">
                      {item.campaignName}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <BookOpen className="h-3 w-3" /> {item.product}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Layers className="h-3 w-3" /> {item.campaign}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <CalendarDays className="h-3 w-3" /> {item.period}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <Users className="h-3 w-3" /> {item.audience}
                      </span>
                    </div>
                  </div>
                  <button
                    className="ml-4 shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white/30 hover:bg-white/5 hover:text-white/60 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => navigator.clipboard.writeText(item.campaignName).catch(() => {})}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHECKLIST TAB ── */}
        {activeTab === "checklist" && (
          <div className="mx-auto max-w-[700px] px-6 py-8 flex flex-col gap-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Checklist de Publicação</h1>
                <p className="mt-1 text-sm text-white/40">Confirme cada etapa antes de publicar a campanha.</p>
              </div>
              <button
                onClick={() => setChecklistState({})}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white/30 hover:bg-white/5 hover:text-white/60 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reiniciar
              </button>
            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0F1117]/80 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">Progresso</span>
                <span className="text-sm font-bold text-white">
                  {checklistProgress}
                  <span className="text-white/30">/{CHECKLIST_ITEMS.length}</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6B7CFF] to-[#A78BFF] transition-all duration-500"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
              {checklistPercent === 100 && (
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Tudo pronto! Campanha pode ser publicada.
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex flex-col gap-2">
              {CHECKLIST_ITEMS.map((item, idx) => {
                const checked = !!checklistState[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setChecklistState((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                      checked
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-white/[0.07] bg-[#0F1117]/80 hover:border-white/[0.12] hover:bg-[#0F1117]"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        checked ? "border-emerald-500 bg-emerald-500" : "border-white/20"
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <item.icon className={`h-4 w-4 shrink-0 ${checked ? "text-emerald-400/60" : "text-white/25"}`} />
                      <span
                        className={`text-sm font-medium transition-colors ${
                          checked ? "text-white/40 line-through decoration-emerald-500/40" : "text-white/80"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-medium rounded-full px-2 py-0.5 ${
                        checked ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/25"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
