/**
 * GET /api/debug-sandbox — Tests the Python sidecar code execution sandbox.
 */
import { Router, Request, Response } from 'express';
import { sidecarExecuteCode } from '../utils/sidecarClient';

const router = Router();

const DEBUG_CODE = `
import io, base64, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.figure(figsize=(6,4))
plt.bar(["Q1","Q2","Q3","Q4"], df["amount"].tolist())
buf = io.BytesIO()
plt.savefig(buf, format="png", dpi=100, bbox_inches="tight", facecolor="#111827")
buf.seek(0)
_figures.append(base64.b64encode(buf.read()).decode())
plt.close()
print("sandbox ok")
`.trim();

router.get('/debug-sandbox', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await sidecarExecuteCode({
      code: DEBUG_CODE,
      session_id: '__debug__',
      rows: [
        { amount: 100, balance: 1000 },
        { amount: 200, balance: 2000 },
        { amount: 300, balance: 3000 },
        { amount: 400, balance: 4000 },
      ],
    });
    res.json({
      success: !result.error,
      figures_count: (result.artifacts ?? []).filter((a: any) => a.type === 'image').length,
      stdout: result.stdout ?? '',
      error: result.error ?? null,
    });
  } catch (e: any) {
    res.status(503).json({
      success: false, figures_count: 0,
      error: `Sidecar unavailable: ${e.message}`,
    });
  }
});

export default router;
