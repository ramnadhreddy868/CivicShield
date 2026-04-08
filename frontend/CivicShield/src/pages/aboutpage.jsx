import React from "react";

export default function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-hero text-center">
        <h1 className="hero-title">CivicShield</h1>
        <p className="hero-subtitle">Empowering citizens, securing communities, and bridging the gap between people and governance.</p>
      </div>

      <div className="about-grid">
        <div className="card about-card">
          <div className="card-icon">🎯</div>
          <h3>Our Objectives</h3>
          <ul className="about-list">
            <li>Enable seamless reporting of civic issues for all citizens.</li>
            <li>Bridge communications with real-time updates for authorities.</li>
            <li>Prioritize and accelerate women’s safety alert responses.</li>
            <li>Ensure complete transparency in the issue resolution lifecycle.</li>
          </ul>
        </div>

        <div className="card about-card">
          <div className="card-icon">⚡</div>
          <h3>Key Features</h3>
          <ul className="about-list">
            <li>Modern multi-step wizard for detailed incident reporting.</li>
            <li>Automatic geolocation tagging for precise response dispatch.</li>
            <li>Role-specific command centers for specialized authorities.</li>
            <li>Instant browser notifications for status changes and alerts.</li>
          </ul>
        </div>

        <div className="card about-card">
          <div className="card-icon">🛠️</div>
          <h3>Architecture</h3>
          <ul className="about-list">
            <li><strong>Frontend:</strong> React.js Ecosystem with modern CSS3.</li>
            <li><strong>Backend:</strong> High-performance Node.js & Express.</li>
            <li><strong>Security:</strong> JWT Auth & Email OTP Verification.</li>
            <li><strong>Real-time:</strong> Integrated Web Notification standards.</li>
          </ul>
        </div>
      </div>

      <style>{`
        .about-container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
        .about-hero { margin-bottom: 4rem; padding: 2rem 0; }
        .hero-title { font-size: 3.5rem; font-weight: 900; background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
        .hero-subtitle { font-size: 1.25rem; color: #64748b; max-width: 700px; margin: 0 auto; line-height: 1.6; }

        .about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .about-card { padding: 2rem; transition: transform 0.3s ease; }
        .about-card:hover { transform: translateY(-8px); }
        .card-icon { font-size: 2.5rem; margin-bottom: 1.5rem; }
        .about-card h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem; }
        .about-list { list-style: none; padding: 0; }
        .about-list li { font-size: 0.95rem; color: #475569; position: relative; padding-left: 1.5rem; margin-bottom: 0.75rem; line-height: 1.5; }
        .about-list li::before { content: "•"; position: absolute; left: 0; color: #4f46e5; font-weight: bold; }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
