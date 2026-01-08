import type { SchemaField } from '../../models/ontology';

export const emptyField = (): SchemaField => ({
  id: crypto.randomUUID(),
  name: '',
  type: 'string',
  required: false,
});

export const updateAt = <T>(arr: T[], index: number, value: T) =>
  arr.map((item, i) => (i === index ? value : item));

export const removeAt = <T>(arr: T[], index: number) => arr.filter((_, i) => i !== index);
