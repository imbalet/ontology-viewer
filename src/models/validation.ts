import type { Ontology, PrimitiveValue, SchemaField } from './ontology';

export function validateField(
  field: SchemaField,
  value: PrimitiveValue | undefined
): string | null {
  if (field.required) {
    if (value === undefined || value === null || value === '') {
      return 'Required';
    }
  }

  if (field.type === 'number' && value !== undefined) {
    if (Number.isNaN(value)) {
      return 'Must be a number';
    }
  }

  return null;
}

export function validateOntology(data: unknown): data is Ontology {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.nodes)) return false;
  if (!Array.isArray(obj.edges)) return false;
  if (!obj.schema || typeof obj.schema !== 'object') return false;

  return true;
}
