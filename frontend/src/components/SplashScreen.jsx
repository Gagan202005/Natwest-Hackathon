import React, { useState } from 'react';
import { Shield, Lock, Brain, FileText, Database, Zap, CheckCircle, ArrowRight, Eye, AlertTriangle } from 'lucide-react';

const FEATURES = [
  { icon: Brain,    label: 'Natural Language Queries',   desc: 'Ask questions in plain English — no SQL needed' },
  { icon: Shield,   label: 'Security-First Architecture', desc: 'Built-in compliance monitoring & data guardrails' },
  { icon: Database, label: 'Multi-Source Data Analysis',  desc: 'CSV, Excel, JSON — instant schema exploration' },
  { icon: Eye,      label: 'Regulatory Compliance',       desc: 'PMLA / AML, KYC, DPDP Act 2023 enforcement' },
  { icon: FileText, label: 'PDF Report Generation',       desc: 'Export AI-generated audit-ready reports' },
  { icon: Zap,      label: 'Real-Time Insights',          desc: 'Streaming AI responses with chart rendering' },
];

export default function SplashScreen({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleOpen = () => {
    setFadeOut(true);
    setTimeout(() => onComplete(), 500);
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    .lp-root {
      position: fixed; inset: 0; z-index: 100;
      background: #000;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      transition: opacity 0.5s ease;
    }
    .lp-root.lp-fade-out { opacity: 0; pointer-events: none; }

    /* Ambient blobs */
    .lp-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
    }
    .lp-blob-1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(123,63,228,0.18) 0%, transparent 70%);
      top: -160px; left: -100px;
    }
    .lp-blob-2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(0,212,161,0.12) 0%, transparent 70%);
      bottom: -120px; right: 80px;
    }
    .lp-blob-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(123,63,228,0.10) 0%, transparent 70%);
      top: 40%; right: 35%;
    }

    /* Grid layout */
    .lp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      width: 100%; height: 100vh;
    }

    /* ── LEFT ── */
    .lp-left {
      padding: 56px 44px 56px 64px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative; z-index: 2;
    }

    /* Hackathon badge */
    .lp-event-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .lp-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px;
      border-radius: 99px;
      border: 1px solid rgba(123,63,228,0.45);
      background: rgba(123,63,228,0.12);
      font-size: 11px;
      font-weight: 600;
      color: #b48eff;
      width: fit-content;
      letter-spacing: 0.03em;
    }
    .lp-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00D4A1;
      flex-shrink: 0;
      animation: lp-pulse 2s ease-in-out infinite;
    }
    @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .lp-team {
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.04em;
      margin: 0;
    }

    /* Headline */
    .lp-headline {
      font-size: clamp(38px, 4vw, 62px);
      font-weight: 300;
      color: #ffffff;
      line-height: 1.12;
      letter-spacing: -0.03em;
      margin: 0;
    }
    .lp-headline .lp-grad {
      background: linear-gradient(135deg, #9b6dff 0%, #00D4A1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
    .lp-theme-label {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin: -8px 0 0;
    }

    /* Security highlight */
    .lp-security-bar {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid rgba(0,212,161,0.25);
      background: rgba(0,212,161,0.05);
    }
    .lp-sec-icon {
      width: 34px; height: 34px;
      border-radius: 9px;
      background: rgba(0,212,161,0.12);
      border: 1px solid rgba(0,212,161,0.3);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      color: #00D4A1;
    }
    .lp-sec-title {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 3px;
    }
    .lp-sec-sub {
      font-size: 11.5px;
      color: rgba(255,255,255,0.5);
      line-height: 1.55;
    }

    /* Feature grid */
    .lp-features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .lp-feat {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 10px 12px;
      border-radius: 9px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.03);
      transition: border-color 0.2s, background 0.2s;
      cursor: default;
    }
    .lp-feat:hover {
      border-color: rgba(123,63,228,0.35);
      background: rgba(123,63,228,0.07);
    }
    .lp-feat-icon {
      width: 26px; height: 26px;
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .lp-feat-label {
      font-size: 11.5px;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      margin-bottom: 2px;
    }
    .lp-feat-desc {
      font-size: 10.5px;
      color: rgba(255,255,255,0.38);
      line-height: 1.4;
    }

    /* CTA */
    .lp-cta-row { display: flex; align-items: center; gap: 16px; }
    .lp-cta {
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 13px 30px;
      border-radius: 11px;
      background: linear-gradient(135deg, #7B3FE4 0%, #5a1fb5 100%);
      color: #ffffff;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s;
      box-shadow: 0 4px 24px rgba(123,63,228,0.4);
      letter-spacing: 0.01em;
    }
    .lp-cta:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 12px 36px rgba(123,63,228,0.55);
    }
    .lp-cta .lp-arrow { transition: transform 0.2s ease; }
    .lp-cta:hover .lp-arrow { transform: translateX(4px); }
    .lp-cta::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
      transform: translateX(-100%);
      animation: lp-shimmer 3s infinite;
    }
    @keyframes lp-shimmer { 60%,100%{ transform: translateX(200%); } }
    .lp-cta-hint {
      font-size: 10.5px;
      color: rgba(255,255,255,0.25);
    }

    /* ── RIGHT: floating cards ── */
    .lp-right {
      position: relative;
      height: 100vh;
      min-height: 560px;
    }

    /* Dark floating cards */
    .lp-card {
      background: rgba(18,18,18,0.95);
      border: 1px solid rgba(255,255,255,0.09);
      backdrop-filter: blur(20px);
      border-radius: 14px;
      padding: 14px 16px;
      position: absolute;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      transition:
        transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
        box-shadow 0.3s ease,
        border-color 0.3s ease;
      cursor: default;
    }
    .lp-card:hover {
      transform: scale(1.07) translateY(-8px) rotate(0deg) !important;
      box-shadow: 0 24px 64px rgba(123,63,228,0.25), 0 0 0 1px rgba(123,63,228,0.4);
      border-color: rgba(123,63,228,0.4);
      z-index: 20 !important;
    }
    .lp-clabel {
      font-size: 9px; font-weight: 700;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.09em;
      text-transform: uppercase;
      display: flex; align-items: center; gap: 5px;
      margin-bottom: 6px;
    }
    .lp-cdot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
    .lp-cval { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.03em; }
    .lp-cpos { font-size: 10px; color: #00D4A1; margin-top: 2px; }
    .lp-cmuted { font-size: 9px; color: rgba(255,255,255,0.3); }

    @keyframes lpf1 { 0%,100%{ transform: rotate(-4deg) translateY(0); }   50%{ transform: rotate(-4deg) translateY(-7px); } }
    @keyframes lpf2 { 0%,100%{ transform: rotate(3deg) translateY(0); }    50%{ transform: rotate(3deg) translateY(-6px); } }
    @keyframes lpf3 { 0%,100%{ transform: rotate(-2.5deg) translateY(0); } 50%{ transform: rotate(-2.5deg) translateY(-9px); } }
    @keyframes lpf4 { 0%,100%{ transform: rotate(3.5deg) translateY(0); }  50%{ transform: rotate(3.5deg) translateY(-6px); } }
    @keyframes lpf5 {
      0%,100%{ transform: translateX(-50%) rotate(-1.5deg) translateY(0); }
      50%{     transform: translateX(-50%) rotate(-1.5deg) translateY(-8px); }
    }
    @keyframes dblink { 0%,100%{opacity:1} 50%{opacity:0.35} }

    .lp-fade-up { animation: lp-fadeUp 0.55s ease-out both; }
    @keyframes lp-fadeUp {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Divider line in security bar */
    .lp-check-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      color: rgba(255,255,255,0.45);
      margin-top: 2px;
    }

    @media (max-width: 768px) {
      .lp-grid { grid-template-columns: 1fr; }
      .lp-left { padding: 44px 24px; gap: 16px; }
      .lp-right { display: none; }
    }
  `;

  const featColors = ['#7B3FE4', '#00D4A1', '#3b82f6', '#f59e0b', '#ef4444', '#22c55e'];

  return (
    <>
      <style>{styles}</style>
      <div className={`lp-root${fadeOut ? ' lp-fade-out' : ''}`}>
        {/* Ambient blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />
        <div className="lp-blob lp-blob-3" />

        <div className="lp-grid">

          {/* ── LEFT ── */}
          <div className="lp-left">

            {/* Event + team */}
            <div className="lp-event-row lp-fade-up" style={{ animationDelay: '0s' }}>
              <div className="lp-badge">
                <span className="lp-badge-dot" />
                NatWest Code for Purpose · 2026
              </div>
              <span className="lp-team">team: swords of summer</span>
            </div>

            {/* Headline */}
            <div className="lp-fade-up" style={{ animationDelay: '0.1s' }}>
              <p className="lp-theme-label">Theme</p>
              <h1 className="lp-headline">
                Talk to <span className="lp-grad">Data</span>
              </h1>
            </div>

            {/* Security core highlight */}
            <div className="lp-security-bar lp-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="lp-sec-icon">
                <Shield size={16} />
              </div>
              <div>
                <div className="lp-sec-title">Security at the Core</div>
                <div className="lp-sec-sub">
                  Every query, dataset, and response is governed by built-in compliance
                  guardrails, sensitive-data masking, and real-time regulatory monitoring.
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 7, flexWrap: 'wrap' }}>
                  {['Data Masking', 'Compliance Engine', 'Audit Trail'].map(t => (
                    <div key={t} className="lp-check-row">
                      <CheckCircle size={10} style={{ color: '#00D4A1', flexShrink: 0 }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature grid */}
            <div className="lp-features lp-fade-up" style={{ animationDelay: '0.3s' }}>
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                const color = featColors[i];
                return (
                  <div key={f.label} className="lp-feat">
                    <div className="lp-feat-icon" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div>
                      <div className="lp-feat-label">{f.label}</div>
                      <div className="lp-feat-desc">{f.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="lp-cta-row lp-fade-up" style={{ animationDelay: '0.45s' }}>
              <button className="lp-cta" onClick={handleOpen}>
                Open <ArrowRight size={15} className="lp-arrow" />
              </button>
              <span className="lp-cta-hint">No setup required</span>
            </div>

          </div>

          {/* ── RIGHT: dark floating cards ── */}
          <div className="lp-right">

            {/* Card 1 — Security Status */}
            <div className="lp-card" style={{
              width: 200,
              top: '12%', left: '5%',
              transform: 'rotate(-4deg)',
              zIndex: 1,
              animation: 'lpf1 4.5s 0s ease-in-out infinite',
            }}>
              <div className="lp-clabel">
                <span className="lp-cdot" style={{ background: '#00D4A1', animation: 'dblink 2s 0s ease-in-out infinite' }} />
                Security Status
              </div>
              <div className="lp-cval" style={{ color: '#00D4A1', fontSize: 18 }}>All Clear</div>
              <div className="lp-cpos">0 threats detected</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                {['Data masking active', 'Compliance rules loaded', 'Audit log running'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00D4A1', display: 'inline-block', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Compliance Score */}
            <div className="lp-card" style={{
              width: 196,
              top: '10%', right: '5%',
              transform: 'rotate(3deg)',
              zIndex: 2,
              animation: 'lpf2 4.5s 0.8s ease-in-out infinite',
            }}>
              <div className="lp-clabel">
                <span className="lp-cdot" style={{ background: '#7B3FE4', animation: 'dblink 2s 0.7s ease-in-out infinite' }} />
                Compliance Score
              </div>
              <div className="lp-cval">96.4%</div>
              <div className="lp-cpos">↑ 3.2% this month</div>
              <div style={{ display: 'flex', gap: 3, marginTop: 10, alignItems: 'flex-end', height: 30 }}>
                {[60, 72, 65, 80, 74, 88, 96].map((h, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${h}%`,
                    background: i === 6
                      ? 'linear-gradient(180deg,#9b6dff,#7B3FE4)'
                      : 'rgba(123,63,228,0.25)',
                    borderRadius: '3px 3px 0 0',
                  }} />
                ))}
              </div>
            </div>

            {/* Card 3 — NPA Analysis */}
            <div className="lp-card" style={{
              width: 190,
              top: '44%', left: '3%',
              transform: 'rotate(-2.5deg)',
              zIndex: 3,
              animation: 'lpf3 4.5s 1.6s ease-in-out infinite',
            }}>
              <div className="lp-clabel">
                <span className="lp-cdot" style={{ background: '#f59e0b', animation: 'dblink 2s 1.4s ease-in-out infinite' }} />
                NPA Analysis
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <div>
                  <div className="lp-cval" style={{ fontSize: 18 }}>2.3%</div>
                  <div className="lp-cmuted">NPA Ratio</div>
                </div>
                <div>
                  <div className="lp-cval" style={{ fontSize: 18, color: '#f59e0b' }}>142</div>
                  <div className="lp-cmuted">SMA Alerts</div>
                </div>
              </div>
              <svg viewBox="0 0 100 28" style={{ width: '100%', height: 24, marginTop: 8 }}>
                <path d="M0,22 L20,18 L35,20 L50,14 L65,10 L80,13 L100,8"
                  fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M0,22 L20,18 L35,20 L50,14 L65,10 L80,13 L100,8 L100,28 L0,28Z"
                  fill="rgba(245,158,11,0.08)" />
              </svg>
            </div>

            {/* Card 4 — AI Query */}
            <div className="lp-card" style={{
              width: 196,
              top: '42%', right: '3%',
              transform: 'rotate(3.5deg)',
              zIndex: 4,
              animation: 'lpf4 4.5s 2.4s ease-in-out infinite',
            }}>
              <div className="lp-clabel">
                <span className="lp-cdot" style={{ background: '#3b82f6', animation: 'dblink 2s 2.1s ease-in-out infinite' }} />
                AI Response
              </div>
              <div className="lp-cval" style={{ fontSize: 22 }}>1.2s</div>
              <div className="lp-cpos">↓ avg response time</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                {[
                  { label: 'SQL gen', pct: 88, color: '#3b82f6' },
                  { label: 'Chart render', pct: 72, color: '#7B3FE4' },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
                      <span>{row.label}</span><span>{row.pct}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5 — Activity (bottom centre) */}
            <div className="lp-card" style={{
              width: 218,
              bottom: '7%', left: '50%',
              transform: 'translateX(-50%) rotate(-1.5deg)',
              zIndex: 5,
              animation: 'lpf5 4.5s 3.2s ease-in-out infinite',
            }}>
              <div className="lp-clabel">
                <span className="lp-cdot" style={{ background: '#00D4A1', animation: 'dblink 2s 0.35s ease-in-out infinite' }} />
                Session Activity
              </div>
              <div style={{ display: 'flex', gap: 22, marginBottom: 10 }}>
                <div>
                  <div className="lp-cval" style={{ fontSize: 18 }}>
                    248 <span className="lp-cmuted" style={{ fontWeight: 400 }}>queries</span>
                  </div>
                  <div className="lp-cmuted">This session</div>
                </div>
                <div>
                  <div className="lp-cval" style={{ fontSize: 18, color: '#00D4A1' }}>
                    6 <span className="lp-cmuted" style={{ fontWeight: 400 }}>reports</span>
                  </div>
                  <div className="lp-cmuted">Exported</div>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg,#7B3FE4,#9b6dff)', borderRadius: 3 }} />
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '42%', background: 'linear-gradient(90deg,#00D4A1,#00ffc6)', borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7B3FE4', display: 'inline-block' }} />Queries 68%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4A1', display: 'inline-block' }} />Reports 42%
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
