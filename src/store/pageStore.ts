import type { Page } from "@/types/page";
import { create } from "zustand";

export interface PageMetadata {
  module: Page | null;
  title: string;
  isFormPage?: boolean;
  showBreadcrums?: boolean;
}

interface PageState {
  page: PageMetadata | null;
  setPage: (page: PageMetadata | null) => void;
}

export const usePageStore = create<PageState>((set) => ({
  page: null,
  setPage: (page) => set(() => ({ page: page })),
}));
