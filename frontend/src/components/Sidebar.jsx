import React, { useState } from 'react';
import { Plus, Trash2, Database, FileSpreadsheet, Download, Lock, Layers, Edit3, BarChart2, ShieldAlert } from 'lucide-react';
import SemanticLayerEditor from './SemanticLayerEditor';

export default function Sidebar({
  isOpen, fileData, onNewChat, onClearDataset, onExportPDF,
  semanticLayer, onUpdateSemanticLayer, sessionId,
  schema, dataQuality, sensitiveColumns = [], onUpdateSensitiveColumns,
}) {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      <aside className="sidebar" style={{ width: isOpen ? 252 : 0 }}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <BarChart2 size={15} />
            </div>
            <div>
              <div className="sidebar-brand-name">DataTalk</div>
              <div className="sidebar-brand-sub">AI Data Analyst</div>
            </div>
          </div>
          <button className="sidebar-new-chat" onClick={onNewChat}>
            <Plus size={13} />
            New chat
          </button>
        </div>

        {/* Body */}
        <div className="sidebar-body">
          {fileData ? (
            <>
              {/* Dataset info */}
              <div>
                <div className="sidebar-section-label">Active Dataset</div>
                <div className="sidebar-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Database size={12} style={{ color: 'var(--sidebar-accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sidebar-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fileData.name || fileData.fileName}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Rows', val: ((fileData.rows || fileData.rowCount) || 0).toLocaleString() },
                      { label: 'Cols', val: fileData.columns || fileData.colCount || 0 },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ textAlign: 'center', padding: '5px 0', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{ fontSize: 9, color: 'var(--sidebar-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sidebar-text)', marginTop: 1 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {(schema || []).length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(schema || []).slice(0, 5).map(c => (
                        <span key={c.name} style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--sidebar-muted)', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                      ))}
                      {(schema || []).length > 5 && (
                        <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'var(--sidebar-muted)' }}>
                          +{schema.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Data Quality */}
              <div>
                <div className="sidebar-section-label">Data Quality</div>
                <div className="sidebar-card">
                  {(() => {
                    const score = dataQuality?.overall_score ?? 100;
                    const color = score >= 75 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';
                    const nullCount = (schema || []).filter(c => c.missing_pct > 0).length;
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--sidebar-muted)' }}>Overall score</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}%</span>
                        </div>
                        <div className="quality-bar-track">
                          <div className="quality-bar-fill" style={{ width: `${score}%`, backgroundColor: color }} />
                        </div>
                        <p style={{ fontSize: 10, marginTop: 5, color: nullCount > 0 ? '#fbbf24' : '#4ade80' }}>
                          {nullCount > 0 ? `${nullCount} column${nullCount > 1 ? 's' : ''} with missing values` : 'No missing values'}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Sensitive columns */}
              {(schema || []).length > 0 && (
                <div>
                  <div className="sidebar-section-label">Sensitive Columns</div>
                  <div className="sidebar-card" style={{ maxHeight: 176, overflowY: 'auto' }}>
                    <p style={{ fontSize: 10.5, color: 'var(--sidebar-muted)', marginBottom: 8, lineHeight: 1.5 }}>
                      Click to mark private/PII columns — the AI will hide their values from answers.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(schema || []).map(c => {
                        const isSensitive = sensitiveColumns.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            className={`col-tag ${isSensitive ? 'sensitive' : 'normal'}`}
                            onClick={() => onUpdateSensitiveColumns && onUpdateSensitiveColumns(
                              isSensitive
                                ? sensitiveColumns.filter(n => n !== c.name)
                                : [...sensitiveColumns, c.name]
                            )}
                            title={isSensitive ? `${c.name} — marked as sensitive (click to unmark)` : `Click to mark '${c.name}' as sensitive`}
                          >
                            {isSensitive && <Lock size={9} style={{ flexShrink: 0 }} />}
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Semantic Layer */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div className="sidebar-section-label" style={{ marginBottom: 0 }}>Semantic Layer</div>
                  <button
                    onClick={() => setShowEditor(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--sidebar-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <Edit3 size={9} /> Edit
                  </button>
                </div>
                <div className="sidebar-card">
                  {semanticLayer && semanticLayer.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {semanticLayer.slice(0, 4).map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Layers size={9} style={{ color: 'var(--sidebar-accent)', flexShrink: 0 }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--sidebar-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                          <span style={{ fontSize: 9, color: 'var(--sidebar-muted)', marginLeft: 'auto', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>{m.expression}</span>
                        </div>
                      ))}
                      {semanticLayer.length > 4 && (
                        <p style={{ fontSize: 9, color: 'var(--sidebar-muted)', textAlign: 'center' }}>+{semanticLayer.length - 4} more</p>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: 10, color: 'var(--sidebar-muted)', textAlign: 'center', padding: '4px 0' }}>No metrics defined</p>
                  )}
                </div>
              </div>

              {/* Clear */}
              <button
                onClick={onClearDataset}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '7px 0', borderRadius: 7, background: 'none', border: 'none', fontSize: 11, color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,113,113,0.5)'}
              >
                <Trash2 size={11} /> Clear dataset
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <FileSpreadsheet size={28} style={{ color: 'var(--sidebar-muted)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 11, color: 'var(--sidebar-muted)' }}>No dataset loaded</p>
              <p style={{ fontSize: 10, color: '#3a3f52', marginTop: 3 }}>Upload a CSV to get started</p>
            </div>
          )}

          {/* Privacy notice */}
          <div style={{ borderRadius: 8, border: '1px solid rgba(74,222,128,0.12)', background: 'rgba(74,222,128,0.04)', padding: '9px 11px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Lock size={11} style={{ color: '#4ade80' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#4ade80' }}>Privacy secured</span>
            </div>
            <p style={{ fontSize: 9, color: '#3a5a44', lineHeight: 1.5 }}>Your data never leaves this server. All processing is local.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-export-btn" onClick={onExportPDF} disabled={!fileData}>
            <Download size={13} />
            Export PDF Report
          </button>
        </div>
      </aside>

      <SemanticLayerEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        semanticLayer={semanticLayer || []}
        onSave={(metrics) => { onUpdateSemanticLayer && onUpdateSemanticLayer(metrics); }}
        sessionId={sessionId}
      />
    </>
  );
}
