import type { ProjectI } from "@/types/projects";
import { create } from "zustand";

interface LocalityState {
  count: number;
  res: ProjectI[];
  offset: number;
}

interface ActionsProps {
  localities: Record<string, LocalityState>;
  setCount: (level: string, count: number) => void;
  addResponse: (level: string, res: ProjectI[]) => void;
  setOffset: (level: string, offset: number) => void;
}

export const useDataStore = create<ActionsProps>()((set) => ({
  localities: {},
  setCount: (level, count) =>
    set((state) => ({
      localities: {
        ...state.localities,
        [level]: {
          ...(state.localities[level] ?? { res: [], offset: 0 }),
          count,
        },
      },
    })),
  addResponse: (level, res) =>
    set((state) => {
      const prev = state.localities[level] ?? { res: [], offset: 0, count: 0 };
      return {
        localities: {
          ...state.localities,
          [level]: {
            ...prev,
            res: [...prev.res, ...res].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            ),
          },
        },
      };
    }),
  setOffset: (level, offset) =>
    set((state) => {
      const prev = state.localities[level] ?? { res: [], count: 0, offset: 0 };
      return {
        localities: {
          ...state.localities,
          [level]: { ...prev, offset },
        },
      };
    }),
}));
