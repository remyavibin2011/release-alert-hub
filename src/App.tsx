/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

const MODEL = "claude-sonnet-4-20250514";

interface TeamEntry {
  team: string;
  lead: string;
  backup: string;
  slack: string;
  emoji: string;
}

interface SampleDefect {
  label: string;
  text: string;
}

interface Analysis {
  issue_key: string;
  summary: string;
  severity: string;
  component: string;
  sprint_impact: string;
  risk_summary: string;
  recommended_action: string;
  decision_deadline: string;
  email_subject: string;
  email_body: string;
  escalation_window: string;
}

interface Result {
  skipped?: boolean;
  severity: string;
  analysis?: Analysis;
  owner?: TeamEntry;
  shouldAlert?: boolean;
  error?: boolean;
}

const TEAM_MATRIX: Record<string, TeamEntry> = {
  "Authentication":  { team: "Platform Security",   lead: "Sarah K.",  backup: "James L.",  slack: "@sarah.k @james.l",  emoji: "🔐" },
  "Networking":      { team: "Connectivity",         lead: "Raj M.",    backup: "Priya S.",  slack: "@raj.m @priya.s",    emoji: "📡" },
  "Camera":          { team: "Device Firmware",      lead: "Tom W.",    backup: "Ana R.",    slack: "@tom.w @ana.r",      emoji: "📷" },
  "Notifications":   { team: "Mobile Platform",      lead: "Dev P.",    backup: "Lena C.",   slack: "@dev.p @lena.c",     emoji: "🔔" },
  "Onboarding":      { team: "UX & Activation",      lead: "Mia T.",    backup: "Chris B.",  slack: "@mia.t @chris.b",    emoji: "🚀" },
  "Streaming":       { team: "Media Services",       lead: "Omar F.",   backup: "Yuki N.",   slack: "@omar.f @yuki.n",    emoji: "🎥" },
  "Localization":    { team: "i18n & Content",       lead: "Ines V.",   backup: "Marco D.",  slack: "@ines.v @marco.d",   emoji: "🌍" },
  "Telemetry":       { team: "Data & Analytics",     lead: "Arun S.",   backup: "Nina H.",   slack: "@arun.s @nina.h",    emoji: "📊" },
  "Performance":     { team: "Core Engineering",     lead: "Blake O.",  backup: "Fatima A.", slack: "@blake.o @fatima.a", emoji: "⚡" },
  "Compatibility":   { team: "QA Platform",          lead: "Soo J.",    backup: "Ethan M.",  slack: "@soo.j @ethan.m",    emoji: "🔧" },
  "Calendar":        { team: "Integrations",         lead: "Rosa T.",   backup: "Kwame B.",  slack: "@rosa.t @kwame.b",   emoji: "📅" },
};

const DECISION_MAKERS = ["@eng-director", "@qa-lead", "@release-mgr", "@product-owner", "@cto-office"];

