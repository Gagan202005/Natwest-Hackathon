/**
 * Compliance Agent — mirrors Python backend/app/agents/compliance_agent.py.
 */
import { getComplianceKb } from '../core/complianceKb';
import { checkPiiQuery, runAllApplicableRules } from '../core/complianceRules';
import { gemini } from '../utils/geminiClient';
import { ParsedRow, ColumnSchema, ComplianceResult, ChatResponse } from '../types';

const COMPLIANCE_QA_PROMPT = `You are a banking compliance expert. Answer the user's question using ONLY the regulatory excerpts provided below.

Rules:
- Cite the source document name for every key point
- Use plain English, no legal jargon unless necessary
- If the excerpts don't contain enough information, say so clearly
- Format your answer in markdown with bullet points for key rules
- End with a "Compliance Action Required:" line if the finding requires immediate action

Regulatory excerpts:
{context}

User question: {question}`;

const LOW_CONF = { score: 30, level: 'Low' as const, breakdown: { row_coverage: 0, data_completeness: 100, schema_match: 0, web_corroboration: 0, compliance_check: 30 } };

export function preScreen(question: string): Partial<ChatResponse> | null {
  const block = checkPiiQuery(question);
  if (!block) return null;
  return {
    answer: `🔴 **${block.message}**`,
    agent_used: 'compliance_agent',
    compliance: { status: 'blocked', annotations: [block as any] },
    sql_query: null, python_code: null, chart: null, matplotlib_image: null,
    data: [], confidence: { score: 0, level: 'Low', breakdown: { row_coverage: 0, data_completeness: 0, schema_match: 20, web_corroboration: 0, compliance_check: 0 } },
    sources: [], suggestions: [], web_context: [], from_cache: false,
  };
}

export function postValidate(question: string, data: ParsedRow[], schema?: ColumnSchema[]): ComplianceResult {
  const annotations = runAllApplicableRules(question, data);
  if (!annotations.length) {
    return { status: 'compliant', annotations: [{ rule: 'GENERAL', status: 'compliant', message: 'No compliance issues detected for this analysis.' }] };
  }
  const hasWarning = annotations.some((a) => a.status === 'warning');
  return { status: hasWarning ? 'warning' : 'compliant', annotations: annotations as ComplianceResult['annotations'] };
}

export async function answerComplianceQuestion(question: string, schema?: ColumnSchema[]): Promise<ChatResponse> {
  const kb = getComplianceKb();

  if (!kb.isLoaded) {
    return {
      answer: '⚠️ Compliance knowledge base is not loaded. Please ensure compliance policy documents are present in the compliance_docs directory.',
      agent_used: 'compliance_agent',
      compliance: { status: 'warning', annotations: [] },
      sql_query: null, python_code: null, chart: null, matplotlib_image: null,
      data: [], confidence: { ...LOW_CONF }, sources: [], suggestions: [], web_context: [], from_cache: false,
    };
  }

  const chunks = kb.retrieve(question, 4);
  if (!chunks.length) {
    return {
      answer: "I couldn't find relevant regulatory information for this question in the loaded policy documents.",
      agent_used: 'compliance_agent',
      compliance: { status: 'compliant', annotations: [] },
      sql_query: null, python_code: null, chart: null, matplotlib_image: null,
      data: [], confidence: { score: 40, level: 'Low', breakdown: { row_coverage: 0, data_completeness: 100, schema_match: 0, web_corroboration: 0, compliance_check: 40 } },
      sources: [], suggestions: [], web_context: [], from_cache: false,
    };
  }

  const context = chunks.map((c) => `[Source: ${c.title}]\n${c.text}`).join('\n\n---\n\n');
  const prompt = COMPLIANCE_QA_PROMPT.replace('{context}', context).replace('{question}', question);

  let answer: string;
  try {
    answer = await gemini.generate({ prompt, temperature: 0.2 });
  } catch (e: any) {
    answer = `Error generating compliance answer: ${e.message}`;
  }

  const sources = chunks.map((c) => ({ type: 'policy' as const, value: c.title, url: '' }));
  const confidenceScore = Math.min(95, Math.round(Math.max(...chunks.map((c) => c.score)) * 100) + 50);

  return {
    answer, agent_used: 'compliance_agent',
    compliance: {
      status: 'compliant',
      annotations: [{ rule: 'POLICY_QA', status: 'compliant', message: `Answer retrieved from: ${chunks.slice(0, 2).map((c) => c.title).join(', ')}` }],
    },
    sql_query: null, python_code: null, chart: null, matplotlib_image: null, data: [],
    confidence: {
      score: confidenceScore,
      level: confidenceScore >= 75 ? 'High' : 'Medium',
      breakdown: { row_coverage: 0, data_completeness: 100, schema_match: 0, web_corroboration: 0, compliance_check: confidenceScore },
    },
    sources, suggestions: [
      'What are the provisioning requirements for NPA accounts?',
      'What is the PSL target for agriculture?',
      'What transactions require a Suspicious Transaction Report?',
    ],
    web_context: [], from_cache: false,
  };
}
