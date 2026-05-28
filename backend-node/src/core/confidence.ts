/**
 * Confidence score calculator — mirrors Python backend/app/core/confidence.py exactly.
 */
import { Confidence, ColumnSchema, WebResult } from '../types';

export function calculateConfidence(opts: {
  rows_used?: number;
  total_rows?: number;
  columns_used?: string[];
  schema?: ColumnSchema[];
  question?: string;
  web_results?: WebResult[];
  sql_error?: string | null;
  compliance_status?: string;
}): Confidence {
  const {
    rows_used = 0, total_rows = 0, columns_used = [], schema = [],
    question = '', web_results = [], sql_error = null, compliance_status = 'compliant',
  } = opts;

  if (sql_error) {
    return {
      score: 20,
      level: 'Low',
      breakdown: { row_coverage: 0, data_completeness: 0, schema_match: 20, web_corroboration: 0, compliance_check: 0 },
    };
  }

  const rowScore = total_rows > 0 ? Math.min(1, rows_used / total_rows) * 100 : 0;

  let completenessScore: number;
  if (columns_used.length > 0 && schema.length > 0) {
    const schemaMap = new Map(schema.map((c) => [c.name.toLowerCase(), c]));
    const missingPcts = columns_used.map((c) => schemaMap.get(c.toLowerCase())?.missing_pct ?? 0);
    completenessScore = Math.max(0, 100 - missingPcts.reduce((a, b) => a + b, 0) / Math.max(missingPcts.length, 1));
  } else {
    completenessScore = 50;
  }

  let schemaScore: number;
  if (columns_used.length > 0) {
    const known = new Set(schema.map((c) => c.name.toLowerCase()));
    const matched = columns_used.filter((c) => known.has(c.toLowerCase())).length;
    schemaScore = (matched / Math.max(columns_used.length, 1)) * 100;
  } else {
    const qLower = question.toLowerCase();
    const matches = schema.filter((c) => qLower.includes(c.name.toLowerCase())).length;
    schemaScore = matches ? Math.min(100, matches * 25) : 30;
  }

  const webScore = Math.min(100, web_results.length * 25);
  const complianceScore: Record<string, number> = { compliant: 100, warning: 50, blocked: 0 };
  const compScore = complianceScore[compliance_status] ?? 100;

  const total = rowScore * 0.25 + completenessScore * 0.25 + schemaScore * 0.20 + webScore * 0.15 + compScore * 0.15;
  const level = total >= 75 ? 'High' : total >= 50 ? 'Medium' : 'Low';

  return {
    score: Math.round(total),
    level,
    breakdown: {
      row_coverage: Math.round(rowScore),
      data_completeness: Math.round(completenessScore),
      schema_match: Math.round(schemaScore),
      web_corroboration: Math.round(webScore),
      compliance_check: Math.round(compScore),
    },
  };
}
