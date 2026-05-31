'use client';

import {
  Page,
} from '@/components/ui/page-layout';

/* eslint-disable no-magic-numbers */

import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@summoniq/applab-ui';
import { ChevronRight, Copy, RefreshCw, Sparkles } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';
import { toast } from 'sonner';

import { UpworkEmbeddedBrowser } from '@/components/runtime/upwork-embedded-browser';
import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from '@/components/ui/animated-tabs';
import { auditUpworkListing } from '@/lib/scraping/upwork-audit';
import { UpworkGuideLayout } from './components/upwork-guide-layout';

type BudgetType = 'hourly' | 'fixed';
type Tone = 'consultative' | 'direct' | 'friendly' | 'technical';

type FormState = {
  jobUrl: string;
  budgetType: BudgetType;
  budget: string;
  targetRate: string;
  estimatedHours: string;
  timeline: string;
  offer: string;
  proof: string;
  tone: Tone;
};

type Generated = {
  mode: 'ai' | 'template';
  proposal: string;
  bid: string;
  questions: string[];
  milestones: string[];
  highlights: string[];
  warning?: string;
};

type GenerateResponse = Generated | { error: string; details?: unknown };

type UpworkExtractPayload = {
  id?: unknown;
  url?: unknown;
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  paymentVerified?: unknown;
  clientSpent?: unknown;
  proposals?: unknown;
  posted?: unknown;
  budgetLine?: unknown;
  budgetType?: unknown;
  experienceLevel?: unknown;
  budgetEstimate?: unknown;
  bids?: unknown;
  avgBid?: unknown;
  connectsRequired?: unknown;
  duration?: unknown;
  projectType?: unknown;
  location?: unknown;
  activity?: unknown;
  clientLocation?: unknown;
  clientJobsPosted?: unknown;
  clientHireRate?: unknown;
  clientHourlyRange?: unknown;
  clientAvgHourly?: unknown;
  clientTotalHires?: unknown;
  clientOpenJobs?: unknown;
  weeklyHours?: unknown;
  hourlyRange?: unknown;
  fixedPrice?: unknown;
  source?: unknown;
};

type UpworkJobDetail = {
  connectsRequired?: number;
  duration?: string;
  projectType?: string;
  location?: string;
  activity?: string;
  clientLocation?: string;
  clientJobsPosted?: number;
  clientHireRate?: string;
  clientHourlyRange?: string;
  clientAvgHourly?: string;
  clientTotalHires?: number;
  clientOpenJobs?: number;
  weeklyHours?: string;
  hourlyRange?: string;
  fixedPrice?: string;
  skills?: string[];
};

type UpworkListingItem = {
  id?: string;
  url: string;
  title: string;
  description: string;
  source?: string;
  tags?: string[];
  paymentVerified?: boolean;
  clientSpent?: string;
  proposals?: string;
  posted?: string;
  budgetLine?: string;
  budgetType?: string;
  experienceLevel?: string;
  budgetEstimate?: string;
  bids?: string;
  avgBid?: string;
  status?: string;
  matchScore?: number;
  matchReason?: string;
  isEligible?: boolean;
  detail?: UpworkJobDetail;
};

type UpworkHtmlPayload = {
  html?: unknown;
  href?: unknown;
  jobUrl?: unknown;
  manual?: unknown;
};

type UpworkJobsPayload = {
  items?: unknown;
  href?: unknown;
  auto?: unknown;
  manual?: unknown;
};

type UpworkAiExtractResponse =
  | {
      mode: 'ai' | 'template';
      items: UpworkListingItem[];
    }
  | { error: string; details?: unknown };

type UpworkDetailAiExtractResponse =
  | {
      mode: 'ai' | 'template';
      job?: Partial<UpworkListingItem>;
      detail?: UpworkJobDetail;
    }
  | { error: string; details?: unknown };

type UpworkTeam = {
  id: string;
  name: string;
};

type UpworkSkillProfile = {
  id?: string;
  teamId: string;
  displayName?: string;
  skillsText: string;
  skills: string[];
  industries: string[];
  stack?: string;
  offer?: string;
  proof?: string;
  hourlyRate?: string;
  minFixedBudget?: string;
  maxFixedBudget?: string;
  notes?: string;
};

type UpworkProposalDraft = {
  id: string;
  proposal: string;
  bid: string;
  questions: string[];
  milestones: string[];
  highlights: string[];
  status: string;
};

type ElectronSender = ((channel: string, payload?: unknown) => void) | null;

type UpworkSubmitEvent = {
  type?: unknown;
  href?: unknown;
  jobUrl?: unknown;
  message?: unknown;
  jobId?: unknown;
};

async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error('Clipboard API not available');
}

function parseNumber(value: string): number | null {
  const normalized = value.replace(/[^0-9.]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSkills(value: string): string[] {
  if (!value) return [];
  const parts = value
    .split(/[,;\n]/g)
    .map(part => part.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function hasMeaningfulValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  return value !== null && value !== undefined;
}

function hasMeaningfulDetail(job: UpworkListingItem): boolean {
  if (hasMeaningfulValue(job.description)) return true;
  if (hasMeaningfulValue(job.budgetLine)) return true;
  if (hasMeaningfulValue(job.budgetEstimate)) return true;
  if (hasMeaningfulValue(job.posted)) return true;
  if (hasMeaningfulValue(job.clientSpent)) return true;
  if (hasMeaningfulValue(job.proposals)) return true;
  if (hasMeaningfulValue(job.bids)) return true;
  if (hasMeaningfulValue(job.avgBid)) return true;
  if (hasMeaningfulValue(job.experienceLevel)) return true;
  if (typeof job.matchScore === 'number') return true;
  if (hasMeaningfulValue(job.matchReason)) return true;
  if (!job.detail) return false;
  return Object.values(job.detail).some(hasMeaningfulValue);
}

function normalizeJobUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return trimmed.replace(/#.*$/, '').replace(/\?.*$/, '').replace(/\/$/, '');
  }
}

function isLikelyJobDetailUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname || '';
    if (!/\.upwork\.com$/i.test(parsed.hostname)) return false;
    if (path.startsWith('/nx/jobs/search')) return false;
    if (path.startsWith('/jobs/search')) return false;
    if (!path.includes('/jobs/')) return false;
    return true;
  } catch {
    return false;
  }
}

function isLikelyListingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname || '';
    if (!/\.upwork\.com$/i.test(parsed.hostname)) return false;
    if (path.startsWith('/nx/jobs/search')) return true;
    if (path.startsWith('/jobs/search')) return true;
    if (path.startsWith('/nx/search/jobs')) return true;
    if (path.startsWith('/nx/find-work')) return true;
    return false;
  } catch {
    return false;
  }
}

