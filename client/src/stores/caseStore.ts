/**
 * Global case management store with optimistic updates
 * SPRINT A requirement: Centralized state management for cases
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CaseData } from '@/lib/api';
import { Task, CAPSnapshot } from '@/features/cap/capRules';

export interface CaseSummary {
  id: string;
  name: string;
  email: string;
  stage: string;
  tier: string;
  score: number;
  ageMonths: number;
  updatedAt: string;
}

export interface CaseFull extends CaseData {
  // Extended case data with all details
  tasks?: Task[];
  cap?: CAPSnapshot;
}

interface CaseStore {
  // State
  caseList: Record<string, CaseSummary>;
  caseById: Record<string, CaseFull>;
  activeTab: string;
  selectedCaseId?: string;
  editingCaseId?: string;
  
  // Actions
  setActiveTab: (tab: string) => void;
  selectCase: (id: string) => void;
  hydrateList: (list: CaseData[]) => void;
  hydrateCase: (id: string, data: CaseFull) => void;
  updateCase: (id: string, patch: Partial<CaseFull>) => void;
  deleteCase: (id: string) => void;
  refreshCase: (id: string) => Promise<void>;
  setEditingCase: (id?: string) => void;
  
  // Optimistic update rollback
  rollbackCase: (id: string, originalData: CaseFull) => void;
}

export const useCaseStore = create<CaseStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    caseList: {},
    caseById: {},
    activeTab: 'overview',
    selectedCaseId: undefined,
    editingCaseId: undefined,

    // Actions
    setActiveTab: (tab: string) => {
      set({ activeTab: tab });
    },

    selectCase: (id: string) => {
      set({ selectedCaseId: id });
    },

    hydrateList: (list: CaseData[]) => {
      const caseList: Record<string, CaseSummary> = {};
      list.forEach(caseData => {
        caseList[caseData.id] = {
          id: caseData.id,
          name: caseData.name,
          email: caseData.email,
          stage: caseData.stage,
          tier: caseData.tier,
          score: caseData.score,
          ageMonths: caseData.ageMonths,
          updatedAt: caseData.updatedAt,
        };
      });
      set({ caseList });
    },

    hydrateCase: (id: string, data: CaseFull) => {
      set(state => ({
        caseById: {
          ...state.caseById,
          [id]: data
        },
        // Also update summary in list if it exists
        caseList: state.caseList[id] ? {
          ...state.caseList,
          [id]: {
            ...state.caseList[id],
            name: data.name,
            email: data.email,
            stage: data.stage,
            tier: data.tier,
            score: data.score,
            ageMonths: data.ageMonths,
            updatedAt: data.updatedAt,
          }
        } : state.caseList
      }));
    },

    updateCase: (id: string, patch: Partial<CaseFull>) => {
      set(state => {
        const currentCase = state.caseById[id];
        if (!currentCase) return state;

        const updatedCase = { ...currentCase, ...patch };
        
        return {
          caseById: {
            ...state.caseById,
            [id]: updatedCase
          },
          // Also update summary in list
          caseList: state.caseList[id] ? {
            ...state.caseList,
            [id]: {
              ...state.caseList[id],
              name: updatedCase.name,
              email: updatedCase.email,
              stage: updatedCase.stage,
              tier: updatedCase.tier,
              score: updatedCase.score,
              ageMonths: updatedCase.ageMonths,
              updatedAt: updatedCase.updatedAt,
            }
          } : state.caseList
        };
      });
    },

    deleteCase: (id: string) => {
      set(state => {
        const newCaseById = { ...state.caseById };
        const newCaseList = { ...state.caseList };
        
        delete newCaseById[id];
        delete newCaseList[id];
        
        return {
          caseById: newCaseById,
          caseList: newCaseList,
          // Clear selection if deleted case was selected
          selectedCaseId: state.selectedCaseId === id ? undefined : state.selectedCaseId,
          editingCaseId: state.editingCaseId === id ? undefined : state.editingCaseId,
        };
      });
    },

    refreshCase: async (id: string) => {
      // This will be implemented when we integrate with API
      try {
        const { getCaseById } = await import('@/lib/api');
        const freshData = await getCaseById(id);
        get().hydrateCase(id, freshData as CaseFull);
      } catch (error) {
        console.error('Failed to refresh case:', error);
        throw error;
      }
    },

    setEditingCase: (id?: string) => {
      set({ editingCaseId: id });
    },

    rollbackCase: (id: string, originalData: CaseFull) => {
      set(state => ({
        caseById: {
          ...state.caseById,
          [id]: originalData
        },
        caseList: state.caseList[id] ? {
          ...state.caseList,
          [id]: {
            ...state.caseList[id],
            name: originalData.name,
            email: originalData.email,
            stage: originalData.stage,
            tier: originalData.tier,
            score: originalData.score,
            ageMonths: originalData.ageMonths,
            updatedAt: originalData.updatedAt,
          }
        } : state.caseList
      }));
    },
  }))
);

// Helper hooks for common use cases
export const useActiveTab = () => useCaseStore(state => state.activeTab);
export const useSelectedCaseId = () => useCaseStore(state => state.selectedCaseId);
export const useEditingCaseId = () => useCaseStore(state => state.editingCaseId);
export const useCaseList = () => useCaseStore(state => state.caseList);
export const useCaseById = (id: string) => useCaseStore(state => state.caseById[id]);