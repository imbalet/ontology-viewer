import type { SchemaField, Ontology } from './ontology';

export function validateField(field: SchemaField, value: any): string | null {
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

export function validateOntology(data: any): data is Ontology {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.nodes)) return false;
  if (!Array.isArray(data.edges)) return false;
  if (!data.schema || typeof data.schema !== 'object') return false;

  return true;
}
