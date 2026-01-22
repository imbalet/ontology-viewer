import type { Ontology, NodeId } from '../models/ontology';
import { createJSONStorage } from 'zustand/middleware';

export const STORAGE_VERSION = 1;

export type SerializedSet<T = unknown> = {
  __type: 'Set';
  value: T[];
};

export type PersistedOntologyState = {
  ontology: Ontology | null;
  collapsedNodes: Set<NodeId>;
};

export const isSerializedSet = (value: unknown): value is SerializedSet => {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__type' in value &&
    (value as any).__type === 'Set' &&
    Array.isArray((value as any).value)
  );
};

export const storage = createJSONStorage<PersistedOntologyState>(() => localStorage, {
  replacer: (_key, value) => {
    if (value instanceof Set) {
      return {
        __type: 'Set' as const,
        value: Array.from(value),
      };
    }
    return value;
  },

  reviver: (_key, value) => {
    if (isSerializedSet(value)) {
      return new Set(value.value);
    }
    return value;
  },
});
