import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getServices } from '../services/api';
import { useTranslation } from 'react-i18next';
import activeSetuMark from '../assets/ActiveSetuNG.png';
const services = [
  { icon: '🔧', name: 'Plumbing', searchLabel: 'Plumbing', related: ['Plumber'] },
  { icon: '⚡', name: 'Electrical', searchLabel: 'Electrical' },
  { icon: '❄️', name: 'AC Repair', searchLabel: 'AC Repair', related: ['AC Service'] },
  { icon: '🧹', name: 'Cleaning', searchLabel: 'Cleaning' },
  { icon: '🪚', name: 'Carpentry', searchLabel: 'Carpentry' },
  { icon: '🎨', name: 'Painting', searchLabel: 'Painting' },
  { icon: '🔌', name: 'Appliance', searchLabel: 'Appliance Repair' },
  { icon: '🏥', name: 'Caregiver', searchLabel: 'Caregiver' },
  { icon: '💇', name: 'Beauty', searchLabel: 'Beauty' }
];

function uniqueSuggestions(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const features = [
  { icon: '🤝', title: 'Worker-Owned Cooperatives', desc: 'Workers own and govern their cooperatives, ensuring fair pay, dignity, and decision-making power.' },
  { icon: '🛡️', title: 'Welfare & Insurance', desc: 'Every verified worker gets health insurance, accident coverage, and access to emergency support funds.' },
  { icon: '📊', title: 'AI Demand Forecasting', desc: 'Seasonal demand prediction and smart workforce allocation ensures workers always have steady jobs.' },
  { icon: '⭐', title: 'Skill Verification', desc: 'Government ID and skill verification builds trust. Customers get certified, reliable workers.' },
  { icon: '🌐', title: 'Multilingual Support', desc: 'Available in Hindi and English so every user and worker can access the platform in their language.' },
  { icon: '🚨', title: 'Emergency Services', desc: 'Need urgent help? Our emergency booking system connects you with the nearest available worker instantly.' }
];

export default function Landing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusSearch = searchParams.get('focusSearch') === 'true';

  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteServices, setRemoteServices] = useState([]);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const popularSuggestions = useMemo(
    () => uniqueSuggestions(services.map((s) => ({ icon: s.icon, label: s.searchLabel || s.name }))),
    []
  );

  const allSuggestions = useMemo(() => {
    const related = services.flatMap((s) =>
      (s.related || []).map((label) => ({ icon: s.icon, label }))
    );
    const fromApi = remoteServices.map((s) => ({
      icon: s.icon || '🔍',
      label: s.name
    }));
    return uniqueSuggestions([...popularSuggestions, ...related, ...fromApi]);
  }, [popularSuggestions, remoteServices]);

  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return popularSuggestions;
    return allSuggestions.filter((s) => s.label.toLowerCase().includes(q));
  }, [searchQuery, popularSuggestions, allSuggestions]);

  // Auto-scroll and focus search box when returning from auth
  useEffect(() => {
    if (user && focusSearch && searchInputRef.current) {
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => searchInputRef.current?.focus(), 400);
    }
  }, [user, focusSearch]);

  useEffect(() => {
    if (!user) return;
    getServices()
      .then((res) => {
        if (res.data?.length) setRemoteServices(res.data);
      })
      .catch(() => {});
  }, [user]);

  // Close prompt / suggestions when clicking outside
  useEffect(() => {
    if (!showSignupPrompt && !showSuggestions) return;
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSignupPrompt(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSignupPrompt, showSuggestions]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectSuggestion = (label) => {
    setSearchQuery(label);
    setShowSuggestions(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-text animate-in">
            <h1>
              {t('landing.hero', { workers: t('landing.gigWorkers') })}
            </h1>
            <p>
              {t('landing.heroDescription')}
            </p>

            {/* Search Box — functional for logged-in users, signup prompt for guests */}
            {user ? (
              <form className="hero-search" onSubmit={handleSearch} ref={searchRef} autoComplete="off">
                <div className="hero-search-inner">
                  <span className="hero-search-icon">🔍</span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="hero-search-input"
                    placeholder={t('landing.needHelp')}
                    value={searchQuery}
                    role="combobox"
                    aria-expanded={showSuggestions}
                    aria-controls="search-suggestions"
                    aria-autocomplete="list"
                    onFocus={() => setShowSuggestions(true)}
                    onClick={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setShowSuggestions(false);
                    }}
                  />
                  <button type="submit" className="btn btn-primary">{t('common.search')}</button>
                </div>
                {showSuggestions && (
                  <ul id="search-suggestions" className="search-suggestions animate-fade" role="listbox">
                    <li className="search-suggestions-hint">
                      {searchQuery.trim() ? t('landing.matching') : t('landing.popular')}
                    </li>
                    {filteredSuggestions.length === 0 ? (
                      <li className="search-suggestions-empty">{t('landing.noMatching')}</li>
                    ) : (
                      filteredSuggestions.map((s) => (
                        <li key={s.label} role="option">
                          <button
                            type="button"
                            className="search-suggestion-item"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectSuggestion(s.label)}
                          >
                            <span className="search-suggestion-icon">{s.icon}</span>
                            <span>{s.label}</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </form>
            ) : (
              <div className="hero-search" ref={searchRef} onClick={() => setShowSignupPrompt(true)} style={{ cursor: 'pointer' }}>
                <div className="hero-search-inner">
                  <span className="hero-search-icon">🔍</span>
                  <div className="hero-search-text">{t('landing.needHelp')}</div>
                  <span className="btn btn-primary">{t('common.search')}</span>
                </div>
                {showSignupPrompt && (
                  <div className="search-signup-prompt animate-fade" onClick={(e) => e.stopPropagation()}>
                    <div className="search-signup-icon">🔒</div>
                    <h3>{t('landing.signupTitle')}</h3>
                    <p>{t('landing.signupText')}</p>
                    <div className="search-signup-actions">
                      <Link to="/register?from=search" className="btn btn-primary">{t('landing.signupFree')}</Link>
                      <Link to="/login?from=search" className="btn btn-secondary">{t('landing.alreadyAccount')}</Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">{t('landing.findWorker')}</Link>
              <Link to="/register?role=worker" className="btn btn-accent btn-lg">{t('landing.findWork')}</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat-item">
                <div className="num">100+</div>
                <div className="label">{t('landing.skilledWorkers')}</div>
              </div>
              <div className="hero-stat-item">
                <div className="num">50+</div>
                <div className="label">{t('landing.happyCustomers')}</div>
              </div>
              <div className="hero-stat-item">
                <div className="num">200+</div>
                <div className="label">{t('landing.servicesDone')}</div>
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
            <h2>{t('landing.why')}</h2>
            <p>{t('landing.whyText')}</p>
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
            <h2>{t('landing.how')}</h2>
            <p>{t('landing.howText')}</p>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '🔍', title: 'Choose a Service', desc: 'Browse 12+ service categories. Our AI matches you with the best nearby worker.' },
              { step: '02', icon: '📅', title: 'Book & Schedule', desc: 'Pick a time, describe the job, and book instantly. Emergency? We\'ve got you covered.' },
              { step: '03', icon: '✅', title: 'Get It Done', desc: 'Verified worker arrives, completes the job. Pay fairly. Rate and support the cooperative.' }
            ].map((item, i) => (
              <div className="card" key={i} style={{ textAlign: 'center', padding: '40px 28px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>STEP {item.step}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="section ai-section">
        <div className="container">
          <div className="ai-section-inner">
            <div className="ai-section-text">
              <div className="ai-badge">🤖 AI-Powered</div>
              <h2>Smart Matching, Instant Booking</h2>
              <p>
                Our AI assistant matches you with the best available worker based on skills, ratings, location and availability.
                Just tell us what you need — we'll handle the rest.
              </p>
              <ul className="ai-features-list">
                <li><span className="check">✓</span> Smart worker-job matching based on skill & proximity</li>
                <li><span className="check">✓</span> AI demand forecasting for fair wages</li>
                <li><span className="check">✓</span> Instant price estimates & emergency booking</li>
                <li><span className="check">✓</span> Seasonal workforce allocation intelligence</li>
              </ul>
            </div>
            <div className="ai-chat-preview">
              <div className="ai-chat-header">
                <span>🤖</span> ActiveSetu AI Assistant
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar user-av">👤</div>
                <div className="ai-chat-bubble user-msg">I need a plumber near Bareilly for a pipe leak</div>
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar bot-av">🤖</div>
                <div className="ai-chat-bubble bot-msg">
                  Found 3 verified plumbers near you! Ramesh Kumar (⭐ 4.8, 5 yrs exp) from Bareilly Skilled Workers Cooperative is available now. Estimated cost: ₹299–499.
                </div>
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar user-av">👤</div>
                <div className="ai-chat-bubble user-msg">Book Ramesh for 10 AM tomorrow</div>
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar bot-av">🤖</div>
                <div className="ai-chat-bubble bot-msg">
                  ✅ Done! Booking confirmed with Ramesh Kumar for tomorrow at 10 AM. You'll receive a confirmation shortly.
                </div>
              </div>
            </div>
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
              <Link to="/register" className="btn btn-accent btn-lg">{t('landing.createAccount')}</Link>
              <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>{t('landing.signIn')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo footer-logo"><img src={activeSetuMark} alt="ActiveSetu" /> <span>Active<span>Setu</span></span></div>
            <p className="brand-description">Find trusted local service professionals and opportunities in one place.</p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <Link to="/workers?skill=Plumbing">Plumbing</Link>
            <Link to="/workers?skill=Electrical">Electrical</Link>
            <Link to="/workers?skill=AC%20Repair">AC Repair</Link>
            <Link to="/workers?skill=Cleaning">Cleaning</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a><a href="#">Careers</a><a href="#">Blog</a><a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <h4>For Workers</h4>
            <Link to="/register?role=worker">Join Cooperative</Link>
            <Link to="/for-workers/training">Training</Link>
            <Link to="/for-workers/welfare">Welfare Benefits</Link>
            <Link to="/for-workers/partner">Partner</Link>
          </div>
        </div>
        <div className="footer-bottom brand-footer">© 2026 ActiveSetu. Connecting People. Empowering Work.</div>
      </footer>
    </div>
  );
}
