
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight,
  BrainCircuit, CheckCircle2, ChevronRight, CircleAlert,
  Cloud, Command, GitBranch, Menu, ShieldCheck, Sparkles,
  Terminal, X, Zap
} from "lucide-react";

const logs = [
  { time: "20:41:02", level: "INFO", text: "API gateway initialized", color: "green" },
  { time: "20:41:04", level: "WARN", text: "Database latency above threshold", color: "yellow" },
  { time: "20:41:05", level: "ERROR", text: "Connection pool exhausted", color: "red" },
  { time: "20:41:05", level: "AI", text: "Correlated 14 related events", color: "blue" },
  { time: "20:41:06", level: "AI", text: "Possible cause: connection leak", color: "purple" },
];

const features = [
  {
    icon: BrainCircuit,
    number: "01",
    title: "AI-powered analysis",
    text: "Turn thousands of raw log lines into meaningful insights, patterns and actionable explanations.",
    tag: "INTELLIGENCE",
  },
  {
    icon: Activity,
    number: "02",
    title: "Real-time monitoring",
    text: "Spot anomalies, monitor service health and investigate unusual activity as it happens.",
    tag: "OBSERVABILITY",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Faster incident response",
    text: "Prioritize critical errors, trace related events and accelerate troubleshooting.",
    tag: "RELIABILITY",
  },
];

