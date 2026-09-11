import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getServices } from '../services/api';
import { useTranslation } from 'react-i18next';
import activeSetuMark from '../assets/activesetu-navbar-white.png';

const services = [
  { icon: '🔧', name: 'Plumbing', nameKey: 'plumbing', searchLabel: 'Plumbing', related: ['Plumber'] },
  { icon: '⚡', name: 'Electrical', nameKey: 'electrical', searchLabel: 'Electrical' },
  { icon: '❄️', name: 'AC Repair', nameKey: 'acRepair', searchLabel: 'AC Repair', related: ['AC Service'] },
  { icon: '🧹', name: 'Cleaning', nameKey: 'cleaning', searchLabel: 'Cleaning' },
  { icon: '🪚', name: 'Carpentry', nameKey: 'carpentry', searchLabel: 'Carpentry' },
  { icon: '🎨', name: 'Painting', nameKey: 'painting', searchLabel: 'Painting' },
  { icon: '🔌', name: 'Appliance', nameKey: 'appliance', searchLabel: 'Appliance Repair' },
  { icon: '🏥', name: 'Caregiver', nameKey: 'caregiver', searchLabel: 'Caregiver' },
  { icon: '💇', name: 'Beauty', nameKey: 'beauty', searchLabel: 'Beauty' },
  { icon: '👨‍🍳', name: 'Home Cook', nameKey: 'homeCook', searchLabel: 'Home Cook' },
  { icon: '🍽️', name: 'Dishwashing', nameKey: 'dishwashing', searchLabel: 'Dishwashing' }
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
  { icon: '🤝', titleKey: 'cooperativeTitle', descriptionKey: 'cooperativeDescription' },
  { icon: '🛡️', titleKey: 'welfareTitle', descriptionKey: 'welfareDescription' },
  { icon: '📊', titleKey: 'forecastTitle', descriptionKey: 'forecastDescription' },
  { icon: '⭐', titleKey: 'verificationTitle', descriptionKey: 'verificationDescription' },
  { icon: '🌐', titleKey: 'multilingualTitle', descriptionKey: 'multilingualDescription' },
  { icon: '🚨', titleKey: 'emergencyTitle', descriptionKey: 'emergencyDescription' }
];

export default function Landing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusSearch = searchParams.get('focusSearch') === 'true';

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
    getServices()
      .then((res) => {
        if (res.data?.length) setRemoteServices(res.data);
      })
      .catch(() => {});
  }, [user]);

  // Close prompt / suggestions when clicking outside
  useEffect(() => {
    if (!showSuggestions) return;
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

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

            {/* Search is available to all visitors; booking remains protected. */}
            {(
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
            )}

            <div className="hero-trust-badges" aria-label="ActiveSetu benefits">
              <span>✓ {t('landing.trust.verifiedWorkers')}</span>
              <span>✓ {t('landing.trust.transparentPricing')}</span>
              <span>✓ {t('landing.trust.workerWelfare')}</span>
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
                  <div className="name">{t(`landing.serviceNames.${s.nameKey}`)}</div>
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
                <h3>{t(`landing.features.${f.titleKey}`)}</h3>
                <p>{t(`landing.features.${f.descriptionKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>{t('landing.how')}</h2>
            <p>{t('landing.howText')}</p>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '🔍', titleKey: 'chooseTitle', descriptionKey: 'chooseDescription' },
              { step: '02', icon: '📅', titleKey: 'bookTitle', descriptionKey: 'bookDescription' },
              { step: '03', icon: '✅', titleKey: 'doneTitle', descriptionKey: 'doneDescription' }
            ].map((item, i) => (
              <div className="card" key={i} style={{ textAlign: 'center', padding: '40px 28px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>{t('landing.steps.label', { number: item.step })}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>{t(`landing.steps.${item.titleKey}`)}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t(`landing.steps.${item.descriptionKey}`)}</p>
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
              <div className="ai-badge">🤖 {t('landing.ai.badge')}</div>
              <h2>{t('landing.ai.title')}</h2>
              <p>{t('landing.ai.description')}</p>
              <ul className="ai-features-list">
                <li><span className="check">✓</span> {t('landing.ai.matching')}</li>
                <li><span className="check">✓</span> {t('landing.ai.forecasting')}</li>
                <li><span className="check">✓</span> {t('landing.ai.estimates')}</li>
                <li><span className="check">✓</span> {t('landing.ai.allocation')}</li>
              </ul>
            </div>
            <div className="ai-chat-preview">
              <div className="ai-chat-header">
                <span>🤖</span> {t('assistant.title')}
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar user-av">👤</div>
                <div className="ai-chat-bubble user-msg">{t('landing.ai.userRequest')}</div>
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar bot-av">🤖</div>
                <div className="ai-chat-bubble bot-msg">
                  {t('landing.ai.assistantResponse')}
                </div>
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar user-av">👤</div>
                <div className="ai-chat-bubble user-msg">{t('landing.ai.bookingRequest')}</div>
              </div>
              <div className="ai-chat-msg">
                <div className="ai-chat-avatar bot-av">🤖</div>
                <div className="ai-chat-bubble bot-msg">
                  ✅ {t('landing.ai.bookingResponse')}
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
            <h2>{t('landing.ctaTitle')}</h2>
            <p>{t('landing.ctaDescription')}</p>
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
            <p className="brand-description">{t('landing.footerDescription')}</p>
          </div>
          <div className="footer-col">
            <h4>{t('landing.footerServices')}</h4>
            <Link to="/workers?skill=Plumbing">{t('landing.serviceNames.plumbing')}</Link>
            <Link to="/workers?skill=Electrical">{t('landing.serviceNames.electrical')}</Link>
            <Link to="/workers?skill=AC%20Repair">{t('landing.serviceNames.acRepair')}</Link>
            <Link to="/workers?skill=Cleaning">{t('landing.serviceNames.cleaning')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('footer.company')}</h4>
            <Link to="/about">{t('footer.about')}</Link><Link to="/mission">{t('footer.mission')}</Link><Link to="/blog">{t('footer.blog')}</Link><Link to="/contact">{t('footer.contact')}</Link>
          </div>
          <div className="footer-col">
            <h4>{t('landing.footerWorkers')}</h4>
            <Link to="/register?role=worker">{t('landing.joinCooperative')}</Link>
            <Link to="/for-workers/training">{t('landing.training')}</Link>
            <Link to="/for-workers/welfare">{t('landing.welfareBenefits')}</Link>
            <Link to="/for-workers/partner">{t('landing.partner')}</Link>
          </div>
        </div>
        <div className="footer-bottom brand-footer">{t('landing.copyright')}</div>
      </footer>
    </div>
  );
}