const SAMPLE_DEFECTS: SampleDefect[] = [
  {
    label: "P0 — Auth crash post code freeze",
    text: `Issue Key: APP-234
Summary: App crashes on login screen immediately after v5.1 code freeze — affects all users on Android 13+
Priority: Critical
Status: Open
Component: Authentication
Reported By: QA Team
Sprint: Sprint 42 — Release candidate in 18 hours
Steps to Reproduce: Launch app on Android 13 → tap Login → app crashes with NullPointerException
Impact: 100% of Android 13 users blocked from logging in
Additional Notes: Regression from yesterday's auth token refresh PR merge`
  },
  {
    label: "P1 — Push notifications broken post release",
    text: `Issue Key: APP-198
Summary: Push notifications not delivered to iOS devices running iOS 17.2 after v4.9 deployment
Priority: High
Status: Open
Component: Notifications
Reported By: Customer Support escalation
Sprint: Sprint 41 — Already shipped, hotfix needed
Steps to Reproduce: Any iOS 17.2 device — trigger any notification event — no notification received
Impact: Estimated 35% of active iOS user base affected
Additional Notes: PO is on emergency leave today, backup unclear`
  },
  {
    label: "P1 — Live stream freezing in production",
    text: `Issue Key: APP-201
Summary: Live video feed freezes consistently after 8-10 minutes of streaming across all device types
Priority: High
Status: Open
Component: Streaming
Reported By: Developer during smoke test
Sprint: Sprint 42 — Ship decision in 4 hours
Steps to Reproduce: Start live stream → wait 8-10 mins → feed freezes, requires app restart
Impact: Core feature broken for all users — affects premium tier subscribers
Additional Notes: Issue intermittent in dev, consistent in staging. Lead engineer is OOO today.`
  }
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root {
    --bg:#f5f2ed;--surface:#ffffff;--surface2:#f0ece5;--border:#e0d9cf;
    --text:#1a1612;--muted:#8c8077;--critical:#c0392b;--high:#d35400;
    --ok:#27ae60;--info:#2980b9;--accent:#1a1612;--slack:#4a154b;--tag-bg:#e8e2d9;
  }
  body{background:var(--bg);color:var(--text);font-family:'Space Grotesk',sans-serif;}
  .app{min-height:100vh;background:var(--bg);background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,var(--border) 39px,var(--border) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,var(--border) 39px,var(--border) 40px);padding:2rem;}
  .header{background:var(--accent);color:#f5f2ed;border-radius:16px;padding:1.5rem 2rem;margin-bottom:2rem;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden;}
  .header::before{content:'RELEASE ALERT';position:absolute;right:-10px;top:-20px;font-family:'Bebas Neue',sans-serif;font-size:7rem;color:rgba(255,255,255,.04);letter-spacing:.05em;pointer-events:none;white-space:nowrap;}
  .header-left{position:relative;z-index:1;}
  .header-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:.08em;line-height:1;}
  .header-sub{font-size:.72rem;color:rgba(245,242,237,.5);margin-top:.3rem;letter-spacing:.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;}
  .header-badge{background:var(--critical);color:white;padding:.4rem 1rem;border-radius:6px;font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;animation:blink 1.5s ease-in-out infinite;position:relative;z-index:1;}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.6}}
  .layout{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start;}
  @media(max-width:800px){.layout{grid-template-columns:1fr;}}
  .card{background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;}
  .card-header{background:var(--surface2);border-bottom:1.5px solid var(--border);padding:.9rem 1.2rem;display:flex;align-items:center;justify-content:space-between;}
  .card-title{font-family:'JetBrains Mono',monospace;font-size:.7rem;font-weight:700;}
  .card-body{padding:1.2rem;}
  .sample-list{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem;}
  .sample-pill{border:1.5px solid var(--border);border-radius:8px;padding:.6rem .9rem;cursor:pointer;font-size:.75rem;transition:all .2s;display:flex;align-items:center;gap:.6rem;background:var(--surface2);}
  .sample-pill:hover{border-color:var(--accent);background:var(--surface);transform:translateX(3px);}
  .sample-pill.active{border-color:var(--accent);background:var(--accent);color:var(--bg);}
  .pill-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
  .defect-input{width:100%;min-height:220px;background:var(--surface2);border:1.5px solid var(--border);border-radius:8px;padding:1rem;font-family:'JetBrains Mono',monospace;font-size:.72rem;line-height:1.7;color:var(--text);resize:vertical;transition:border-color .2s;outline:none;}
  .defect-input:focus{border-color:var(--accent);}
  .btn-trigger{width:100%;margin-top:1rem;padding:.9rem;border-radius:8px;border:none;cursor:pointer;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.12em;background:var(--accent);color:var(--bg);transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.6rem;}
  .btn-trigger:hover:not(:disabled){background:var(--critical);transform:translateY(-1px);}
  .btn-trigger:disabled{opacity:.4;cursor:not-allowed;}
  .sev{display:inline-flex;align-items:center;gap:.35rem;padding:.2rem .6rem;border-radius:4px;font-size:.62rem;font-weight:700;letter-spacing:.06em;font-family:'JetBrains Mono',monospace;text-transform:uppercase;}
  .sev.critical{background:rgba(192,57,43,.12);color:var(--critical);border:1px solid rgba(192,57,43,.3);}
  .sev.high{background:rgba(211,84,0,.1);color:var(--high);border:1px solid rgba(211,84,0,.25);}
  .workflow{display:flex;flex-direction:column;gap:0;}
  .wf-step{display:flex;gap:1rem;position:relative;padding-bottom:1.2rem;animation:fadeSlide .4s ease both;}
  .wf-step:last-child{padding-bottom:0;}
  @keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .wf-line{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:28px;}
  .wf-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0;border:2px solid var(--border);background:var(--surface);}
  .wf-dot.active{border-color:var(--accent);background:var(--accent);}
  .wf-dot.critical-dot{border-color:var(--critical);background:rgba(192,57,43,.1);}
  .wf-dot.ok{border-color:var(--ok);background:rgba(39,174,96,.1);}
  .wf-connector{flex:1;width:2px;background:var(--border);margin:2px 0;min-height:16px;}
  .wf-content{flex:1;padding-top:.3rem;}
  .wf-title{font-size:.8rem;font-weight:600;margin-bottom:.25rem;}
  .wf-desc{font-size:.72rem;color:var(--muted);line-height:1.5;}
  .notif-card{border-radius:10px;border:1.5px solid var(--border);overflow:hidden;animation:fadeSlide .5s ease both;}
  .notif-header{padding:.6rem 1rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
  .notif-type{font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:.4rem;}
  .notif-body{padding:.9rem 1rem;font-size:.75rem;line-height:1.6;}
  .notif-card.email .notif-header{background:#f0f4ff;}
  .notif-card.email .notif-type{color:var(--info);}
  .notif-card.email .notif-body{background:white;font-family:Georgia,serif;}
  .notif-card.slack .notif-header{background:#f9f0ff;}
  .notif-card.slack .notif-type{color:var(--slack);}
  .notif-card.slack .notif-body{background:#faf5ff;font-family:'JetBrains Mono',monospace;font-size:.7rem;}
  .slack-msg{white-space:pre-wrap;}
  .slack-mention{color:var(--slack);font-weight:600;}
  .slack-bold{font-weight:700;}
  .owner-card{border:1.5px solid var(--border);border-radius:10px;padding:1rem;background:var(--surface2);display:flex;gap:.8rem;align-items:flex-start;}
  .escalation-bar{margin-top:.75rem;padding:.75rem 1rem;border-radius:8px;border:1px dashed var(--high);background:rgba(211,84,0,.05);display:flex;align-items:center;gap:.75rem;}
  .esc-icon{font-size:1.1rem;}
  .esc-text{font-size:.72rem;color:var(--high);line-height:1.5;}
  .esc-text strong{display:block;font-size:.75rem;}
  .skip-card{border:1.5px solid var(--border);border-radius:10px;padding:1.2rem;background:var(--surface2);display:flex;gap:.75rem;align-items:flex-start;}
  .skip-text{font-size:.78rem;line-height:1.6;color:var(--muted);}
  .skip-text strong{color:var(--text);display:block;margin-bottom:.2rem;}
  .loading{padding:2rem;display:flex;flex-direction:column;align-items:center;gap:1rem;}
  .spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-text{font-size:.75rem;color:var(--muted);font-family:'JetBrains Mono',monospace;}
  .btn-reset{background:none;border:1px solid var(--border);color:var(--muted);padding:.35rem .8rem;border-radius:6px;cursor:pointer;font-size:.68rem;font-family:'JetBrains Mono',monospace;transition:all .2s;}
  .btn-reset:hover{border-color:var(--text);color:var(--text);}
  .label{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-bottom:.4rem;}
  .mt{margin-top:.75rem;}
`;

function detectSeverity(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("critical") || t.includes("p0")) return "Critical";
  if (t.includes("high") || t.includes("p1")) return "High";
  if (t.includes("medium") || t.includes("p2")) return "Medium";
  if (t.includes("low") || t.includes("p3")) return "Low";
  return "Unknown";
}

function detectComponent(text: string): string | null {
  for (const comp of Object.keys(TEAM_MATRIX)) {
    if (text.toLowerCase().includes(comp.toLowerCase())) return comp;
  }
  return null;
}

function formatSlackMessage(analysis: Analysis, owner: TeamEntry): string {
  const sev = analysis.severity;
  const icon = sev === "Critical" ? "🚨" : "⚠️";
  const urgency = sev === "Critical" ? "CRITICAL BLOCKER" : "HIGH PRIORITY";
  return `${icon} *${urgency} — RELEASE ALERT* ${icon}\n\n*Issue:* ${analysis.issue_key} — ${analysis.summary}\n*Severity:* ${sev}  |  *Component:* ${analysis.component}\n*Sprint Impact:* ${analysis.sprint_impact}\n\n*Owner notified:* ${owner.slack}\n*Team:* ${owner.team}\n\n*Risk Summary:*\n${analysis.risk_summary}\n\n*Recommended Action:*\n${analysis.recommended_action}\n\n*Decision needed by:* ${analysis.decision_deadline}\n\n${DECISION_MAKERS.join(" ")} — your awareness and action required.`;
}

export default function ReleaseAlertHub() {
  const [input, setInput] = useState<string>("");
  const [activeSample, setActiveSample] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Result | null>(null);

  const selectSample = (i: number) => {
    setActiveSample(i);
    setInput(SAMPLE_DEFECTS[i].text);
    setResult(null);
  };

  const trigger = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null);
    const sev = detectSeverity(input);
    const comp = detectComponent(input);
    const owner = comp ? TEAM_MATRIX[comp] : undefined;
    const shouldAlert = sev === "Critical" || sev === "High";

    if (!shouldAlert) {
      setResult({ skipped: true, severity: sev });
      setLoading(false);
      return;
    }

    const prompt = `You are a release management assistant analyzing a defect report to generate alert notifications.\n\nDefect Report:\n${input}\n\nDetected severity: ${sev}\nDetected component: ${comp || "Unknown"}\n\nReturn ONLY valid JSON with these exact keys:\n{\n  "issue_key": "extracted issue key or APP-XXX",\n  "summary": "one line summary",\n  "severity": "${sev}",\n  "component": "${comp || "Unknown"}",\n  "sprint_impact": "specific impact in one sentence",\n  "risk_summary": "2-3 bullet points using • prefix",\n  "recommended_action": "specific immediate action needed",\n  "decision_deadline": "urgency framing e.g. Within 2 hours",\n  "email_subject": "concise email subject line",\n  "email_body": "professional 3-4 sentence email to owner and backup. Address owner by first name.",\n  "escalation_window": "e.g. 30 minutes"\n}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const analysis: Analysis = JSON.parse(clean);
      setResult({ analysis, owner, shouldAlert: true, severity: sev });
    } catch {
      setResult({ error: true, severity: sev });
    }
    setLoading(false);
  };

  const reset = () => { setResult(null); setInput(""); setActiveSample(null); };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-left">
            <div className="header-title">Release Alert Hub</div>
            <div className="header-sub">Multi-team defect notification workflow</div>
          </div>
          <div className="header-badge">⚡ Live Simulation</div>
        </div>

        <div className="layout">
          <div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">📋 Defect Report Input</div>
                {result && <button className="btn-reset" onClick={reset}>↩ Reset</button>}
              </div>
              <div className="card-body">
                <div className="label">Try a scenario</div>
                <div className="sample-list">
                  {SAMPLE_DEFECTS.map((s, i) => {
                    const sev = detectSeverity(s.text);
                    return (
                      <div key={i} className={`sample-pill ${activeSample === i ? "active" : ""}`} onClick={() => selectSample(i)}>
                        <div className="pill-dot" style={{ background: sev === "Critical" ? "var(--critical)" : "var(--high)" }} />
                        {s.label}
                      </div>
                    );
                  })}
                </div>
                <div className="label mt">Or paste your defect</div>
                <textarea className="defect-input"
                  placeholder={`Paste JIRA defect here...\n\nIssue Key: APP-XXX\nSummary: ...\nPriority: Critical / High\nComponent: ...\nImpact: ...`}
                  value={input}
                  onChange={e => { setInput(e.target.value); setResult(null); setActiveSample(null); }}
                />
                <button className="btn-trigger" onClick={trigger} disabled={!input.trim() || loading}>
                  {loading ? "⏳ Processing..." : "🚨 TRIGGER ALERT WORKFLOW"}
                </button>
              </div>
            </div>

            <div className="card" style={{ marginTop: "1.5rem" }}>
              <div className="card-header"><div className="card-title">👥 Team Ownership Matrix</div></div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
                {Object.entries(TEAM_MATRIX).slice(0, 5).map(([comp, info]) => (
                  <div key={comp} style={{ display: "flex", alignItems: "center", gap: ".75rem", fontSize: ".72rem", padding: ".5rem .75rem", borderRadius: "8px", background: "var(--surface2)", border: "1px solid var(--border)" }}>
                    <span>{info.emoji}</span>
                    <span style={{ flex: 1, fontWeight: 600 }}>{comp}</span>
                    <span style={{ color: "var(--muted)", fontFamily: "JetBrains Mono,monospace", fontSize: ".65rem" }}>{info.lead} / {info.backup}</span>
                  </div>
                ))}
                <div style={{ fontSize: ".65rem", color: "var(--muted)", textAlign: "center", fontFamily: "JetBrains Mono,monospace", marginTop: ".25rem" }}>
                  +{Object.keys(TEAM_MATRIX).length - 5} more components configured
                </div>
              </div>
            </div>
          </div>

          <div>
            {loading && (
              <div className="card">
                <div className="loading">
                  <div className="spinner" />
                  <div className="loading-text">Analyzing defect → routing to owners...</div>
                </div>
              </div>
            )}

            {result?.skipped && (
              <div className="card">
                <div className="card-header"><div className="card-title">🔍 Workflow Result</div></div>
                <div className="card-body">
                  <div className="skip-card">
                    <div style={{ fontSize: "1.2rem" }}>✅</div>
                    <div className="skip-text">
                      <strong>No alert triggered</strong>
                      Severity detected as <strong>{result.severity}</strong> — below the Critical/High threshold. This defect follows standard sprint triage. No notifications sent.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result?.analysis && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">⚙️ Workflow Executed</div>
                    <span className={`sev ${result.severity.toLowerCase()}`}>
                      {result.severity === "Critical" ? "🚨" : "⚠️"} {result.severity}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="workflow">
                      {[
                        { icon: "📥", label: "Defect received", desc: `${result.analysis.issue_key} — raised by team member`, cls: "ok" },
                        { icon: "🔍", label: "Severity assessed", desc: `${result.severity} detected → alert threshold met`, cls: result.severity === "Critical" ? "critical-dot" : "active" },
                        { icon: result.owner?.emoji || "👤", label: `Owner identified — ${result.owner?.team || "Unknown Team"}`, desc: `Lead: ${result.owner?.lead || "TBD"} · Backup: ${result.owner?.backup || "TBD"}`, cls: "active" },
                        { icon: "📧", label: "Email sent to owner + backup", desc: `Subject: ${result.analysis.email_subject}`, cls: "ok" },
                        { icon: "💬", label: "Slack alert → #release-decisions", desc: `${DECISION_MAKERS.length} decision makers notified`, cls: "ok" },
                        { icon: "⏰", label: "Auto-escalation armed", desc: `No response in ${result.analysis.escalation_window} → escalates to Eng Director`, cls: "critical-dot" },
                      ].map((s, i, arr) => (
                        <div key={i} className="wf-step" style={{ animationDelay: `${i * 0.1}s` }}>
                          <div className="wf-line">
                            <div className={`wf-dot ${s.cls}`}>{s.icon}</div>
                            {i < arr.length - 1 && <div className="wf-connector" />}
                          </div>
                          <div className="wf-content">
                            <div className="wf-title">{s.label}</div>
                            <div className="wf-desc">{s.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card notif-card email">
                  <div className="notif-header">
                    <div className="notif-type">📧 Email Notification</div>
                    <span style={{ fontSize: ".65rem", color: "var(--info)", fontFamily: "JetBrains Mono,monospace" }}>→ {result.owner?.lead} + {result.owner?.backup}</span>
                  </div>
                  <div className="notif-body">
                    <div style={{ fontSize: ".68rem", color: "var(--muted)", marginBottom: ".75rem", fontFamily: "JetBrains Mono,monospace" }}>
                      <strong>Subject:</strong> {result.analysis.email_subject}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{result.analysis.email_body}</div>
                    <div style={{ marginTop: ".75rem", fontSize: ".68rem", color: "var(--muted)" }}>— Release Alert System · Automated Notification</div>
                  </div>
                </div>

                <div className="card notif-card slack">
                  <div className="notif-header">
                    <div className="notif-type">💬 #release-decisions</div>
                    <span style={{ fontSize: ".65rem", color: "var(--slack)", fontFamily: "JetBrains Mono,monospace" }}>{DECISION_MAKERS.length} members</span>
                  </div>
                  <div className="notif-body">
                    <div className="slack-msg">
                      {formatSlackMessage(result.analysis, result.owner || { slack: "@unknown", team: "Unknown", lead: "", backup: "", emoji: "" })
                        .split("\n")
                        .map((line, i) => (
                          <div key={i} style={{ minHeight: line === "" ? ".5rem" : "auto" }}>
                            {line.split(/(@\S+|\*[^*]+\*)/g).map((part, j) => {
                              if (part.startsWith("@")) return <span key={j} className="slack-mention">{part}</span>;
                              if (part.startsWith("*") && part.endsWith("*")) return <span key={j} className="slack-bold">{part.slice(1, -1)}</span>;
                              return <span key={j}>{part}</span>;
                            })}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="escalation-bar">
                  <div className="esc-icon">⏰</div>
                  <div className="esc-text">
                    <strong>Auto-escalation armed</strong>
                    No acknowledgment in {result.analysis.escalation_window} → escalates to Engineering Director and VP of Product.
                  </div>
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="card">
                <div className="card-body" style={{ padding: "2.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
                  <div style={{ fontFamily: "Bebas Neue,sans-serif", fontSize: "1.2rem", letterSpacing: ".06em", marginBottom: ".5rem" }}>Waiting for input</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)", lineHeight: 1.6 }}>
                    Select a sample scenario or paste a defect report.<br />
                    Critical and High severity defects trigger the full workflow.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
