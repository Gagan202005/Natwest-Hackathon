/**
 * GET/POST /api/semantic-layer — Mirrors Python backend/app/routes/semantic.py.
 */
import { Router, Request, Response } from 'express';
import { sessions } from '../sessions';
import { SemanticLayerManager } from '../core/semanticLayer';

const router = Router();

router.get('/semantic-layer', (req: Request, res: Response): void => {
  const session_id = req.query.session_id as string;
  if (!session_id || !sessions.has(session_id)) {
    res.status(404).json({ detail: 'Session not found.' });
    return;
  }
  const semantic = sessions.get(session_id)!.semanticLayer;
  res.json({ metrics: semantic?.getMetrics() ?? [] });
});

router.post('/semantic-layer', (req: Request, res: Response): void => {
  const { session_id, metrics } = req.body;
  if (!session_id || !sessions.has(session_id)) {
    res.status(404).json({ detail: 'Session not found.' });
    return;
  }
  const session = sessions.get(session_id)!;
  if (!session.semanticLayer) session.semanticLayer = new SemanticLayerManager();
  session.semanticLayer.setMetrics(metrics ?? []);
  res.json({ status: 'ok', count: (metrics ?? []).length });
});

export default router;
