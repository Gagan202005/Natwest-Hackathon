/**
 * GET  /api/sample-datasets
 * POST /api/sample-datasets/load
 * Mirrors Python backend/app/routes/sample_data.py.
 */
import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sessions } from '../sessions';
import { config } from '../config';
import { parseBuffer } from '../core/fileHandler';
import { detectIssues } from '../core/preprocessor';

const SAMPLE_DATASETS = [
  { id: 'loan_portfolio', name: 'Loan Portfolio', description: '5,000 synthetic bank loans with NPA analysis, PSL tracking, and stress testing scenarios', filename: 'loan_portfolio.csv', rows: 5000, tags: ['NPA', 'PSL', 'Credit Risk', 'Stress Test'], icon: 'building-2' },
  { id: 'transactions', name: 'Transaction Ledger', description: '50,000 banking transactions with AML patterns, CTR triggers, and structuring examples', filename: 'transactions.csv', rows: 50000, tags: ['AML', 'PMLA', 'Fraud', 'CTR'], icon: 'credit-card' },
  { id: 'customers', name: 'Customer Base', description: '10,000 bank customers with churn signals, segmentation patterns, and product data', filename: 'customers.csv', rows: 10000, tags: ['Churn', 'Segmentation', 'CRM'], icon: 'users' },
];

const router = Router();

router.get('/sample-datasets', (_req: Request, res: Response): void => {
  const result = SAMPLE_DATASETS.map((ds) => ({
    ...ds,
    available: fs.existsSync(path.join(config.sampleDataDir, ds.filename)),
  }));
  res.json({ datasets: result });
});

router.post('/sample-datasets/load', async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataset_id, session_id } = req.body;
    const ds = SAMPLE_DATASETS.find((d) => d.id === dataset_id);
    if (!ds) {
      res.status(404).json({ detail: `Sample dataset '${dataset_id}' not found.` });
      return;
    }
    const fpath = path.join(config.sampleDataDir, ds.filename);
    if (!fs.existsSync(fpath)) {
      res.status(404).json({ detail: `Dataset file not found. Run the generator script first.` });
      return;
    }

    const buffer = fs.readFileSync(fpath);
    let rows;
    try {
      rows = parseBuffer(buffer, ds.filename);
    } catch (e: any) {
      res.status(500).json({ detail: `Failed to load dataset: ${e.message}` });
      return;
    }

    const [cleanedRows, autoFixes, mediumIssues] = detectIssues(rows);
    const finalSessionId = (session_id as string) || uuidv4();

    if (!sessions.has(finalSessionId)) {
      sessions.set(finalSessionId, { tables: {}, messages: [], cache: {} });
    }

    const session = sessions.get(finalSessionId)!;
    session.dfPreprocessed = cleanedRows;
    session.pendingFilename = ds.filename;

    res.json({
      temp_id: finalSessionId, session_id: finalSessionId, filename: ds.filename,
      row_count: cleanedRows.length,
      column_count: cleanedRows.length > 0 ? Object.keys(cleanedRows[0]).length : 0,
      auto_fixes: autoFixes, issues: mediumIssues, dataset_info: ds,
    });
  } catch (e: any) {
    res.status(500).json({ detail: `Internal error: ${e.message}` });
  }
});

export default router;
