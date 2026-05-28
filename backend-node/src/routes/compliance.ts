/**
 * GET  /api/compliance/documents
 * POST /api/compliance/query
 * Mirrors Python backend/app/routes/compliance.py.
 */
import { Router, Request, Response } from 'express';
import { getComplianceKb } from '../core/complianceKb';
import { answerComplianceQuestion } from '../agents/complianceAgent';

const router = Router();

router.get('/compliance/documents', (_req: Request, res: Response): void => {
  const kb = getComplianceKb();
  if (!kb.isLoaded) {
    res.json({ documents: [], loaded: false });
    return;
  }
  res.json({ documents: kb.listDocuments(), loaded: true, total_chunks: kb.chunkCount });
});

router.post('/compliance/query', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ detail: 'question is required.' });
      return;
    }
    const result = await answerComplianceQuestion(question, undefined);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ detail: `Compliance query failed: ${e.message}` });
  }
});

export default router;
