import React, { useState, useEffect } from 'react';
import { X, FlaskConical, ChevronRight, Check, Loader, BarChart2, MessageSquare, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const STEP_LABELS = ['Select Use Case', 'Configure', 'Results'];

export default function ModelLab({ isOpen, onClose, sessionId, schema = [], onDiscussInChat }) {
  const [step, setStep]               = useState(0);
  const [useCases, setUseCases]       = useState([]);
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [selectedModels, setSelectedModels]   = useState([]);
  const [columnMapping, setColumnMapping]     = useState({});
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  // Load use cases when opened
  useEffect(() => {
    if (isOpen && useCases.length === 0) {
      api.getAvailableModels(sessionId).then(d => setUseCases(d.use_cases || [])).catch(() => {});
    }
  }, [isOpen, sessionId]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep(0); setSelectedUseCase(null); setSelectedModels([]);
      setColumnMapping({}); setResult(null); setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ucInfo = useCases.find(u => u.id === selectedUseCase) || null;
  const columnNames = schema.map(c => c.name);

  const toggleModel = (m) => {
    setSelectedModels(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleRun = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.runModels(sessionId, selectedUseCase, selectedModels, columnMapping);
      setResult(res);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.detail || 'Model inference failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscuss = () => {
    if (!result || !onDiscussInChat) return;
    const summary = buildDiscussSummary(result, ucInfo);
    onDiscussInChat(summary);
    onClose();
  };

  return (
    <div className="model-lab-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="model-lab-overlay">
        {/* Header */}
        <div className="model-lab-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlaskConical size={18} style={{ color: 'var(--accent)' }} />
            <span className="model-lab-title">ML Model Lab</span>
          </div>
          <button className="model-lab-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Steps */}
        <div className="model-lab-steps">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className={`model-lab-step${step === i ? ' active' : step > i ? ' done' : ''}`}>
              <span className="step-num">{step > i ? <Check size={10} /> : i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="model-lab-body">

          {/* Step 0 — select use case */}
          {step === 0 && (
            <div>
              <p className="model-lab-section-label">Choose what to predict or detect</p>
              {useCases.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                  <Loader size={20} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                  Loading use cases…
                </div>
              )}
              <div className="use-case-grid">
                {useCases.map(uc => (
                  <button
                    key={uc.id}
                    className={`use-case-card${selectedUseCase === uc.id ? ' selected' : ''}`}
                    onClick={() => { setSelectedUseCase(uc.id); setSelectedModels([]); setColumnMapping({}); }}
                  >
                    <div className="use-case-card-title">{uc.name}</div>
                    <div className="use-case-card-desc">{uc.description}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {(uc.available_models || []).map(m => (
                        <span key={m} className="use-case-model-tag">{m}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="model-lab-btn primary"
                  disabled={!selectedUseCase}
                  onClick={() => setStep(1)}
                >
                  Configure <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — configure */}
          {step === 1 && ucInfo && (
            <div>
              <p className="model-lab-section-label">Select models to compare</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {(ucInfo.available_models || []).map(m => (
                  <button
                    key={m}
                    className={`model-chip${selectedModels.includes(m) ? ' selected' : ''}`}
                    onClick={() => toggleModel(m)}
                  >
                    {selectedModels.includes(m) && <Check size={11} />}
                    {m}
                  </button>
                ))}
              </div>

              {/* Column mapping — only if columns exist in schema */}
              {columnNames.length > 0 && (ucInfo.required_features || []).length > 0 && (
                <>
                  <p className="model-lab-section-label">Column mapping <span style={{ opacity: 0.5, fontSize: 11 }}>(optional — auto-detected)</span></p>
                  <div className="col-mapping-grid">
                    {(ucInfo.required_features || []).map(feat => (
                      <div key={feat} className="col-mapping-row">
                        <span className="col-mapping-label">{feat}</span>
                        <select
                          className="col-mapping-select"
                          value={columnMapping[feat] || ''}
                          onChange={e => setColumnMapping(prev => ({ ...prev, [feat]: e.target.value }))}
                        >
                          <option value="">Auto-detect</option>
                          {columnNames.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {error && (
                <div className="model-lab-error">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                <button className="model-lab-btn secondary" onClick={() => setStep(0)}>Back</button>
                <button
                  className="model-lab-btn primary"
                  disabled={selectedModels.length === 0 || loading}
                  onClick={handleRun}
                >
                  {loading ? <><Loader size={13} style={{ marginRight: 6 }} />Running…</> : <>Run Models <ChevronRight size={14} /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — results */}
          {step === 2 && result && (
            <div>
              <p className="model-lab-section-label">Model comparison — {ucInfo?.name}</p>

              {/* Metrics table */}
              {result.metrics && Object.keys(result.metrics).length > 0 && (
                <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Model</th>
                        {Object.keys(Object.values(result.metrics)[0] || {}).map(k => (
                          <th key={k}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.metrics).map(([model, vals]) => (
                        <tr key={model}>
                          <td><strong>{model}</strong></td>
                          {Object.values(vals).map((v, i) => (
                            <td key={i}>{typeof v === 'number' ? v.toFixed(4) : v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Feature importance chart */}
              {result.feature_importance_chart && (
                <div style={{ marginBottom: 16 }}>
                  <p className="model-lab-section-label">Feature Importance</p>
                  <img
                    src={`data:image/png;base64,${result.feature_importance_chart}`}
                    alt="Feature importance"
                    style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                </div>
              )}

              {/* Metrics chart */}
              {result.metrics_chart && (
                <div style={{ marginBottom: 16 }}>
                  <p className="model-lab-section-label">Metrics Comparison</p>
                  <img
                    src={`data:image/png;base64,${result.metrics_chart}`}
                    alt="Metrics comparison"
                    style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                </div>
              )}

              {/* Predictions sample */}
              {result.predictions_sample && result.predictions_sample.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p className="model-lab-section-label">Sample Predictions (top 10)</p>
                  <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto' }}>
                    <table className="metrics-table">
                      <thead>
                        <tr>{Object.keys(result.predictions_sample[0]).map(k => <th key={k}>{k}</th>)}</tr>
                      </thead>
                      <tbody>
                        {result.predictions_sample.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((v, j) => (
                              <td key={j}>{typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(3)) : String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <button className="model-lab-btn secondary" onClick={() => { setStep(1); setResult(null); }}>Re-run</button>
                <button className="model-lab-btn primary" onClick={handleDiscuss}>
                  <MessageSquare size={13} /> Discuss in Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildDiscussSummary(result, ucInfo) {
  const lines = [`I just ran the **${ucInfo?.name || 'Model Lab'}** analysis. Here are the results:`];
  if (result.metrics) {
    Object.entries(result.metrics).forEach(([model, vals]) => {
      const parts = Object.entries(vals).map(([k, v]) => `${k}: ${typeof v === 'number' ? v.toFixed(3) : v}`).join(', ');
      lines.push(`- **${model}**: ${parts}`);
    });
  }
  if (result.note) lines.push(`\n*Note: ${result.note}*`);
  lines.push('\nWhat insights can you give me about these results?');
  return lines.join('\n');
}
