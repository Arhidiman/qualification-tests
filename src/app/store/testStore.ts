import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Question {
  id: number;
  text: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswers: number[];
}

export interface Ticket {
  id: string;
  title: string;
  questions: Question[];
}

export interface Test {
  id: string;
  title: string;
  description: string;
  hasTickets: boolean;
  tickets?: Ticket[];
  questions?: Question[];
}

export interface Attempt {
  id: string;
  testId: string;
  testTitle: string;
  ticketId?: string;
  ticketTitle?: string;
  date: string;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  answers: number[][];
}

interface TestStore {
  tests: Test[];
  currentTest: Test | null;
  currentTicket: Ticket | null;
  currentAnswers: Record<number, number[]>;
  attempts: Attempt[];
  setTests: (tests: Test[]) => void;
  setCurrentTest: (test: Test | null) => void;
  setCurrentTicket: (ticket: Ticket | null) => void;
  setAnswer: (questionId: number, selectedIndexes: number[]) => void;
  clearCurrentAnswers: () => void;
  addAttempt: (attempt: Attempt) => void;
  getAttemptsByTestId: (testId: string) => Attempt[];
  getTestById: (testId: string) => Test | undefined;
  syncTests: (newTests: Test[]) => void;  // 👈 НОВЫЙ МЕТОД
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      tests: [],
      currentTest: null,
      currentTicket: null,
      currentAnswers: {},
      attempts: [],

      setTests: (tests) => set({ tests }),

      setCurrentTest: (test) => set({ currentTest: test, currentTicket: null, currentAnswers: {} }),

      setCurrentTicket: (ticket) => set({ currentTicket: ticket, currentAnswers: {} }),

      setAnswer: (questionId, selectedIndexes) =>
        set((state) => ({
          currentAnswers: {
            ...state.currentAnswers,
            [questionId]: selectedIndexes,
          },
        })),

      clearCurrentAnswers: () => set({ currentAnswers: {} }),

      addAttempt: (attempt) =>
        set((state) => ({
          attempts: [attempt, ...state.attempts],
        })),

      getAttemptsByTestId: (testId) => {
        return get().attempts.filter((a) => a.testId === testId);
      },

      getTestById: (testId) => {
        return get().tests.find((t) => t.id === testId);
      },

      // 👇 СИНХРОНИЗАЦИЯ: обновляем тесты, НО НЕ ТРОГАЕМ attempts
      syncTests: (newTests) => {
        const currentTests = get().tests;
        
        // Сравниваем, изменились ли тесты
        const currentIds = currentTests.map(t => t.id).sort().join(',');
        const newIds = newTests.map(t => t.id).sort().join(',');
        
        if (currentIds !== newIds) {
          console.log('🔄 Обнаружены изменения в тестах, синхронизирую...');
          set({ tests: newTests });
        } else {
          console.log('✅ Тесты актуальны, синхронизация не требуется');
        }
      },
    }),
    {
      name: 'test-storage',
      // 👇 ТОЛЬКО attempts сохраняем в localStorage, tests всегда из JSON
      partialize: (state) => ({
        attempts: state.attempts,
      }),
    }
  )
);