export function UpworkGuideClient() {
  const BEST_MATCHES_URL = 'https://www.upwork.com/nx/find-work/best-matches';
  const [teams, setTeams] = useState<UpworkTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [profile, setProfile] = useState<UpworkSkillProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<UpworkSkillProfile>({
    teamId: '',
    skillsText: '',
    skills: [],
    industries: [],
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [webviewTag, setWebviewTag] = useState<any>(null);
  const [upworkCredentials, setUpworkCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const [form, setForm] = useState<FormState>({
    jobUrl: 'https://www.upwork.com/nx/find-work/best-matches',
    budgetType: 'fixed',
    budget: '',
    targetRate: '95',
    estimatedHours: '40',
    timeline: '',
    offer: 'Discovery call + scoped plan + 1-2 week MVP',
    proof: '',
    tone: 'consultative',
  });
  const [capturedJobs, setCapturedJobs] = useState<UpworkListingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'settings'>('jobs');
  const [jobExpanded, setJobExpanded] = useState<Record<string, boolean>>({});
  const [jobGenerating, setJobGenerating] = useState<Record<string, boolean>>(
    {},
  );
  const [jobGenerated, setJobGenerated] = useState<Record<string, Generated>>(
    {},
  );
  const [jobFeedback, setJobFeedback] = useState<Record<string, string>>({});
  const [electronSend, setElectronSend] = useState<ElectronSender>(null);
  const [jobSubmitLog, setJobSubmitLog] = useState<Record<string, string[]>>(
    {},
  );
  const [jobReadyToSubmit, setJobReadyToSubmit] = useState<
    Record<string, boolean>
  >({});
  const [enrichingDetails, setEnrichingDetails] = useState(false);
  const [currentEnrichingUrl, setCurrentEnrichingUrl] = useState<string>('');
  const lastCaptureToastRef = useRef<string>('');
  const lastDetailToastRef = useRef<string>('');
  const lastEnrichToastRef = useRef<number>(0);
  const lastEnrichedUrlRef = useRef<string>('');
  const defaultTeamAttemptedRef = useRef(false);
  const detailWaitersRef = useRef(
    new Map<string, (payload: UpworkExtractPayload) => void>(),
  );
  const suppressDetailToastRef = useRef(false);

  const clearJobUiState = useCallback(() => {
    setJobExpanded({});
    setJobGenerating({});
    setJobGenerated({});
    setJobFeedback({});
    setJobSubmitLog({});
    setJobReadyToSubmit({});
    setEnrichingDetails(false);
    setCurrentEnrichingUrl('');
    lastCaptureToastRef.current = '';
    lastDetailToastRef.current = '';
    lastEnrichToastRef.current = 0;
    lastEnrichedUrlRef.current = '';
  }, []);

  const handleElectronSendReady = useCallback((sender: ElectronSender) => {
    setElectronSend((prev: ElectronSender) =>
      prev === sender ? prev : sender,
    );
  }, []);

  const captureScreenshot = useCallback(async () => {
    if (!webviewTag || typeof webviewTag.capturePage !== 'function') {
      return null;
    }
    try {
      const image = await webviewTag.capturePage();
      if (!image || typeof image.toDataURL !== 'function') return null;
      const dataUrl = image.toDataURL();
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      return { base64, mime: 'image/png' };
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [webviewTag]);

  const profileReady = useMemo(() => {
    return Boolean(profile?.skillsText?.trim() && profile?.skills?.length);
  }, [profile?.skills, profile?.skillsText]);

  const activeTeamId = useMemo(() => {
    return selectedTeamId || teams[0]?.id || '';
  }, [selectedTeamId, teams]);

  useEffect(() => {
    let mounted = true;
    async function loadTeams() {
      try {
        const res = await fetch('/api/teams');
        const data = (await res.json().catch(() => null)) as
          | UpworkTeam[]
          | null;
        if (!mounted) return;
        const nextTeams = Array.isArray(data) ? data : [];

        if (!nextTeams.length && !defaultTeamAttemptedRef.current) {
          defaultTeamAttemptedRef.current = true;
          try {
            const createRes = await fetch('/api/teams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'Personal',
                description: 'Default team for Upwork automation.',
                members: [],
              }),
            });
            const created = (await createRes
              .json()
              .catch(() => null)) as UpworkTeam | null;
            if (!mounted) return;
            if (createRes.ok && created?.id) {
              setTeams([created]);
              setSelectedTeamId(created.id);
              return;
            }
          } catch (error) {
            console.error(error);
          }
        }

        setTeams(nextTeams);
        if (!selectedTeamId && nextTeams.length) {
          setSelectedTeamId(nextTeams[0]?.id ?? '');
        }
      } catch (error) {
        console.error(error);
      }
    }
    void loadTeams();
    return () => {
      mounted = false;
    };
  }, [selectedTeamId]);

  useEffect(() => {
    if (!selectedTeamId) return;
    let mounted = true;

    async function loadProfile() {
      try {
        const res = await fetch(
          `/api/upwork/profiles?teamId=${encodeURIComponent(selectedTeamId)}`,
        );
        const data = (await res.json().catch(() => null)) as {
          profile: UpworkSkillProfile | null;
        } | null;
        if (!mounted) return;
        const nextProfile = data?.profile ?? null;
        setProfile(nextProfile);
        setProfileDraft(
          nextProfile ?? {
            teamId: selectedTeamId,
            skillsText: '',
            skills: [],
            industries: [],
          },
        );
        if (nextProfile) {
          setForm(prev => ({
            ...prev,
            offer: prev.offer?.trim() ? prev.offer : (nextProfile.offer ?? ''),
            proof: prev.proof?.trim() ? prev.proof : (nextProfile.proof ?? ''),
          }));
        }
      } catch (error) {
        console.error(error);
      }
    }

    async function loadJobs() {
      setLoadingJobs(true);
      try {
        const res = await fetch(
          `/api/upwork/jobs?teamId=${encodeURIComponent(selectedTeamId)}`,
        );
        const data = (await res.json().catch(() => null)) as {
          jobs: Array<
            UpworkListingItem & { proposalDrafts?: UpworkProposalDraft[] }
          >;
        } | null;
        if (!mounted) return;
        const jobs = Array.isArray(data?.jobs) ? data?.jobs : [];
        setCapturedJobs(jobs);

        const nextGenerated: Record<string, Generated> = {};
        jobs.forEach(job => {
          const draft = job.proposalDrafts?.[0];
          if (!draft?.proposal || !draft?.bid) return;
          nextGenerated[job.url] = {
            mode: 'ai',
            proposal: draft.proposal,
            bid: draft.bid,
            questions: draft.questions ?? [],
            milestones: draft.milestones ?? [],
            highlights: draft.highlights ?? [],
          };
        });
        setJobGenerated(nextGenerated);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoadingJobs(false);
      }
    }

    void loadProfile();
    void loadJobs();
    return () => {
      mounted = false;
    };
  }, [selectedTeamId]);

  useEffect(() => {
    if (!electronSend) return;
    const api = typeof window !== 'undefined' ? window.electron : undefined;
    if (!api?.upwork?.getCredentials) return;
    let cancelled = false;
    api.upwork
      .getCredentials()
      .then((creds: { username?: string; password?: string }) => {
        if (cancelled) return;
        const username = creds?.username ?? '';
        const password = creds?.password ?? '';
        if (username && password) {
          setUpworkCredentials({ username, password });
          return;
        }
        fetch('/api/upwork/credentials')
          .then(res => (res.ok ? res.json() : Promise.reject(new Error('missing'))))
          .then((fallback: { username?: string; password?: string }) => {
            if (cancelled) return;
            setUpworkCredentials({
              username: fallback?.username ?? '',
              password: fallback?.password ?? '',
            });
          })
          .catch(() => {
            if (!cancelled) {
              setUpworkCredentials({ username: '', password: '' });
            }
          });
      })
      .catch(() => {
        if (!cancelled) {
          setUpworkCredentials({ username: '', password: '' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [electronSend]);

  const handleLoadJobDetails = useCallback(
    (job: UpworkListingItem) => {
      const normalizedUrl = normalizeJobUrl(job.url);
      if (!normalizedUrl) return;
      if (electronSend) {
        electronSend('flow:openJob', { url: normalizedUrl });
        return;
      }
      setForm(prev => ({ ...prev, jobUrl: normalizedUrl }));
    },
    [electronSend],
  );

  const handleSaveProfile = useCallback(async () => {
    const teamId = activeTeamId;
    if (!teamId) {
      toast.error('Create a team in Settings to continue.');
      return;
    }
    const skills = profileDraft.skills.length
      ? profileDraft.skills
      : parseSkills(profileDraft.skillsText);
    if (!profileDraft.skillsText.trim() || !skills.length) {
      toast.error('Add your skill profile before saving.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/upwork/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileDraft,
          teamId,
          skills,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        profile?: UpworkSkillProfile;
        error?: string;
      };
      if (!res.ok || !data?.profile) {
        throw new Error(data?.error || 'Save failed');
      }
      setProfile(data.profile);
      setProfileDraft(data.profile);
      setForm(prev => ({
        ...prev,
        offer: prev.offer?.trim()
          ? prev.offer
          : (data.profile?.offer ?? prev.offer),
        proof: prev.proof?.trim()
          ? prev.proof
          : (data.profile?.proof ?? prev.proof),
      }));
      toast.success('Skill profile saved.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  }, [activeTeamId, profileDraft]);

  const waitForJobDetails = useCallback((jobUrl: string, timeoutMs = 7000) => {
    return new Promise<void>(resolve => {
      const normalizedUrl = normalizeJobUrl(jobUrl);
      if (!normalizedUrl) {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        detailWaitersRef.current.delete(normalizedUrl);
        resolve();
      }, timeoutMs);

      detailWaitersRef.current.set(normalizedUrl, () => {
        clearTimeout(timeoutId);
        resolve();
      });
    });
  }, []);

  const enrichCapturedJobs = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!electronSend) {
        toast.error('Detail enrichment requires Electron.');
        return;
      }
      if (!activeTeamId) {
        toast.error('Create a team in Settings to continue.');
        return;
      }
      if (!capturedJobs.length) {
        toast.message('No jobs to enrich yet.');
        return;
      }

      setEnrichingDetails(true);
      setCurrentEnrichingUrl('');
      suppressDetailToastRef.current = true;
      try {
        const seen = new Set<string>();
        const targets = capturedJobs
          .filter(job => {
            if (job.status === 'FAILED') return false;
            const normalized = normalizeJobUrl(job.url);
            if (!normalized || seen.has(normalized)) return false;
            seen.add(normalized);
            const detailValues = job.detail ? Object.values(job.detail) : [];
            const hasDetail = detailValues.some(value => {
              if (Array.isArray(value)) return value.length > 0;
              return value !== undefined && value !== null && value !== '';
            });
            return !hasDetail;
          })
          .slice(0, 12);
        if (!targets.length) {
          if (!options?.silent) {
            toast.message('All captured jobs already have details.');
          }
          return;
        }
        for (const job of targets) {
          const normalized = normalizeJobUrl(job.url);
          if (!normalized || normalized === lastEnrichedUrlRef.current) {
            continue;
          }
          lastEnrichedUrlRef.current = normalized;
          setCurrentEnrichingUrl(normalized);
          handleLoadJobDetails(job);
          await waitForJobDetails(job.url, 9000);
          electronSend('flow:extractDetailHtml');
          const shot = await captureScreenshot();
          if (shot?.base64 && job.id) {
            void fetch(`/api/upwork/jobs/${job.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                method: 'DETAIL_VISION',
                screenshotBase64: shot.base64,
                screenshotMime: shot.mime,
                extracted: { note: 'screenshot-captured' },
              }),
            });
          }
          electronSend('flow:closeJob');
          await new Promise(resolve => setTimeout(resolve, 1200));
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
        if (!options?.silent) {
          const now = Date.now();
          if (now - lastEnrichToastRef.current > 15_000) {
            lastEnrichToastRef.current = now;
            toast.success(`Enriched ${targets.length} job details.`);
          }
        }
      } finally {
        suppressDetailToastRef.current = false;
        setEnrichingDetails(false);
        setCurrentEnrichingUrl('');
      }
    },
    [
      captureScreenshot,
      electronSend,
      handleLoadJobDetails,
      activeTeamId,
      waitForJobDetails,
      capturedJobs,
    ],
  );

  async function handleUpworkJobExtracted(payload: unknown) {
    const data = payload as UpworkExtractPayload | null;
    if (!data || typeof data !== 'object') {
      toast.error('Could not extract job details.');
      return;
    }

    const auto = Boolean((data as any).auto);
    const manual = Boolean((data as any).manual);
    const shouldToast = manual && !auto && !suppressDetailToastRef.current;

    const url = typeof data.url === 'string' ? data.url : '';
    const normalizedUrl = normalizeJobUrl(url);
    const title = typeof data.title === 'string' ? data.title : '';
    const description =
      typeof data.description === 'string' ? data.description : '';
    const tags = Array.isArray(data.tags)
      ? (data.tags.filter(t => typeof t === 'string') as string[])
      : [];
    const paymentVerified =
      typeof data.paymentVerified === 'boolean'
        ? data.paymentVerified
        : undefined;
    const clientSpent =
      typeof data.clientSpent === 'string' ? data.clientSpent : undefined;
    const proposals =
      typeof data.proposals === 'string' ? data.proposals : undefined;
    const posted = typeof data.posted === 'string' ? data.posted : undefined;
    const budgetLine =
      typeof data.budgetLine === 'string' ? data.budgetLine : undefined;
    const budgetType =
      typeof data.budgetType === 'string' ? data.budgetType : undefined;
    const experienceLevel =
      typeof data.experienceLevel === 'string'
        ? data.experienceLevel
        : undefined;
    const budgetEstimate =
      typeof data.budgetEstimate === 'string' ? data.budgetEstimate : undefined;
    const bids = typeof data.bids === 'string' ? data.bids : undefined;
    const avgBid = typeof data.avgBid === 'string' ? data.avgBid : undefined;
    const source = typeof data.source === 'string' ? data.source : undefined;
    const connectsRequired = toOptionalNumber(data.connectsRequired);
    const duration =
      typeof data.duration === 'string' ? data.duration : undefined;
    const projectType =
      typeof data.projectType === 'string' ? data.projectType : undefined;
    const location =
      typeof data.location === 'string' ? data.location : undefined;
    const activity =
      typeof data.activity === 'string' ? data.activity : undefined;
    const clientLocation =
      typeof data.clientLocation === 'string' ? data.clientLocation : undefined;
    const clientJobsPosted = toOptionalNumber(data.clientJobsPosted);
    const clientHireRate =
      typeof data.clientHireRate === 'string' ? data.clientHireRate : undefined;
    const clientHourlyRange =
      typeof data.clientHourlyRange === 'string'
        ? data.clientHourlyRange
        : undefined;
    const clientAvgHourly =
      typeof data.clientAvgHourly === 'string'
        ? data.clientAvgHourly
        : undefined;
    const clientTotalHires = toOptionalNumber(data.clientTotalHires);
    const clientOpenJobs = toOptionalNumber(data.clientOpenJobs);
    const weeklyHours =
      typeof data.weeklyHours === 'string' ? data.weeklyHours : undefined;
    const hourlyRange =
      typeof data.hourlyRange === 'string' ? data.hourlyRange : undefined;
    const fixedPrice =
      typeof data.fixedPrice === 'string' ? data.fixedPrice : undefined;

    if (!title && !description) {
      if (shouldToast) {
        toast.error('No job title/description found on this page.');
      }
      return;
    }

    if (normalizedUrl && detailWaitersRef.current.has(normalizedUrl)) {
      const resolve = detailWaitersRef.current.get(normalizedUrl);
      detailWaitersRef.current.delete(normalizedUrl);
      resolve?.(data);
    }

    const detailPayload: UpworkJobDetail = {
      connectsRequired,
      duration,
      projectType,
      location,
      activity,
      clientLocation,
      clientJobsPosted,
      clientHireRate,
      clientHourlyRange,
      clientAvgHourly,
      clientTotalHires,
      clientOpenJobs,
      weeklyHours,
      hourlyRange,
      fixedPrice,
      skills: tags.length ? Array.from(new Set(tags)) : undefined,
    };

    const existingJobId =
      normalizedUrl &&
      capturedJobs.find(item => normalizeJobUrl(item.url) === normalizedUrl)
        ?.id;

    if (normalizedUrl) {
      setForm(prev => ({
        ...prev,
        jobUrl: normalizedUrl || prev.jobUrl,
      }));

      setCapturedJobs(prev => {
        const existingIndex = prev.findIndex(
          item => normalizeJobUrl(item.url) === normalizedUrl,
        );
        if (existingIndex === -1) {
          if (shouldToast) {
            toast.message('Job not in list yet — capture jobs first.');
          }
          return prev;
        }

        const nextItem: UpworkListingItem = {
          id: prev[existingIndex]?.id,
          url: prev[existingIndex]?.url || normalizedUrl,
          title: title || (prev[existingIndex]?.title ?? ''),
          description: description || (prev[existingIndex]?.description ?? ''),
          source,
          tags: tags.length
            ? Array.from(new Set(tags)).slice(0, 30)
            : prev[existingIndex]?.tags,
          paymentVerified:
            typeof paymentVerified === 'boolean'
              ? paymentVerified
              : prev[existingIndex]?.paymentVerified,
          clientSpent: clientSpent || prev[existingIndex]?.clientSpent,
          proposals: proposals || prev[existingIndex]?.proposals,
          posted: posted || prev[existingIndex]?.posted,
          budgetLine: budgetLine || prev[existingIndex]?.budgetLine,
          budgetType: budgetType || prev[existingIndex]?.budgetType,
          experienceLevel:
            experienceLevel || prev[existingIndex]?.experienceLevel,
          budgetEstimate: budgetEstimate || prev[existingIndex]?.budgetEstimate,
          bids: bids || prev[existingIndex]?.bids,
          avgBid: avgBid || prev[existingIndex]?.avgBid,
          detail: {
            ...prev[existingIndex]?.detail,
            ...detailPayload,
          },
        };

        const copy = prev.slice();
        copy[existingIndex] = { ...copy[existingIndex], ...nextItem };
        return copy;
      });
    }

    if (existingJobId && activeTeamId) {
      try {
        await fetch(`/api/upwork/jobs/${existingJobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: {
              title,
              description,
              tags,
              paymentVerified,
              clientSpent,
              proposals,
              posted,
              budgetLine,
              budgetType,
              experienceLevel,
              budgetEstimate,
              bids,
              avgBid,
              status: 'DETAILS_ENRICHED',
            },
            detail: detailPayload,
            method: auto ? 'DETAIL_DOM' : 'DETAIL_DOM',
            sourceUrl: normalizedUrl,
            extracted: {
              title,
              description,
              tags,
              paymentVerified,
              clientSpent,
              proposals,
              posted,
              budgetLine,
              budgetType,
              experienceLevel,
              budgetEstimate,
              bids,
              avgBid,
              ...detailPayload,
            },
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (existingJobId && activeTeamId && profileReady) {
      try {
        const res = await fetch('/api/upwork/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: activeTeamId,
            jobId: existingJobId,
          }),
        });
        const data = (await res.json().catch(() => null)) as {
          job?: UpworkListingItem;
        } | null;
        const nextJob = data?.job;
        if (nextJob) {
          setCapturedJobs(prev =>
            prev.map(item =>
              item.id === nextJob.id ? { ...item, ...nextJob } : item,
            ),
          );
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (shouldToast && normalizedUrl) {
      const toastKey = `detail:${normalizedUrl}`;
      if (lastDetailToastRef.current !== toastKey) {
        lastDetailToastRef.current = toastKey;
        toast.success('Job details extracted.');
      }
    }
  }

  async function handleUpworkHtmlExtracted(payload: unknown) {
    const data = payload as UpworkHtmlPayload | null;
    const html =
      data && typeof data === 'object' && typeof data.html === 'string'
        ? data.html
        : '';
    const href =
      data && typeof data === 'object' && typeof data.href === 'string'
        ? data.href
        : '';
    const normalizedHref = normalizeJobUrl(href);

    if (!html) {
      toast.error('Could not read page HTML.');
      return;
    }

    if (normalizedHref && isLikelyJobDetailUrl(normalizedHref)) {
      return;
    }
    if (normalizedHref && !isLikelyListingUrl(normalizedHref)) {
      return;
    }

    const teamId = activeTeamId;
    if (!teamId) {
      return;
    }

    try {
      const json = await auditUpworkListing({
        html,
        url: normalizedHref || href,
      });

      if (!json.items.length) {
        if (data?.manual) {
          const emptyKey = `empty:${href}`;
          if (lastCaptureToastRef.current !== emptyKey) {
            lastCaptureToastRef.current = emptyKey;
            toast.error('No job posts found on this page.');
          }
        }
        return;
      }

      const persisted = await fetch('/api/upwork/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          items: json.items,
          replace: Boolean(data?.manual),
          method: 'LISTING_AI',
          sourceUrl: normalizedHref || href,
          html,
        }),
      });
      const persistedJson = (await persisted.json().catch(() => null)) as {
        jobs?: UpworkListingItem[];
      } | null;
      const nextJobs: UpworkListingItem[] = Array.isArray(persistedJson?.jobs)
        ? persistedJson?.jobs
        : json.items;

      if (data?.manual) {
        clearJobUiState();
      }

      setCapturedJobs(prev => {
        const existingByUrl = new Map(
          prev.map(item => [item.url, item] as const),
        );
        const merged = nextJobs.map(next => {
          const existing = existingByUrl.get(next.url);
          return existing ? { ...existing, ...next } : next;
        });

        if (data?.manual) {
          return merged;
        }

        const mergedUrls = new Set(merged.map(item => item.url));
        const carry = prev.filter(item => !mergedUrls.has(item.url));
        return [...merged, ...carry];
      });
      if (data?.manual) {
        const toastKey = `${normalizedHref || href}:${json.items.length}`;
        if (lastCaptureToastRef.current !== toastKey) {
          lastCaptureToastRef.current = toastKey;
          toast.success(`Captured ${json.items.length} job posts.`);
        }
      }
      setActiveTab('jobs');
      if (data?.manual && electronSend && json.items.length) {
        setTimeout(() => {
          void enrichCapturedJobs({ silent: true });
        }, 400);
      }
    } catch (error) {
      console.error(error);
      if (data?.manual) {
        toast.error('AI extraction failed.');
      }
    }
  }

  async function handleUpworkDetailHtmlExtracted(payload: unknown) {
    const data = payload as UpworkHtmlPayload | null;
    const html =
      data && typeof data === 'object' && typeof data.html === 'string'
        ? data.html
        : '';
    const href =
      data && typeof data === 'object' && typeof data.href === 'string'
        ? data.href
        : '';
    const jobUrl =
      data && typeof data === 'object' && typeof data.jobUrl === 'string'
        ? data.jobUrl
        : '';
    const normalizedHref = normalizeJobUrl(
      jobUrl || href || currentEnrichingUrl,
    );

    if (!html || !normalizedHref) {
      return;
    }
    if (
      !jobUrl &&
      !currentEnrichingUrl &&
      !isLikelyJobDetailUrl(normalizedHref)
    ) {
      return;
    }

    const existingJob = capturedJobs.find(
      item => normalizeJobUrl(item.url) === normalizedHref,
    );
    if (!existingJob?.id || !activeTeamId) {
      return;
    }

    const loweredHtml = html.toLowerCase();
    if (
      loweredHtml.includes('job is no longer available') ||
      loweredHtml.includes('no longer available')
    ) {
      const updatedId = existingJob.id;
      setCapturedJobs(prev =>
        prev.map(item =>
          item.id === updatedId ? { ...item, status: 'FAILED' } : item,
        ),
      );
      try {
        await fetch(`/api/upwork/jobs/${updatedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: { status: 'FAILED' },
            method: 'DETAIL_AI',
            sourceUrl: normalizedHref,
            error: 'Job no longer available',
          }),
        });
      } catch (error) {
        console.error(error);
      }
      return;
    }

    try {
      const res = await fetch('/api/upwork-guide/extract-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedHref, html }),
      });
      const json = (await res
        .json()
        .catch(() => null)) as UpworkDetailAiExtractResponse | null;

      if (!res.ok || !json || 'error' in json) {
        throw new Error(
          (json && 'error' in json && json.error) ||
            `Extract failed: ${res.status}`,
        );
      }

      const jobUpdate = json.job ?? {};
      const detailUpdate = json.detail ?? {};
      const hasExtractedDetail = hasMeaningfulValue(jobUpdate)
        ? Object.values(jobUpdate).some(hasMeaningfulValue)
        : false;
      const hasExtractedDetailFields =
        Object.values(detailUpdate).some(hasMeaningfulValue);
      if (!hasExtractedDetail && !hasExtractedDetailFields) {
        const updatedId = existingJob.id;
        setCapturedJobs(prev =>
          prev.map(item =>
            item.id === updatedId ? { ...item, status: 'FAILED' } : item,
          ),
        );
        await fetch(`/api/upwork/jobs/${updatedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: { status: 'FAILED' },
            method: 'DETAIL_AI',
            sourceUrl: normalizedHref,
            error: 'Detail extraction returned no usable fields',
          }),
        });
        return;
      }

      await fetch(`/api/upwork/jobs/${existingJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: jobUpdate,
          detail: detailUpdate,
          method: 'DETAIL_AI',
          sourceUrl: normalizedHref,
          html,
          extracted: { job: jobUpdate, detail: detailUpdate },
        }),
      });

      setCapturedJobs(prev =>
        prev.map(item =>
          item.id === existingJob.id
            ? {
                ...item,
                ...jobUpdate,
                detail: { ...item.detail, ...detailUpdate },
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      if (existingJob?.id) {
        const updatedId = existingJob.id;
        setCapturedJobs(prev =>
          prev.map(item =>
            item.id === updatedId ? { ...item, status: 'FAILED' } : item,
          ),
        );
        try {
          await fetch(`/api/upwork/jobs/${updatedId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              job: { status: 'FAILED' },
              method: 'DETAIL_AI',
              sourceUrl: normalizedHref,
              error:
                error instanceof Error
                  ? error.message
                  : 'Detail extraction failed',
            }),
          });
        } catch (patchError) {
          console.error(patchError);
        }
      }
    }
  }

  async function handleUpworkJobsExtracted(payload: unknown) {
    const data = payload as UpworkJobsPayload | null;
    const items =
      data && typeof data === 'object' && Array.isArray(data.items)
        ? (data.items as unknown[])
        : [];

    const normalized: UpworkListingItem[] = items
      .map(item => {
        if (!item || typeof item !== 'object') return null;
        const it = item as Record<string, unknown>;
        const url = typeof it.url === 'string' ? it.url : '';
        const normalizedUrl = normalizeJobUrl(url);
        const title = typeof it.title === 'string' ? it.title : '';
        const description =
          typeof it.description === 'string' ? it.description : '';
        if (!normalizedUrl || !title) return null;

        const tags = Array.isArray(it.tags)
          ? (it.tags.filter(t => typeof t === 'string') as string[])
          : undefined;

        return {
          url: normalizedUrl,
          title,
          description,
          source: typeof it.source === 'string' ? it.source : undefined,
          tags:
            tags && tags.length
              ? Array.from(new Set(tags)).slice(0, 30)
              : undefined,
          paymentVerified:
            typeof it.paymentVerified === 'boolean'
              ? it.paymentVerified
              : undefined,
          clientSpent:
            typeof it.clientSpent === 'string' ? it.clientSpent : undefined,
          proposals:
            typeof it.proposals === 'string' ? it.proposals : undefined,
          posted: typeof it.posted === 'string' ? it.posted : undefined,
          budgetLine:
            typeof it.budgetLine === 'string' ? it.budgetLine : undefined,
          budgetType:
            typeof it.budgetType === 'string' ? it.budgetType : undefined,
          experienceLevel:
            typeof it.experienceLevel === 'string'
              ? it.experienceLevel
              : undefined,
          budgetEstimate:
            typeof it.budgetEstimate === 'string'
              ? it.budgetEstimate
              : undefined,
          bids: typeof it.bids === 'string' ? it.bids : undefined,
          avgBid: typeof it.avgBid === 'string' ? it.avgBid : undefined,
        };
      })
      .filter(Boolean) as UpworkListingItem[];

    if (!normalized.length) return;
    const teamId = activeTeamId;
    if (!teamId) return;

    try {
      const persisted = await fetch('/api/upwork/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          items: normalized,
          method: 'LISTING_DOM',
          sourceUrl: typeof data?.href === 'string' ? data?.href : undefined,
        }),
      });
      const persistedJson = (await persisted.json().catch(() => null)) as {
        jobs?: UpworkListingItem[];
      } | null;
      const nextJobs = Array.isArray(persistedJson?.jobs)
        ? persistedJson?.jobs
        : normalized;

      setCapturedJobs(prev => {
        const existingByUrl = new Map(
          prev.map(item => [normalizeJobUrl(item.url), item] as const),
        );
        const merged = nextJobs.map(next => {
          const existing = existingByUrl.get(normalizeJobUrl(next.url));
          return existing ? { ...existing, ...next } : next;
        });

        if (data?.manual) {
          return merged;
        }

        const mergedUrls = new Set(
          merged.map(item => normalizeJobUrl(item.url)),
        );
        const carry = prev.filter(
          item => !mergedUrls.has(normalizeJobUrl(item.url)),
        );
        return [...merged, ...carry];
      });
    } catch (error) {
      console.error(error);
    }
  }

  function handleUpworkSubmitEvent(payload: unknown) {
    const data = payload as UpworkSubmitEvent | null;
    const type =
      data && typeof data === 'object' && typeof data.type === 'string'
        ? data.type
        : '';
    const href =
      data && typeof data === 'object' && typeof data.href === 'string'
        ? data.href
        : '';
    const jobUrl =
      data && typeof data === 'object' && typeof data.jobUrl === 'string'
        ? data.jobUrl
        : '';
    const jobId =
      data && typeof data === 'object' && typeof data.jobId === 'string'
        ? data.jobId
        : '';
    const message =
      data && typeof data === 'object' && typeof data.message === 'string'
        ? data.message
        : '';

    const key = jobUrl || jobId || href;
    if (!key) return;

    const line = message ? `${type}: ${message}` : type;
    if (!line) return;

    setJobSubmitLog(prev => {
      const next = Array.isArray(prev[key]) ? prev[key].slice(-20) : [];
      next.push(line);
      return { ...prev, [key]: next };
    });

    if (type === 'done') {
      toast.success('Proposal submitted.');
      setJobReadyToSubmit(prev => ({ ...prev, [key]: false }));
      if (jobId) {
        void fetch(`/api/upwork/jobs/${jobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: { status: 'SUBMITTED' } }),
        });
      }
    }
    if (type === 'error') {
      toast.error(message || 'Submit failed.');
      setJobReadyToSubmit(prev => ({ ...prev, [key]: false }));
      if (jobId) {
        void fetch(`/api/upwork/jobs/${jobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job: { status: 'FAILED' } }),
        });
      }
    }
    if (type === 'ready') {
      toast.message('Proposal ready for confirmation.');
      setJobReadyToSubmit(prev => ({ ...prev, [key]: true }));
    }

    if (jobId && type === 'ready') {
      void fetch(`/api/upwork/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: { status: 'READY_TO_SUBMIT' } }),
      });
    }
  }

  const computedBid = useMemo(() => {
    const rate = parseNumber(form.targetRate);
    const hours = parseNumber(form.estimatedHours);
    if (form.budgetType === 'hourly') {
      return rate ? `$${rate}/hr` : 'Hourly (based on scope)';
    }
    if (rate && hours) {
      const subtotal = Math.round(rate * hours);
      return `$${subtotal.toLocaleString()} fixed (est. ${hours}h @ $${rate}/hr)`;
    }
    return 'Fixed (estimate based on scope)';
  }, [form.budgetType, form.estimatedHours, form.targetRate]);

  async function generateForJob(job: UpworkListingItem, feedback?: string) {
    if (!job.url) return;
    const teamId = activeTeamId;
    if (!teamId) {
      toast.error('Create a team in Settings to continue.');
      return;
    }
    if (!profileReady) {
      toast.error('Add your skill profile before generating.');
      return;
    }
    if (!job.title?.trim() || !job.description?.trim()) {
      toast.error('Job title/description missing. Load job details first.');
      return;
    }
    setJobGenerating(prev => ({ ...prev, [job.url]: true }));
    try {
      const profileSkills = profile?.skillsText || '';
      const offer = profile?.offer ?? form.offer;
      const proof = profile?.proof ?? form.proof;
      const res = await fetch('/api/upwork-guide/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          jobId: job.id,
          jobUrl: job.url,
          jobTitle: job.title,
          jobDescription: job.description,
          skills: profileSkills,
          budgetType: form.budgetType,
          budget: form.budget,
          targetRate: form.targetRate,
          estimatedHours: form.estimatedHours,
          timeline: form.timeline,
          offer,
          proof,
          tone: form.tone,
          feedback: feedback ?? '',
        }),
      });
      const data = (await res
        .json()
        .catch(() => null)) as GenerateResponse | null;

      if (!res.ok || !data || 'error' in data) {
        throw new Error(
          (data && 'error' in data && data.error) ||
            `Generate failed: ${res.status}`,
        );
      }

      setJobGenerated(prev => ({ ...prev, [job.url]: data }));
      toast.success('Generated proposal draft.');
      if (data.warning) {
        toast.message(data.warning);
      }
    } catch (error) {
      console.error(error);
      toast.error('Generation failed.');
    } finally {
      setJobGenerating(prev => ({ ...prev, [job.url]: false }));
    }
  }

  async function handleCopy(text: string) {
    try {
      await copyToClipboard(text);
      toast.success('Copied to clipboard.');
    } catch (error) {
      console.error(error);
      toast.error('Copy failed. Select the text and copy manually.');
    }
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const handleStartAutomation = useCallback(() => {
    if (!electronSend) {
      toast.error('Automation requires the Electron app.');
      return;
    }
    const username = upworkCredentials?.username ?? '';
    const password = upworkCredentials?.password ?? '';
    if (!username || !password) {
      toast.error('Add UPWORK_USERNAME and UPWORK_PASSWORD to .env first.');
      return;
    }
    setForm(prev => ({ ...prev, jobUrl: BEST_MATCHES_URL }));
    electronSend('flow:ensureUpworkSession', {
      username,
      password,
      targetUrl: BEST_MATCHES_URL,
    });
    setTimeout(() => {
      electronSend('flow:extractAll');
    }, 3000);
  }, [electronSend, upworkCredentials, BEST_MATCHES_URL]);

  const handleAuditListing = useCallback(() => {
    if (!electronSend) {
      toast.error('Automation requires the Electron app.');
      return;
    }
    electronSend('flow:extractAll');
  }, [electronSend]);

  return (
    <Page className="h-full overflow-hidden! overflow-x-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="mx-auto flex h-full w-full min-w-0 max-w-[1680px] flex-col gap-3 px-4 py-4 overflow-auto overflow-x-hidden">
          <UpworkGuideLayout
            title="Upwork Automation"
            activeSectionId="jobs"
            sections={[]}
            leftPane={
              <div className="flex h-[calc(100vh-160px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40">
                <div className="flex min-h-0 flex-1 flex-col p-2">
                  <div className="flex min-h-0 flex-1 flex-col">
                    <UpworkEmbeddedBrowser
                      initialUrl={form.jobUrl}
                      className="min-h-0 flex-1"
                      onUpworkJobExtracted={handleUpworkJobExtracted}
                      onUpworkJobsExtracted={handleUpworkJobsExtracted}
                      onUpworkHtmlExtracted={handleUpworkHtmlExtracted}
                      onUpworkDetailHtmlExtracted={
                        handleUpworkDetailHtmlExtracted
                      }
                      onUpworkSubmitEvent={handleUpworkSubmitEvent}
                      onElectronSendReady={handleElectronSendReady}
                      onWebviewReady={setWebviewTag}
                    />
                  </div>
                </div>
              </div>
            }
            secondaryActions={
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      budget: '',
                      timeline: '',
                      proof: '',
                    }));
                    setCapturedJobs([]);
                    clearJobUiState();
                    toast.message('Form reset.');
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            }
          >
            <AnimatedTabs
              value={activeTab}
              onValueChange={value => setActiveTab(value as any)}
              className="w-full"
            >
              <AnimatedTabsList>
                <AnimatedTabsTrigger value="jobs">Jobs</AnimatedTabsTrigger>
                <AnimatedTabsTrigger value="settings">
                  Settings
                </AnimatedTabsTrigger>
              </AnimatedTabsList>

              <AnimatedTabsContent
                value="jobs"
                className="px-0"
                scrollable={false}
              >
                <Card>
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-foreground">
                        Jobs
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 shadow-sm"
                          onClick={handleStartAutomation}
                          disabled={!electronSend}
                        >
                          Start automation
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 px-3 shadow-sm"
                          onClick={handleAuditListing}
                          disabled={!electronSend}
                        >
                          Audit listing
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 shadow-sm"
                          onClick={() => void enrichCapturedJobs()}
                          disabled={
                            !electronSend || enrichingDetails || !selectedTeamId
                          }
                        >
                          <Sparkles className="h-4 w-4" />
                          {enrichingDetails ? 'Enriching…' : 'Enrich details'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent>
                    <div className="space-y-3">
                      {!selectedTeamId ? (
                        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          Select a team in Settings.
                        </div>
                      ) : !profileReady ? (
                        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          Add a skill profile in Settings. Automation only runs
                          on matching jobs.
                        </div>
                      ) : null}
                      {loadingJobs ? (
                        <div className="text-sm text-muted-foreground">
                          Loading jobs...
                        </div>
                      ) : capturedJobs.length ? (
                        <div className="rounded-xl border border-border/70 bg-muted/30 overflow-hidden">
                          {capturedJobs.map(job => {
                            const key = job.url;
                            const isOpen = jobExpanded[key];
                            const draft = jobGenerated[key];
                            const isJobGenerating = jobGenerating[key];
                            const normalizedUrl = normalizeJobUrl(job.url);
                            const detailValues = job.detail
                              ? Object.values(job.detail)
                              : [];
                            const hasDetail = hasMeaningfulDetail(job);
                            const isFailed = job.status === 'FAILED';
                            const isEnriching =
                              enrichingDetails &&
                              normalizedUrl &&
                              normalizedUrl === currentEnrichingUrl;
                            const feedback = jobFeedback[key] ?? '';
                            const submitLog = jobSubmitLog[key] ?? [];
                            const readyToSubmit = jobReadyToSubmit[key];
                            const isEligible = job.isEligible ?? false;

                            return (
                              <details
                                key={key}
                                open={isOpen}
                                onToggle={(
                                  event: SyntheticEvent<HTMLDetailsElement>,
                                ) => {
                                  const nextOpen = (
                                    event.currentTarget as HTMLDetailsElement
                                  ).open;
                                  setJobExpanded(prev => ({
                                    ...prev,
                                    [key]: nextOpen,
                                  }));
                                  if (
                                    nextOpen &&
                                    !jobGenerated[key] &&
                                    !jobGenerating[key] &&
                                    !job.isEligible &&
                                    profileReady
                                  ) {
                                    toast.message(
                                      'Job does not match your skill profile yet.',
                                    );
                                  }
                                }}
                                className="border-b border-border/60 bg-muted/10 last:border-b-0"
                              >
                                <summary className="cursor-pointer px-3 py-1.5 select-none list-none [&::-webkit-details-marker]:hidden">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <div className="flex h-6 w-6 items-center justify-center text-muted-foreground">
                                        <ChevronRight
                                          className={
                                            isOpen
                                              ? 'h-4 w-4 transition-transform rotate-90'
                                              : 'h-4 w-4 transition-transform'
                                          }
                                        />
                                      </div>
                                      <div className="min-w-0 text-sm font-medium text-foreground truncate leading-tight">
                                        {job.title}
                                      </div>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                      {isEnriching ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-200">
                                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                                          Enriching
                                        </span>
                                      ) : null}
                                      {isFailed ? (
                                        <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200">
                                          Detail error
                                        </span>
                                      ) : hasDetail ? (
                                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                                          Details captured
                                        </span>
                                      ) : (
                                        <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                                          Details pending
                                        </span>
                                      )}
                                      <span className="rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                                        {isJobGenerating
                                          ? 'Generating…'
                                          : draft
                                            ? 'Proposal ready'
                                            : 'Proposal pending'}
                                      </span>
                                    </div>
                                  </div>
                                </summary>
                                <div className="grid gap-3 px-3 pb-3">
                                  <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="text-xs font-medium text-foreground">
                                        Job details
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          className="h-6 px-2 text-[11px]"
                                          onClick={(
                                            e: SyntheticEvent<HTMLButtonElement>,
                                          ) => {
                                            e.preventDefault();
                                            handleLoadJobDetails(job);
                                          }}
                                        >
                                          Load details
                                        </Button>
                                        {job.source ? (
                                          <div>Source: {job.source}</div>
                                        ) : null}
                                        {job.url ? (
                                          <a
                                            href={job.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline underline-offset-2"
                                          >
                                            Open
                                          </a>
                                        ) : null}
                                      </div>
                                    </div>

                                    {job.paymentVerified ||
                                    job.clientSpent ||
                                    job.proposals ||
                                    job.posted ||
                                    job.experienceLevel ||
                                    job.budgetLine ||
                                    job.budgetEstimate ||
                                    typeof job.matchScore === 'number' ? (
                                      <div className="mt-2 flex flex-wrap gap-1.5">
                                        {job.paymentVerified ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-foreground">
                                            Payment verified
                                          </span>
                                        ) : null}
                                        {job.clientSpent ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            {job.clientSpent}
                                          </span>
                                        ) : null}
                                        {job.proposals ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            Proposals: {job.proposals}
                                          </span>
                                        ) : null}
                                        {job.bids ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            Bids: {job.bids}
                                          </span>
                                        ) : null}
                                        {job.avgBid ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            Avg bid: {job.avgBid}
                                          </span>
                                        ) : null}
                                        {job.posted ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            Posted {job.posted}
                                          </span>
                                        ) : null}
                                        {job.experienceLevel ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            {job.experienceLevel}
                                          </span>
                                        ) : null}
                                        {job.budgetLine ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            {job.budgetLine}
                                          </span>
                                        ) : job.budgetEstimate ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            Est. budget: {job.budgetEstimate}
                                          </span>
                                        ) : null}
                                        {typeof job.matchScore === 'number' ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            Match:{' '}
                                            {Math.round(job.matchScore * 100)}%
                                          </span>
                                        ) : null}
                                        {job.matchReason ? (
                                          <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                            {job.matchReason}
                                          </span>
                                        ) : null}
                                      </div>
                                    ) : null}

                                    {job.description ? (
                                      <div className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                                        {job.description}
                                      </div>
                                    ) : (
                                      <div className="mt-2 text-xs text-muted-foreground">
                                        No description captured.
                                      </div>
                                    )}

                                    {job.tags?.length ? (
                                      <div className="mt-2 flex flex-wrap gap-1.5">
                                        {job.tags.slice(0, 18).map((tag, index) => (
                                          <span
                                            key={`${tag}-${index}`}
                                            className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="grid gap-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="text-xs text-muted-foreground">
                                        Proposal draft
                                      </div>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={!draft?.proposal}
                                        onClick={() =>
                                          void handleCopy(draft?.proposal ?? '')
                                        }
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy
                                      </Button>
                                    </div>
                                    <Textarea
                                      value={draft?.proposal ?? ''}
                                      readOnly
                                      placeholder="Generating proposal..."
                                      className="min-h-40 text-sm"
                                    />
                                  </div>

                                  <div className="grid gap-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="text-xs text-muted-foreground">
                                        Bid
                                      </div>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled={!draft?.bid}
                                        onClick={() =>
                                          void handleCopy(draft?.bid ?? '')
                                        }
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy
                                      </Button>
                                    </div>
                                    <Input
                                      value={draft?.bid ?? ''}
                                      readOnly
                                      placeholder={computedBid}
                                      className="h-9 text-sm"
                                    />
                                  </div>

                                  <div className="grid gap-1.5">
                                    <div className="text-xs text-muted-foreground">
                                      Feedback (for regenerate)
                                    </div>
                                    <Textarea
                                      value={feedback}
                                      onChange={(
                                        event: ChangeEvent<HTMLTextAreaElement>,
                                      ) =>
                                        setJobFeedback(prev => ({
                                          ...prev,
                                          [key]: event.target.value,
                                        }))
                                      }
                                      placeholder="e.g. Make it shorter, more direct, include mention of Supabase experience"
                                      className="min-h-20 text-sm"
                                    />
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                      size="sm"
                                      disabled={
                                        isJobGenerating ||
                                        (profileReady && !isEligible)
                                      }
                                      onClick={() =>
                                        void generateForJob(job, feedback)
                                      }
                                    >
                                      <Sparkles className="h-4 w-4" />
                                      {isJobGenerating
                                        ? 'Generating...'
                                        : 'Regenerate'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={
                                        !draft?.proposal ||
                                        !draft?.bid ||
                                        !isEligible
                                      }
                                      onClick={() => {
                                        if (!electronSend) {
                                          toast.error(
                                            'Submit requires running in Electron.',
                                          );
                                          return;
                                        }
                                        setJobSubmitLog(prev => ({
                                          ...prev,
                                          [key]: [],
                                        }));
                                        setJobReadyToSubmit(prev => ({
                                          ...prev,
                                          [key]: false,
                                        }));
                                        electronSend('flow:submitProposal', {
                                          jobId: job.id,
                                          jobUrl: job.url,
                                          proposal: draft?.proposal ?? '',
                                          bid: draft?.bid ?? '',
                                          requireConfirm: true,
                                        });
                                      }}
                                    >
                                      Submit proposal
                                    </Button>
                                    {readyToSubmit ? (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          if (!electronSend) return;
                                          electronSend('flow:confirmSubmit', {
                                            jobId: job.id,
                                            jobUrl: job.url,
                                          });
                                        }}
                                      >
                                        Confirm submit
                                      </Button>
                                    ) : null}
                                  </div>

                                  {submitLog.length ? (
                                    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                                      <div className="grid gap-1">
                                        {submitLog
                                          .slice(-6)
                                          .map((line, idx) => (
                                            <div key={`${line}:${idx}`}>
                                              {line}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Browse Upwork on the left — extracted jobs will appear
                          here automatically.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedTabsContent>

              <AnimatedTabsContent
                value="settings"
                className="px-0"
                scrollable={false}
              >
                <div className="grid gap-3 2xl:grid-cols-2">
                  <Card className="2xl:col-span-2">
                    <div className="px-4 pt-4 pb-2">
                      <div className="text-sm font-medium text-foreground">
                        Team + Skill profile
                      </div>
                    </div>
                    <CardContent>
                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="team-select">Team</Label>
                          <Select
                            value={selectedTeamId || undefined}
                            onValueChange={value => setSelectedTeamId(value)}
                          >
                            <SelectTrigger id="team-select" className="h-9">
                              <SelectValue placeholder="Select a team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map(team => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="profile-skills">
                            Skill profile (required)
                          </Label>
                          <Textarea
                            id="profile-skills"
                            value={profileDraft.skillsText}
                            onChange={event =>
                              setProfileDraft(prev => ({
                                ...prev,
                                skillsText: event.target.value,
                                skills: parseSkills(event.target.value),
                              }))
                            }
                            placeholder="e.g. React, Next.js, TypeScript, Supabase, Stripe"
                            className="min-h-24 text-sm"
                          />
                          <div className="text-[11px] text-muted-foreground">
                            Automation only applies to jobs that match these
                            skills.
                          </div>
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="profile-industries">
                            Industries (optional)
                          </Label>
                          <Input
                            id="profile-industries"
                            value={profileDraft.industries.join(', ')}
                            onChange={event =>
                              setProfileDraft(prev => ({
                                ...prev,
                                industries: parseSkills(event.target.value),
                              }))
                            }
                            placeholder="e.g. fintech, healthcare, legal"
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="profile-offer">
                            Offer (optional)
                          </Label>
                          <Input
                            id="profile-offer"
                            value={profileDraft.offer ?? ''}
                            onChange={event =>
                              setProfileDraft(prev => ({
                                ...prev,
                                offer: event.target.value,
                              }))
                            }
                            placeholder="Discovery call + scoped plan + 1-2 week MVP"
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="profile-proof">
                            Proof (optional)
                          </Label>
                          <Textarea
                            id="profile-proof"
                            value={profileDraft.proof ?? ''}
                            onChange={event =>
                              setProfileDraft(prev => ({
                                ...prev,
                                proof: event.target.value,
                              }))
                            }
                            placeholder="One line: results, client types, years of experience..."
                            className="min-h-20 text-sm"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => void handleSaveProfile()}
                            disabled={!selectedTeamId || savingProfile}
                          >
                            {savingProfile ? 'Saving...' : 'Save profile'}
                          </Button>
                          {!profileReady ? (
                            <span className="text-[11px] text-muted-foreground">
                              Skill profile is required to run automation.
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <div className="px-4 pt-4 pb-2">
                      <div className="text-sm font-medium text-foreground">
                        Offer + proof
                      </div>
                    </div>
                    <CardContent>
                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <div className="text-xs text-muted-foreground">
                            Offer
                          </div>
                          <Input
                            value={form.offer}
                            onChange={event =>
                              updateForm('offer', event.target.value)
                            }
                            placeholder="e.g. Discovery call + scoped plan + 1-2 week MVP"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <div className="text-xs text-muted-foreground">
                            Proof
                          </div>
                          <Textarea
                            value={form.proof}
                            onChange={event =>
                              updateForm('proof', event.target.value)
                            }
                            placeholder="One line: results, client types, years of experience..."
                            className="min-h-20 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <div className="px-4 pt-4 pb-2">
                      <div className="text-sm font-medium text-foreground">
                        Bid settings
                      </div>
                    </div>
                    <CardContent>
                      <div className="grid gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant={
                              form.budgetType === 'fixed'
                                ? 'default'
                                : 'secondary'
                            }
                            onClick={() => updateForm('budgetType', 'fixed')}
                          >
                            Fixed
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              form.budgetType === 'hourly'
                                ? 'default'
                                : 'secondary'
                            }
                            onClick={() => updateForm('budgetType', 'hourly')}
                          >
                            Hourly
                          </Button>
                        </div>
                        <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                          Suggested:{' '}
                          <span className="text-foreground">{computedBid}</span>
                        </div>
                        <div className="grid gap-1.5">
                          <div className="text-xs text-muted-foreground">
                            Client budget
                          </div>
                          <Input
                            value={form.budget}
                            onChange={event =>
                              updateForm('budget', event.target.value)
                            }
                            placeholder="e.g. $2,000 fixed or $50-$90/hr"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="grid gap-1.5 2xl:grid-cols-2">
                          <div className="grid gap-1.5">
                            <div className="text-xs text-muted-foreground">
                              Rate
                            </div>
                            <Input
                              value={form.targetRate}
                              onChange={event =>
                                updateForm('targetRate', event.target.value)
                              }
                              placeholder="e.g. 95"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <div className="text-xs text-muted-foreground">
                              Hours
                            </div>
                            <Input
                              value={form.estimatedHours}
                              onChange={event =>
                                updateForm('estimatedHours', event.target.value)
                              }
                              placeholder="e.g. 40"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <div className="text-xs text-muted-foreground">
                            Timeline
                          </div>
                          <Input
                            value={form.timeline}
                            onChange={event =>
                              updateForm('timeline', event.target.value)
                            }
                            placeholder="e.g. 3 weeks"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Tone:
                          </span>
                          {(
                            [
                              'consultative',
                              'direct',
                              'friendly',
                              'technical',
                            ] as Tone[]
                          ).map(tone => (
                            <Button
                              key={tone}
                              size="sm"
                              variant={
                                form.tone === tone ? 'default' : 'secondary'
                              }
                              onClick={() => updateForm('tone', tone)}
                            >
                              {tone}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedTabsContent>
            </AnimatedTabs>
          </UpworkGuideLayout>
        </div>
      </div>
    </Page>
  );
}
