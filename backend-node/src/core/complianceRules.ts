/**
 * Deterministic compliance rule engine — mirrors Python backend/app/core/compliance_rules.py.
 */
import { ParsedRow } from '../types';

const PII_PATTERNS = [
  'aadhaar','aadhar','uid','biometric','fingerprint','iris',
  'pan_number','pan number','passport','voter_id','voter id',
  'ssn','social security','dob','date_of_birth','date of birth',
  'password','pin','cvv','credit_card','debit_card',
];

export function checkPiiQuery(question: string): Record<string, string> | null {
  const q = question.toLowerCase();
  for (const pattern of PII_PATTERNS) {
    if (q.includes(pattern)) {
      return {
        rule: 'PII_EXPOSURE',
        status: 'blocked',
        message: `Query blocked: This analysis appears to request access to sensitive personal data ('${pattern}'). Per the DPDP Act 2023, PII including Aadhaar, PAN, biometrics, and financial credentials must be anonymised before analysis. Use the Sensitive Column toggle to mask this field first.`,
      };
    }
  }
  return null;
}

function checkNpaClassification(data: ParsedRow[]): Record<string, any> | null {
  if (!data.length) return null;
  const keys = Object.keys(data[0]);
  let daysCol: string | null = null;
  let classCol: string | null = null;
  for (const k of keys) {
    const kl = k.toLowerCase();
    if (!daysCol && ['days_past','dpd','overdue','past_due'].some((x) => kl.includes(x))) daysCol = k;
    if (!classCol && ['classification','npa','asset_class','status'].some((x) => kl.includes(x))) classCol = k;
  }
  if (!daysCol || !classCol) return null;
  const misclassified = data.filter((row) => {
    const dpd = parseInt(String(row[daysCol!] ?? 0), 10);
    const cls = String(row[classCol!] ?? '').trim().toLowerCase();
    return dpd >= 61 && dpd <= 90 && ['standard', 'regular'].includes(cls);
  });
  if (!misclassified.length) {
    return { rule: 'NPA_CLASSIFICATION', status: 'compliant', message: 'NPA classification verified. All accounts with DPD 61–90 days are correctly marked SMA-2 per RBI IRAC norms.' };
  }
  return {
    rule: 'NPA_CLASSIFICATION', status: 'warning',
    message: `${misclassified.length} loan(s) appear misclassified: DPD between 61–90 days but still marked 'Standard'. Per RBI IRAC norms, these should be SMA-2.`,
    affected_count: misclassified.length,
  };
}

const PSL_SECTORS = new Set(['agriculture','msme','education','housing','weaker sections','priority sector']);

function checkPslRatio(data: ParsedRow[]): Record<string, any> | null {
  if (!data.length) return null;
  const keys = Object.keys(data[0]);
  let sectorCol: string | null = null;
  let amountCol: string | null = null;
  for (const k of keys) {
    const kl = k.toLowerCase();
    if (!sectorCol && ['sector','category','purpose','segment'].some((x) => kl.includes(x))) sectorCol = k;
    if (!amountCol && ['amount','principal','outstanding','balance','loan_amount'].some((x) => kl.includes(x))) amountCol = k;
  }
  if (!sectorCol || !amountCol) return null;
  let total = 0; let psl = 0;
  for (const row of data) {
    const amt = parseFloat(String(row[amountCol!] ?? 0)) || 0;
    const sec = String(row[sectorCol!] ?? '').trim().toLowerCase();
    total += amt;
    if ([...PSL_SECTORS].some((s) => sec.includes(s))) psl += amt;
  }
  if (total === 0) return null;
  const ratio = (psl / total) * 100;
  if (ratio >= 40) return { rule: 'PSL_RATIO', status: 'compliant', message: `PSL ratio is ${ratio.toFixed(1)}%, meeting the RBI mandate of 40%.` };
  const shortfall = ((40 / 100) - (psl / total)) * total;
  return {
    rule: 'PSL_RATIO', status: 'warning',
    message: `PSL ratio is ${ratio.toFixed(1)}%, below RBI mandate of 40%. Shortfall: ${(40 - ratio).toFixed(1)} pp (approx ₹${(shortfall / 1e7).toFixed(1)} Cr).`,
    psl_ratio: Math.round(ratio * 100) / 100, target: 40,
  };
}

function checkPmlaThreshold(data: ParsedRow[]): Record<string, any> | null {
  if (!data.length) return null;
  const THRESHOLD = 1_000_000;
  const keys = Object.keys(data[0]);
  let amountCol: string | null = null;
  let modeCol: string | null = null;
  for (const k of keys) {
    const kl = k.toLowerCase();
    if (!amountCol && ['amount','value','txn_amount'].some((x) => kl.includes(x))) amountCol = k;
    if (!modeCol && ['mode','channel','type','method'].some((x) => kl.includes(x))) modeCol = k;
  }
  if (!amountCol) return null;
  const triggers = data.filter((row) => {
    const amt = parseFloat(String(row[amountCol!] ?? 0)) || 0;
    const mode = modeCol ? String(row[modeCol] ?? '').toLowerCase() : '';
    return amt >= THRESHOLD && (mode.includes('cash') || mode === '');
  });
  if (!triggers.length) return null;
  return {
    rule: 'PMLA_CTR_THRESHOLD', status: 'warning',
    message: `${triggers.length} transaction(s) meet the PMLA CTR threshold of ₹10 lakh. CTRs must be filed with FIU-IND by the 15th of the following month.`,
    affected_count: triggers.length,
  };
}

export function runAllApplicableRules(question: string, data: ParsedRow[]): Record<string, any>[] {
  const annotations: Record<string, any>[] = [];
  const q = question.toLowerCase();

  if (['npa','asset class','classification','overdue','past due','dpd','sma','standard'].some((kw) => q.includes(kw))) {
    const r = checkNpaClassification(data);
    if (r) annotations.push(r);
  }
  if (['psl','priority sector','agriculture','msme','education','housing','weaker'].some((kw) => q.includes(kw))) {
    const r = checkPslRatio(data);
    if (r) annotations.push(r);
  }
  if (['cash','transaction','pmla','aml','suspicious','structuring','10 lakh','threshold'].some((kw) => q.includes(kw))) {
    const r = checkPmlaThreshold(data);
    if (r) annotations.push(r);
  }

  return annotations;
}
