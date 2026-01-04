export function generateId(prefix = 'n') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}
