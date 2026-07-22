/**
 * Code Agent — generates Python code and delegates execution to the Python sidecar.
 */
import { gemini } from '../utils/geminiClient';
import { sidecarExecuteCode } from '../utils/sidecarClient';
import { Session } from '../types';

const CODE_SYSTEM_PROMPT = `You are a Python data analyst. Generate Python code to answer the user's question using pandas/matplotlib/scipy/seaborn.

Rules:
1. The session's first DataFrame is already loaded as 'df' (pandas DataFrame).
2. For visualizations, use matplotlib/seaborn. Save figures to _figures list as base64 PNG strings:
   import io, base64, matplotlib.pyplot as plt
   buf = io.BytesIO()
   plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='#111827')
   buf.seek(0)
   _figures.append(base64.b64encode(buf.read()).decode())
   plt.close()
3. Print key results/insights using print().
4. For statistical analysis, use scipy.stats.
5. Output ONLY the Python code — no markdown, no explanation.
6. The _figures list is pre-initialised; just append to it.

Schema: {schema}`;

export async function runCodeAgent(opts: {
  question: string;
  session: Session;
}): Promise<{
  python_code: string;
  stdout: string;
  matplotlib_images: string[];
  error?: string;
}> {
  const { question, session } = opts;

  const tables = session.tables ?? {};
  const firstMeta = Object.values(tables)[0];
  const schema = firstMeta?.schema ?? [];
  const schemaStr = schema.map((c) => `${c.name} (${c.type})`).join(', ');

  const systemPrompt = CODE_SYSTEM_PROMPT.replace('{schema}', schemaStr);

  let code: string;
  try {
    code = await gemini.generate({
      prompt: `User question: ${question}`,
      system_instruction: systemPrompt,
      temperature: 0.2,
    });
    // Strip markdown fences
    code = code.replace(/^```(?:python)?\n?/i, '').replace(/\n?```$/, '').trim();
  } catch (e: any) {
    return { python_code: '', stdout: '', matplotlib_images: [], error: `Code generation failed: ${e.message}` };
  }

  if (!session.db) {
    return { python_code: code, stdout: '', matplotlib_images: [], error: 'No database session available.' };
  }

  try {
    const allRows = Object.values(tables)[0]?.rows ?? [];
    // Cap at 10,000 rows to prevent oversized JSON payloads
    const rows = allRows.length > 10000 ? allRows.slice(0, 10000) : allRows;
    console.log(`[CodeAgent] Sending ${rows.length} rows to sidecar (original: ${allRows.length})`);
    const result = await sidecarExecuteCode({ code, session_id: session.db.sessionId, rows, timeout_s: 60 });
    const images = result.artifacts
      .filter((a) => a.type === 'image')
      .map((a) => a.b64);

    return {
      python_code: code,
      stdout: result.stdout,
      matplotlib_images: images,
      error: result.error,
    };
  } catch (e: any) {
    console.error(`[CodeAgent] Sidecar call failed:`, e.message);
    return {
      python_code: code,
      stdout: '',
      matplotlib_images: [],
      error: `Code execution failed: ${e.message}`,
    };
  }
}
