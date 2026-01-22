import { createJSONStorage } from 'zustand/middleware';

import type { NodeId, Ontology } from '../models/ontology';

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
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as { __type?: unknown; value?: unknown };
  return obj.__type === 'Set' && Array.isArray(obj.value);
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
