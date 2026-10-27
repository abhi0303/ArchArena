import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** “I knew this” or “revise later”, chosen by the learner on each question. */
export type PrepStatus = 'known' | 'revise';

interface PrepProgressState {
  status: Record<string, PrepStatus>;
  /** Hide answers until the learner has tried to answer. */
  practiceMode: boolean;
  setStatus: (id: string, status: PrepStatus | null) => void;
  setPracticeMode: (on: boolean) => void;
}

/** Interview Prep progress, kept in this browser (it is a personal study aid, not graded progress). */
export const usePrepProgress = create<PrepProgressState>()(
  persist(
    (set) => ({
      status: {},
      practiceMode: false,
      setStatus: (id, status) =>
        set((s) => {
          const next = { ...s.status };
          if (status) next[id] = status;
          else delete next[id];
          return { status: next };
        }),
      setPracticeMode: (practiceMode) => set({ practiceMode }),
    }),
    { name: 'archarena-prep', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
