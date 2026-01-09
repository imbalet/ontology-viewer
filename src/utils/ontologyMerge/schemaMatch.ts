import { type Schema, type SchemaField } from '../../models/ontology';

export const isSameField = (a: SchemaField, b: SchemaField) =>
  a.name === b.name &&
  a.type === b.type &&
  JSON.stringify(a.options ?? []) === JSON.stringify(b.options ?? []);

export const matchEdgeTypes = (base: Schema, incoming: Schema): Map<string, string> => {
  const map = new Map<string, string>();

  for (const [incType, incDef] of Object.entries(incoming.edgeTypes)) {
    const match = Object.entries(base.edgeTypes).find(
      ([, baseDef]) =>
        baseDef.directed === incDef.directed &&
        (baseDef.fields?.length ?? 0) === (incDef.fields?.length ?? 0)
    );

    if (match) {
      map.set(incType, match[0]);
    }
  }

  return map;
};
