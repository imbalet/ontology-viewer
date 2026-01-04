import { type SchemaField } from '../models/ontology';

export function validateField(
    field: SchemaField,
    value: any
): string | null {
    if (field.required) {
        if (
            value === undefined ||
            value === null ||
            value === ''
        ) {
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
