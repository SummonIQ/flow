import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecruitingRoleStatus = 'open' | 'paused' | 'filled';

export type CandidateStage =
  | 'Sourced'
  | 'Contacted'
  | 'Screening'
  | 'Client loop'
  | 'Offer'
  | 'Placed'
  | 'Rejected';

export type CandidateScore = 'A' | 'A-' | 'B+' | 'B' | 'C';

export type RecruitingRole = {
  id: string;
  title: string;
  company: string;
  location: string;
  status: RecruitingRoleStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
};

export type RecruitingCandidate = {
  id: string;
  name: string;
  headline: string;
  location: string;
  email?: string;
  linkedinUrl?: string;
  roleId?: string;
  stage: CandidateStage;
  score: CandidateScore;
  tags: string[];
  notes: string;
  lastContactAt?: string;
  nextActionAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecruitingTask = {
  id: string;
  title: string;
  done: boolean;
  dueAt?: string;
  roleId?: string;
  candidateId?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecruitingActivity = {
  id: string;
  title: string;
  meta: string;
  badge: 'Outbound' | 'Pipeline' | 'Role' | 'Network' | 'Task' | 'System';
  createdAt: string;
};

export type SavedCandidateSearch = {
  id: string;
  name: string;
  roleKeywords: string;
  location: string;
  experience: string;
  mustHaves: string;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type NetworkEntityKind = 'connector' | 'company' | 'hiring_manager';

export type NetworkEntity = {
  id: string;
  kind: NetworkEntityKind;
  name: string;
  tag: string;
  relationshipStrength: 'strong' | 'medium' | 'weak';
  notes: string;
  nextAsk: string;
  createdAt: string;
  updatedAt: string;
};

export type RecruitingState = {
  hasHydrated: boolean;
  roles: RecruitingRole[];
  candidates: RecruitingCandidate[];
  tasks: RecruitingTask[];
  activity: RecruitingActivity[];
  savedSearches: SavedCandidateSearch[];
  network: NetworkEntity[];

  pipelineStages: CandidateStage[];

  setHasHydrated: (value: boolean) => void;
  ensureSeeded: () => void;

  addRole: (input: {
    title: string;
    company: string;
    location: string;
    priority?: RecruitingRole['priority'];
  }) => string;
  updateRole: (roleId: string, updates: Partial<RecruitingRole>) => void;

  addCandidate: (input: {
    name: string;
    headline: string;
    location: string;
    roleId?: string;
    stage?: CandidateStage;
    score?: CandidateScore;
    tags?: string[];
    notes?: string;
    email?: string;
    linkedinUrl?: string;
  }) => string;
  updateCandidate: (
    candidateId: string,
    updates: Partial<RecruitingCandidate>,
  ) => void;
  moveCandidateStage: (candidateId: string, stage: CandidateStage) => void;

  addTask: (input: {
    title: string;
    dueAt?: string;
    roleId?: string;
    candidateId?: string;
  }) => string;
  toggleTask: (taskId: string) => void;

  logActivity: (input: Omit<RecruitingActivity, 'id' | 'createdAt'>) => void;

  createSavedSearch: (
    input: Omit<SavedCandidateSearch, 'id' | 'createdAt' | 'updatedAt'>,
  ) => string;
  runSavedSearch: (id: string) => void;

  addNetworkEntity: (input: {
    kind: NetworkEntityKind;
    name: string;
    tag: string;
    relationshipStrength?: NetworkEntity['relationshipStrength'];
    notes?: string;
    nextAsk?: string;
  }) => string;
  updateNetworkEntity: (id: string, updates: Partial<NetworkEntity>) => void;
};

const STORAGE_KEY = 'flow.recruiting.workspace.v1';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function timestamp(): string {
  return new Date().toISOString();
}

function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function makeActivity(
  input: Omit<RecruitingActivity, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  },
): RecruitingActivity {
  return {
    id: input.id ?? generateId(),
    title: input.title,
    meta: input.meta,
    badge: input.badge,
    createdAt: input.createdAt ?? timestamp(),
  };
}

export const useRecruitingStore = create<RecruitingState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      roles: [],
      candidates: [],
      tasks: [],
      activity: [],
      savedSearches: [],
      network: [],

      pipelineStages: [
        'Sourced',
        'Contacted',
        'Screening',
        'Client loop',
        'Offer',
        'Placed',
        'Rejected',
      ],

      setHasHydrated: value => set({ hasHydrated: value }),

      ensureSeeded: () => {
        const state = get();
        if (state.roles.length || state.candidates.length) return;

        const now = timestamp();

        const role1: RecruitingRole = {
          id: generateId(),
          title: 'Senior Fullstack Engineer',
          company: 'Harper & Co.',
          location: 'SF/Remote',
          status: 'open',
          priority: 'high',
          createdAt: now,
          updatedAt: now,
        };

        const role2: RecruitingRole = {
          id: generateId(),
          title: 'Backend Engineer (Go)',
          company: 'Fintech Labs',
          location: 'NYC',
          status: 'open',
          priority: 'medium',
          createdAt: now,
          updatedAt: now,
        };

        const role3: RecruitingRole = {
          id: generateId(),
          title: 'Design Engineer',
          company: 'Studio Alpha',
          location: 'SF Bay',
          status: 'paused',
          priority: 'low',
          createdAt: now,
          updatedAt: now,
        };

        const candidates: RecruitingCandidate[] = [
          {
            id: generateId(),
            name: 'Avery Kim',
            headline: 'Senior Fullstack Engineer',
            location: 'Remote (US)',
            roleId: role1.id,
            stage: 'Sourced',
            score: 'A',
            tags: ['React', 'Node', 'B2B SaaS'],
            notes: '',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: generateId(),
            name: 'Jordan Patel',
            headline: 'Backend Engineer (Go)',
            location: 'NYC',
            roleId: role2.id,
            stage: 'Screening',
            score: 'A-',
            tags: ['Go', 'Postgres', 'Payments'],
            notes: 'Interested — schedule screen.',
            lastContactAt: now,
            nextActionAt: now,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: generateId(),
            name: 'Sam Rivera',
            headline: 'Design Engineer',
            location: 'SF Bay',
            roleId: role3.id,
            stage: 'Contacted',
            score: 'B+',
            tags: ['Figma', 'React', 'Motion'],
            notes: 'Sent first message.',
            lastContactAt: now,
            createdAt: now,
            updatedAt: now,
          },
        ];

        const savedSearches: SavedCandidateSearch[] = [
          {
            id: generateId(),
            name: 'Senior Fullstack (SF/Remote)',
            roleKeywords: 'fullstack react node',
            location: 'SF/Remote',
            experience: '8+ years',
            mustHaves: 'B2B SaaS',
            lastRunAt: now,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: generateId(),
            name: 'Staff Backend (Fintech)',
            roleKeywords: 'backend go',
            location: 'NYC/Remote',
            experience: '6+ years',
            mustHaves: 'payments, postgres',
            lastRunAt: now,
            createdAt: now,
            updatedAt: now,
          },
        ];

        const activity: RecruitingActivity[] = [
          {
            id: generateId(),
            title: 'Seeded recruiting workspace',
            meta: 'Sample roles + candidates added',
            badge: 'System',
            createdAt: now,
          },
        ];

        set({
          roles: [role1, role2, role3],
          candidates,
          savedSearches,
          activity,
        });
      },

      addRole: input => {
        const now = timestamp();
        const role: RecruitingRole = {
          id: generateId(),
          title: input.title,
          company: input.company,
          location: input.location,
          status: 'open',
          priority: input.priority ?? 'medium',
          createdAt: now,
          updatedAt: now,
        };

        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: `Created role: ${role.title}`,
              meta: `${role.company} • ${role.location}`,
              badge: 'Role',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            roles: [role, ...state.roles],
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });

        return role.id;
      },

      updateRole: (roleId, updates) => {
        const now = timestamp();
        set(state => ({
          roles: state.roles.map(role =>
            role.id === roleId ? { ...role, ...updates, updatedAt: now } : role,
          ),
        }));
      },

      addCandidate: input => {
        const now = timestamp();
        const candidate: RecruitingCandidate = {
          id: generateId(),
          name: input.name,
          headline: input.headline,
          location: input.location,
          roleId: input.roleId,
          stage: input.stage ?? 'Sourced',
          score: input.score ?? 'B',
          tags: input.tags ?? [],
          notes: input.notes ?? '',
          email: input.email,
          linkedinUrl: input.linkedinUrl,
          createdAt: now,
          updatedAt: now,
        };

        const role = get().roles.find(r => r.id === input.roleId);
        const roleMeta = role
          ? `${role.title} • ${role.company}`
          : 'Unassigned role';

        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: `Added candidate: ${candidate.name}`,
              meta: roleMeta,
              badge: 'Pipeline',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            candidates: [candidate, ...state.candidates],
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });

        return candidate.id;
      },

      updateCandidate: (candidateId, updates) => {
        const now = timestamp();
        set(state => ({
          candidates: state.candidates.map(candidate =>
            candidate.id === candidateId
              ? { ...candidate, ...updates, updatedAt: now }
              : candidate,
          ),
        }));
      },

      moveCandidateStage: (candidateId, stage) => {
        const now = timestamp();
        const candidate = get().candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        const nextStage = stage;
        const prevStage = candidate.stage;

        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: `Moved ${candidate.name} → ${nextStage}`,
              meta: String(prevStage),
              badge: 'Pipeline',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            candidates: state.candidates.map(c =>
              c.id === candidateId
                ? { ...c, stage: nextStage, updatedAt: now }
                : c,
            ),
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });
      },

      addTask: input => {
        const now = timestamp();
        const task: RecruitingTask = {
          id: generateId(),
          title: input.title,
          done: false,
          dueAt: input.dueAt,
          roleId: input.roleId,
          candidateId: input.candidateId,
          createdAt: now,
          updatedAt: now,
        };

        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: `Added task: ${task.title}`,
              meta: task.dueAt ? `Due ${task.dueAt}` : 'No due date',
              badge: 'Task',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            tasks: [task, ...state.tasks],
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });

        return task.id;
      },

      toggleTask: taskId => {
        const now = timestamp();
        const existing = get().tasks.find(t => t.id === taskId);
        if (!existing) return;

        const done = !existing.done;
        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: done
                ? `Completed task: ${existing.title}`
                : `Reopened task: ${existing.title}`,
              meta: '',
              badge: 'Task',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            tasks: state.tasks.map(t =>
              t.id === taskId ? { ...t, done, updatedAt: now } : t,
            ),
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });
      },

      logActivity: input => {
        const now = timestamp();
        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              ...input,
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });
      },

      createSavedSearch: input => {
        const now = timestamp();
        const search: SavedCandidateSearch = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        };

        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: `Saved search: ${search.name}`,
              meta: 'Candidate Search',
              badge: 'System',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            savedSearches: [search, ...state.savedSearches],
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });

        return search.id;
      },

      runSavedSearch: id => {
        const now = timestamp();
        const search = get().savedSearches.find(s => s.id === id);
        if (!search) return;

        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: `Ran saved search: ${search.name}`,
              meta: 'Candidate Search',
              badge: 'Outbound',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            savedSearches: state.savedSearches.map(s =>
              s.id === id ? { ...s, lastRunAt: now, updatedAt: now } : s,
            ),
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });
      },

      addNetworkEntity: input => {
        const now = timestamp();
        const entity: NetworkEntity = {
          id: generateId(),
          kind: input.kind,
          name: input.name,
          tag: input.tag,
          relationshipStrength: input.relationshipStrength ?? 'medium',
          notes: input.notes ?? '',
          nextAsk: input.nextAsk ?? '',
          createdAt: now,
          updatedAt: now,
        };

        set(state => {
          const nextActivity: RecruitingActivity[] = [
            makeActivity({
              title: `Added network: ${entity.name}`,
              meta: entity.tag,
              badge: 'Network',
              createdAt: now,
            }),
            ...state.activity,
          ];

          return {
            network: [entity, ...state.network],
            activity: sortByNewest(nextActivity).slice(0, 60),
          };
        });

        return entity.id;
      },

      updateNetworkEntity: (id, updates) => {
        const now = timestamp();
        set(state => ({
          network: state.network.map(entity =>
            entity.id === id
              ? { ...entity, ...updates, updatedAt: now }
              : entity,
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
