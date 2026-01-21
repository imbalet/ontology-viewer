import { type Node, type Schema } from '../../models/ontology';
import { normalizeProperties } from './normalizeProperties';

const stableStringify = (obj: Record<string, any>) =>
  JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = obj[key];
          return acc;
        },
        {} as Record<string, any>
      )
  );

export const getNodeSignature = (node: Node, schema: Schema): string => {
  const normalizedProps = normalizeProperties(
    node.properties,
    schema.edgeTypes[node.typeId].fields
  );

  return `${node.typeId}::${stableStringify(normalizedProps)}`;
};
