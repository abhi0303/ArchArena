import { create } from 'zustand';

interface GlossaryState {
  /** The term shown in the popup, if any. */
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export const useGlossary = create<GlossaryState>()((set) => ({
  openId: null,
  open: (openId) => set({ openId }),
  close: () => set({ openId: null }),
}));
