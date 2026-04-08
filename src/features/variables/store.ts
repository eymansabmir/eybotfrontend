import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Variable = {
    id: string;
    name: string;
    isSessionVariable: boolean;
};

interface VariablesState {
    variables: Variable[];
    addVariable: (name: string, isSessionVariable?: boolean) => Variable;
    updateVariable: (id: string, updates: Partial<Omit<Variable, 'id'>>) => void;
    removeVariable: (id: string) => void;
    clearVariables: () => void;
    setVariables: (variables: Variable[]) => void;
}

export const useVariablesStore = create<VariablesState>()(
    persist(
        (set) => ({
            variables: [],
            addVariable: (name, isSessionVariable = true) => {
                const newVar: Variable = {
                    id: uuidv4(),
                    name,
                    isSessionVariable,
                };
                set((state) => ({
                    variables: [...state.variables, newVar],
                }));
                return newVar;
            },
            updateVariable: (id, updates) => {
                set((state) => ({
                    variables: state.variables.map((v) => 
                        v.id === id ? { ...v, ...updates } : v
                    ),
                }));
            },
            removeVariable: (id) => {
                set((state) => ({
                    variables: state.variables.filter((v) => v.id !== id),
                }));
            },
            clearVariables: () => set({ variables: [] }),
            setVariables: (variables) => set({ variables }),
        }),
        {
            name: 'bot-variables-storage',
        }
    )
);
