import { normalizeProperties } from './normalizeProperties';
import { type Node, type PrimitiveValue, type Schema } from '../../models/ontology';

const stableStringify = (obj: Record<string, PrimitiveValue | undefined>) =>
  JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = obj[key];
          return acc;
        },
        {} as Record<string, PrimitiveValue | undefined>
      )
  );

export const getNodeSignature = (node: Node, schema: Schema): string => {
  const normalizedProps = normalizeProperties(
    node.properties,
    schema.edgeTypes[node.typeId].fields
  );

  return `${node.typeId}::${stableStringify(normalizedProps)}`;
};
