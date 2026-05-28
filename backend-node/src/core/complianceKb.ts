/**
 * Compliance Knowledge Base — custom TF-IDF retriever over policy markdown docs.
 * Functionally equivalent to Python's sklearn TF-IDF implementation.
 * Mirrors Python backend/app/core/compliance_kb.py.
 */
import fs from 'fs';
import path from 'path';

interface Chunk {
  text: string;
  source: string;
  title: string;
}

interface RetrievedChunk extends Chunk {
  score: number;
}

class TfIdfIndex {
  private docs: string[] = [];
  private termDf: Map<string, number> = new Map();
  private tfidfVecs: Map<string, number>[] = [];

  addDocuments(docs: string[]): void {
    this.docs = docs;
    this.termDf.clear();
    this.tfidfVecs = [];

    // Build term-frequency vectors and document frequencies
    const tfVecs: Map<string, number>[] = docs.map((doc) => {
      const terms = tokenize(doc);
      const tf = new Map<string, number>();
      for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1 / terms.length);
      return tf;
    });

    // IDF
    for (const tf of tfVecs) {
      for (const term of tf.keys()) {
        this.termDf.set(term, (this.termDf.get(term) ?? 0) + 1);
      }
    }

    const N = docs.length;
    this.tfidfVecs = tfVecs.map((tf) => {
      const vec = new Map<string, number>();
      for (const [term, tfVal] of tf) {
        const df = this.termDf.get(term) ?? 1;
        const idf = Math.log((N + 1) / (df + 1)) + 1;
        vec.set(term, tfVal * idf);
      }
      return normalize(vec);
    });
  }

  query(q: string, topK: number): Array<{ idx: number; score: number }> {
    const terms = tokenize(q);
    const qVec = new Map<string, number>();
    for (const t of terms) qVec.set(t, (qVec.get(t) ?? 0) + 1 / terms.length);

    const N = this.docs.length;
    const qTfidf = new Map<string, number>();
    for (const [term, tfVal] of qVec) {
      const df = this.termDf.get(term) ?? 0;
      const idf = Math.log((N + 1) / (df + 1)) + 1;
      qTfidf.set(term, tfVal * idf);
    }
    const normQ = normalize(qTfidf);

    const scores = this.tfidfVecs.map((docVec, idx) => ({
      idx,
      score: cosineSimilarity(normQ, docVec),
    }));

    return scores.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}

function tokenize(text: string): string[] {
  const stopwords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','up','about','into','through','during','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','this','that','these','those','it','its','i','we','you','he','she','they','their','our','your','my','his','her','not','no','nor','so','yet','both','either','neither','each','few','more','most','other','some','such','than','too','very','just','as','if','then','than','when','where','who','which','what','how']);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stopwords.has(t));
}

function normalize(vec: Map<string, number>): Map<string, number> {
  const magnitude = Math.sqrt([...vec.values()].reduce((s, v) => s + v * v, 0));
  if (magnitude === 0) return vec;
  const normed = new Map<string, number>();
  for (const [k, v] of vec) normed.set(k, v / magnitude);
  return normed;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  for (const [term, aVal] of a) {
    const bVal = b.get(term);
    if (bVal !== undefined) dot += aVal * bVal;
  }
  return dot;
}

export class ComplianceKnowledgeBase {
  private chunks: Chunk[] = [];
  private index = new TfIdfIndex();
  private loaded = false;

  loadDocuments(docsDir: string): number {
    if (!fs.existsSync(docsDir)) return 0;

    const rawChunks: Chunk[] = [];
    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md')).sort();

    for (const fname of files) {
      const fpath = path.join(docsDir, fname);
      const content = fs.readFileSync(fpath, 'utf-8');
      const title = fname.replace(/_/g, ' ').replace('.md', '').replace(/\b\w/g, (c) => c.toUpperCase());
      rawChunks.push(...this.chunk(content, fname, title));
    }

    if (rawChunks.length === 0) return 0;

    this.chunks = rawChunks;
    this.index.addDocuments(rawChunks.map((c) => c.text));
    this.loaded = true;
    return rawChunks.length;
  }

  retrieve(query: string, topK: number = 3): RetrievedChunk[] {
    if (!this.loaded) return [];
    const results = this.index.query(query, topK);
    return results
      .filter((r) => r.score > 0.01)
      .map((r) => ({ ...this.chunks[r.idx], score: r.score }));
  }

  listDocuments(): Array<{ source: string; title: string; chunks: number }> {
    const seen = new Map<string, { source: string; title: string; chunks: number }>();
    for (const chunk of this.chunks) {
      const e = seen.get(chunk.source);
      if (!e) seen.set(chunk.source, { source: chunk.source, title: chunk.title, chunks: 1 });
      else e.chunks++;
    }
    return [...seen.values()];
  }

  get isLoaded(): boolean { return this.loaded; }
  get chunkCount(): number { return this.chunks.length; }

  private chunk(text: string, source: string, title: string, maxChars = 800): Chunk[] {
    const chunks: Chunk[] = [];
    const parts = text.split(/\n{2,}|(?=^#{1,3} )/m);
    let current = '';
    for (const part of parts) {
      const p = part.trim();
      if (!p) continue;
      if (current.length + p.length < maxChars) {
        current = (current + '\n\n' + p).trim();
      } else {
        if (current) chunks.push({ text: current, source, title });
        current = p;
      }
    }
    if (current) chunks.push({ text: current, source, title });
    return chunks;
  }
}

let _kbInstance: ComplianceKnowledgeBase | null = null;

export function getComplianceKb(): ComplianceKnowledgeBase {
  if (!_kbInstance) _kbInstance = new ComplianceKnowledgeBase();
  return _kbInstance;
}
