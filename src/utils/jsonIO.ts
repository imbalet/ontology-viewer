import type { Ontology } from '../models/ontology';

export function importOntology(file: File): Promise<Ontology> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.schema || !data.nodes || !data.edges) {
          throw new Error('Invalid ontology structure');
        }
        resolve(data as Ontology);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function exportOntology(ontology: Ontology, filename = 'ontology.json') {
  const blob = new Blob([JSON.stringify(ontology, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
