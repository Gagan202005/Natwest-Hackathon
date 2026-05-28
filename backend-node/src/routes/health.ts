import { Router } from 'express';
import { sessions } from '../sessions';
import { getComplianceKb } from '../core/complianceKb';

const router = Router();

router.get('/health', (_req, res) => {
  const kb = getComplianceKb();
  res.json({
    status: 'ok',
    sessions: sessions.size,
    compliance_kb_loaded: kb.isLoaded,
    compliance_chunks: kb.isLoaded ? kb.chunkCount : 0,
  });
});

export default router;