function Reveal({ children, className = "" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    const element = document.querySelector(`[data-reveal-id="${id}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const id = useState(() => Math.random().toString(36).slice(2))[0];

  return (
    <div
      data-reveal-id={id}
      className={`reveal ${visible ? "revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLog, setActiveLog] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLog((value) => (value + 1) % logs.length);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="logai-site">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="site-nav">
        <Link to="/" className="brand">
          <span className="brand-mark"><Activity size={22} /></span>
          <span>log<span className="brand-accent">ai</span></span>
          <span className="brand-version">BETA</span>
        </Link>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#technology" onClick={() => setMenuOpen(false)}>Technology</a>
          <Link to="/login" className="mobile-login">Sign in</Link>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="nav-signin">Sign in</Link>
          <Link to="/signup" className="button-primary nav-cta">
            Get started <ArrowUpRight size={16} />
          </Link>
        </div>

        <button
          className="mobile-menu"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            INTELLIGENT DEVOPS OBSERVABILITY
          </div>

          <h1>
            Your logs tell a story.
            <br />
            <span className="gradient-text">AI finds the why.</span>
          </h1>

          <p className="hero-description">
            Stop digging through endless log files. Let AI connect the dots,
            detect anomalies and help you understand what broke — and why.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="button-primary button-large">
              Explore LogAI <ArrowRight size={18} />
            </Link>
            <a href="#workflow" className="button-secondary button-large">
              <Terminal size={17} /> See how it works
            </a>
          </div>

          <div className="hero-proof">
            <div className="proof-icon"><CheckCircle2 size={17} /></div>
            <span>Built for developers and DevOps teams</span>
          </div>

          <div className="hero-mini-stats">
            <div><strong>AI</strong><span>Assisted diagnosis</span></div>
            <div><strong>24/7</strong><span>Monitoring-ready</span></div>
            <div><strong>1 view</strong><span>Connected insights</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-core">
            <div className="core-glow" />
            <BrainCircuit size={66} strokeWidth={1.25} />
            <span>LOG<span className="brand-accent">AI</span></span>
            <small>INTELLIGENCE ENGINE</small>
          </div>

          <div className="float-card float-card-top">
            <span className="float-icon blue-icon"><Activity size={17} /></span>
            <div><small>EVENT STREAM</small><strong>Live analysis</strong></div>
            <span className="pulse-dot" />
          </div>

          <div className="float-card float-card-left">
            <span className="float-icon red-icon"><CircleAlert size={18} /></span>
            <div><small>CRITICAL EVENT</small><strong>Connection failure</strong></div>
          </div>

          <div className="float-card float-card-right">
            <span className="float-icon purple-icon"><Sparkles size={18} /></span>
            <div><small>AI INSIGHT</small><strong>Root cause identified</strong></div>
            <CheckCircle2 size={16} className="success-icon" />
          </div>

          <div className="visual-caption">FROM RAW SIGNALS TO CLEAR ANSWERS</div>
        </div>
      </section>

      <section className="trust-strip">
        <span>DESIGNED FOR MODERN INFRASTRUCTURE</span>
        <div className="tech-list">
          <span><Terminal size={17} /> Python</span>
          <span><GitBranch size={17} /> Git</span>
          <span><Cloud size={18} /> Cloud</span>
          <span><Command size={17} /> DevOps</span>
          <span><BrainCircuit size={17} /> Machine Learning</span>
        </div>
      </section>

      <section className="section features-section" id="features">
        <Reveal>
          <div className="section-heading">
            <span className="eyebrow">BUILT TO FIND THE SIGNAL</span>
            <h2>Less log hunting.<br /><span className="gradient-text">More problem solving.</span></h2>
            <p>Move from raw data to a clearer understanding of your systems.</p>
          </div>
        </Reveal>

        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.number} className={`feature-reveal delay-${index}`}>
                <article className="feature-card">
                  <div className="feature-top">
                    <div className="feature-icon"><Icon size={23} /></div>
                    <span>{feature.number}</span>
                  </div>
                  <div className="feature-tag">{feature.tag}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <a href="#workflow" className="feature-link">
                    Explore capability <ArrowUpRight size={16} />
                  </a>
                  <div className="feature-card-glow" />
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="section workflow-section" id="workflow">
        <Reveal>
          <div className="workflow-heading">
            <div>
              <span className="eyebrow">A CLEARER WAY TO DEBUG</span>
              <h2>From log chaos<br />to <span className="gradient-text">root cause.</span></h2>
            </div>
            <p>Follow the signal. Understand the event. Investigate with context.</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="console-window">
            <div className="console-header">
              <div className="window-dots"><i /><i /><i /></div>
              <span><Terminal size={14} /> logai / event-stream</span>
              <span className="console-live"><span className="status-dot" /> SIMULATED PREVIEW</span>
            </div>
            <div className="console-body">
              <div className="console-sidebar">
                <span className="console-sidebar-active"><Activity size={17} /></span>
                <span><BrainCircuit size={17} /></span>
                <span><ShieldCheck size={17} /></span>
              </div>
              <div className="console-content">
                <div className="console-title">
                  <div><span className="eyebrow">LIVE EVENT EXPLORER</span><h3>System event stream</h3></div>
                  <span className="stream-badge"><span className="status-dot" /> Preview</span>
                </div>
                {logs.map((log, index) => (
                  <div
                    className={`log-line ${log.color} ${activeLog === index ? "log-active" : ""}`}
                    key={log.time + log.text}
                  >
                    <span className="log-time">{log.time}</span>
                    <span className="log-level">{log.level}</span>
                    <span className="log-text">{log.text}</span>
                    {activeLog === index && <span className="log-cursor" />}
                  </div>
                ))}
                <div className="ai-explanation">
                  <div className="ai-explanation-icon"><Sparkles size={18} /></div>
                  <div>
                    <strong>AI investigation preview</strong>
                    <p>Several errors appear correlated. Inspect database connection usage and recent service changes to validate this hypothesis.</p>
                  </div>
                  <ArrowDownRight size={19} />
                </div>
                <div className="console-footer"><span>DEMO DATA · NOT CONNECTED TO A LIVE SERVER</span><span>LOGAI PREVIEW</span></div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section technology-section" id="technology">
        <Reveal>
          <div className="technology-card">
            <div className="technology-copy">
              <span className="eyebrow">MADE FOR YOUR WORKFLOW</span>
              <h2>Designed around<br /><span className="gradient-text">the way you build.</span></h2>
              <p>
                A foundation for log ingestion, intelligent analysis and incident
                investigation — designed to grow with your infrastructure.
              </p>
              <Link to="/signup" className="button-primary button-large">
                Start exploring <ArrowRight size={17} />
              </Link>
            </div>
            <div className="tech-graphic">
              <div className="tech-ring ring-a" />
              <div className="tech-ring ring-b" />
              <div className="tech-node node-top"><Cloud size={22} /><span>LOGS</span></div>
              <div className="tech-node node-left"><Terminal size={22} /><span>EVENTS</span></div>
              <div className="tech-node node-right"><Activity size={22} /><span>METRICS</span></div>
              <div className="tech-node node-center"><BrainCircuit size={36} /><span>AI CORE</span></div>
              <div className="tech-node node-bottom"><Zap size={20} /><span>INSIGHTS</span></div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section final-cta">
        <Reveal>
          <div className="cta-panel">
            <div className="cta-spark"><Sparkles size={25} /></div>
            <span className="eyebrow">YOUR NEXT INCIDENT, BETTER UNDERSTOOD</span>
            <h2>Make your logs<br /><span className="gradient-text">work smarter.</span></h2>
            <p>Start exploring a more intelligent approach to DevOps observability.</p>
            <Link to="/signup" className="button-primary button-large">
              Get started with LogAI <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="site-footer">
        <Link to="/" className="brand">
          <span className="brand-mark"><Activity size={20} /></span>
          <span>log<span className="brand-accent">ai</span></span>
        </Link>
        <span>AI-powered DevOps observability.</span>
        <span>© {new Date().getFullYear()} LogAI · Project preview</span>
      </footer>
    </main>
  );
}
