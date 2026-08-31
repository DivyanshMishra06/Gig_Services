import { Link } from 'react-router-dom';

const services = [
  { icon: '🔧', name: 'Plumbing' }, { icon: '⚡', name: 'Electrical' }, { icon: '❄️', name: 'AC Repair' },
  { icon: '🧹', name: 'Cleaning' }, { icon: '🪚', name: 'Carpentry' }, { icon: '🎨', name: 'Painting' },
  { icon: '🔌', name: 'Appliance' }, { icon: '🏥', name: 'Caregiver' }, { icon: '💇', name: 'Beauty' }
];

const features = [
  { icon: '🤝', title: 'Worker-Owned Cooperatives', desc: 'Workers own and govern their cooperatives, ensuring fair pay, dignity, and decision-making power.' },
  { icon: '🛡️', title: 'Welfare & Insurance', desc: 'Every verified worker gets health insurance, accident coverage, and access to emergency support funds.' },
  { icon: '📊', title: 'AI Demand Forecasting', desc: 'Seasonal demand prediction and smart workforce allocation ensures workers always have steady jobs.' },
  { icon: '⭐', title: 'Skill Verification', desc: 'Government ID and skill verification builds trust. Customers get certified, reliable workers.' },
  { icon: '🌐', title: 'Multilingual Support', desc: 'Available in Hindi and English so every user and worker can access the platform in their language.' },
  { icon: '🚨', title: 'Emergency Services', desc: 'Need urgent help? Our emergency booking system connects you with the nearest available worker instantly.' }
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-text animate-in">
            <h1>
              Empowering India's <span className="gradient">Gig Workers</span> Through Cooperation
            </h1>
            <p>
              A platform where skilled workers own their future. Book trusted, cooperative-backed services —
              from plumbing to caregiving — while supporting worker welfare and fair wages.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Book a Service →</Link>
              <Link to="/register?role=worker" className="btn btn-secondary btn-lg">Join as Worker</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat-item">
                <div className="num">1,200+</div>
                <div className="label">Skilled Workers</div>
              </div>
              <div className="hero-stat-item">
                <div className="num">8,400+</div>
                <div className="label">Happy Customers</div>
              </div>
              <div className="hero-stat-item">
                <div className="num">15,000+</div>
                <div className="label">Services Done</div>
              </div>
            </div>
          </div>
          <div className="hero-visual animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="hero-grid">
              {services.map((s, i) => (
                <div className="service-bubble" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="icon">{s.icon}</div>
                  <div className="name">{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Why CoopGig?</h2>
            <p>Not just another gig platform. We're building a fair, cooperative economy for India's service workers.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to get reliable, cooperative-backed services at your doorstep.</p>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '🔍', title: 'Choose a Service', desc: 'Browse 12+ service categories. Our AI matches you with the best nearby worker.' },
              { step: '02', icon: '📅', title: 'Book & Schedule', desc: 'Pick a time, describe the job, and book instantly. Emergency? We\'ve got you covered.' },
              { step: '03', icon: '✅', title: 'Get It Done', desc: 'Verified worker arrives, completes the job. Pay fairly. Rate and support the cooperative.' }
            ].map((item, i) => (
              <div className="card" key={i} style={{ textAlign: 'center', padding: '40px 28px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>STEP {item.step}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Make a Difference?</h2>
            <p>Join the cooperative movement. Better pay, better services, better future.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', position: 'relative' }}>
              <Link to="/register" className="btn btn-accent btn-lg">Create Account</Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.15)', border: 'none' }}>Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">🤝 CoopGig</div>
            <p>India's cooperative-powered gig services platform. Connecting skilled workers with customers through worker-owned cooperatives.</p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <a href="#">Plumbing</a><a href="#">Electrical</a><a href="#">AC Repair</a><a href="#">Cleaning</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a><a href="#">Careers</a><a href="#">Blog</a><a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <h4>For Workers</h4>
            <a href="#">Join Cooperative</a><a href="#">Training</a><a href="#">Welfare Benefits</a><a href="#">Partner</a>
          </div>
        </div>
        <div className="footer-bottom">© 2024 CoopGig. Built for SIH — Empowering India's gig workers.</div>
      </footer>
    </div>
  );
}
