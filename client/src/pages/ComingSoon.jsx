import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Header({ eyebrow, title, description }) {
  return <header className="page-header company-page-header"><span className="company-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}

function AboutPage() {
  const { t } = useTranslation();
  const capabilities = t('aboutPage.capabilities.items', { returnObjects: true });
  const reasons = t('aboutPage.why.reasons', { returnObjects: true });
  const steps = t('aboutPage.steps.items', { returnObjects: true });
  const values = t('aboutPage.values', { returnObjects: true });

  return (
    <main className="company-page company-about-page">
      <section className="company-about-hero">
        <Header eyebrow={t('aboutPage.eyebrow')} title={t('aboutPage.title')} description={t('aboutPage.description')} />
        <Link to="/services" className="btn btn-primary btn-lg">{t('aboutPage.exploreServices')}</Link>
      </section>

      <section className="company-about-section company-purpose-section">
        <div className="company-section-intro"><span className="company-eyebrow">{t('aboutPage.purpose.eyebrow')}</span><h2>{t('aboutPage.purpose.title')}</h2></div>
        <div className="card company-purpose-card"><p>{t('aboutPage.purpose.text1')}</p><p>{t('aboutPage.purpose.text2')}</p></div>
      </section>

      <section className="company-about-section"><div className="company-section-intro"><span className="company-eyebrow">{t('aboutPage.capabilities.eyebrow')}</span><h2>{t('aboutPage.capabilities.title')}</h2><p>{t('aboutPage.capabilities.description')}</p></div><div className="company-capability-grid">{capabilities.map((item, index) => <article className="card company-capability-card" key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>

      <section className="company-about-section company-steps-section"><div className="company-section-intro"><span className="company-eyebrow">{t('aboutPage.steps.eyebrow')}</span><h2>{t('aboutPage.steps.title')}</h2></div><div className="company-steps-grid">{steps.map((step) => <article key={step.num}><span>{step.num}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></section>

      <section className="card company-vision-card"><span className="company-eyebrow">{t('aboutPage.vision.eyebrow')}</span><h2>{t('aboutPage.vision.title')}</h2><p>{t('aboutPage.vision.description')}</p></section>

      <section className="company-about-section"><div className="company-section-intro"><span className="company-eyebrow">{t('aboutPage.why.eyebrow')}</span><h2>{t('aboutPage.why.title')}</h2></div><div className="company-reasons">{reasons.map((reason) => <div key={reason}>✓ <span>{reason}</span></div>)}</div></section>

      <section className="company-about-section company-commitment"><div><span className="company-eyebrow">{t('aboutPage.commitment.eyebrow')}</span><h2>{t('aboutPage.commitment.title')}</h2></div><div><p>{t('aboutPage.commitment.text1')}</p><p>{t('aboutPage.commitment.text2')}</p></div></section>

      <section className="cta-section company-about-cta"><div className="cta-box"><h2>{t('aboutPage.cta.title')}</h2><p>{t('aboutPage.cta.description')}</p><div className="company-cta-actions"><Link to="/services" className="btn btn-accent btn-lg">{t('aboutPage.cta.exploreServices')}</Link><Link to="/workers" className="btn btn-lg company-cta-secondary">{t('aboutPage.cta.findWorkers')}</Link></div></div></section>
    </main>
  );
}

function MissionPage() {
  const { t } = useTranslation();
  const values = t('missionPage.values', { returnObjects: true });
  return (
    <main className="company-page">
      <Header eyebrow={t('missionPage.eyebrow')} title={t('missionPage.title')} description={t('missionPage.description')} />
      <section className="card company-story-card"><h2>{t('missionPage.storyTitle')}</h2><p>{t('missionPage.storyText1')}</p><p>{t('missionPage.storyText2')}</p></section>
      <section className="company-value-grid">{values.map((v) => <article className="card company-value-card" key={v.num}><span>{v.num}</span><h2>{v.title}</h2><p>{v.description}</p></article>)}</section>
    </main>
  );
}

function BlogPage() {
  const { t } = useTranslation();
  const articles = t('blogPage.articles', { returnObjects: true });
  return (
    <main className="company-page">
      <Header eyebrow={t('blogPage.eyebrow')} title={t('blogPage.title')} description={t('blogPage.description')} />
      <section className="company-blog-grid">{articles.map((article) => <article className="card company-article" key={article.title}><span className="company-article-tag">{article.category}</span><h2>{article.title}</h2><p>{article.description}</p><ul>{article.points.map((point) => <li key={point}>{point}</li>)}</ul><button className="company-read-more" type="button">{t('blogPage.readMore')} <span aria-hidden="true">→</span></button></article>)}</section>
    </main>
  );
}

function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const change = ({ target: { name, value } }) => { setForm((current) => ({ ...current, [name]: value })); setSubmitted(false); };
  const submit = (event) => { event.preventDefault(); setSubmitted(true); setForm({ name: '', email: '', subject: '', message: '' }); };
  return (
    <main className="company-page">
      <Header eyebrow={t('contactPage.eyebrow')} title={t('contactPage.title')} description={t('contactPage.description')} />
      <div className="company-contact-layout">
        <section className="card company-support-card">
          <h2>{t('contactPage.supportTitle')}</h2>
          <p>{t('contactPage.supportDescription')}</p>
          <div className="company-contact-detail"><strong>{t('contactPage.customers')}</strong><span>{t('contactPage.customersText')}</span></div>
          <div className="company-contact-detail"><strong>{t('contactPage.serviceWorkers')}</strong><span>{t('contactPage.serviceWorkersText')}</span></div>
          <div className="company-contact-detail"><strong>{t('contactPage.bookingGuidance')}</strong><span>{t('contactPage.bookingGuidanceText')}</span></div>
        </section>
        <section className="card company-contact-form">
          <h2>{t('contactPage.formTitle')}</h2>
          <p className="company-form-note">{t('contactPage.formNote')}</p>
          {submitted && <p className="help-support-message" role="status">{t('contactPage.formSubmitted')}</p>}
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label htmlFor="contact-name">{t('contactPage.name')}</label><input id="contact-name" name="name" value={form.name} onChange={change} required /></div>
              <div className="form-group"><label htmlFor="contact-email">{t('contactPage.email')}</label><input id="contact-email" name="email" type="email" value={form.email} onChange={change} required /></div>
            </div>
            <div className="form-group"><label htmlFor="contact-subject">{t('contactPage.subject')}</label><input id="contact-subject" name="subject" value={form.subject} onChange={change} placeholder={t('contactPage.subjectPlaceholder')} required /></div>
            <div className="form-group"><label htmlFor="contact-message">{t('contactPage.message')}</label><textarea id="contact-message" name="message" value={form.message} onChange={change} placeholder={t('contactPage.messagePlaceholder')} rows="7" required /></div>
            <button className="btn btn-primary" type="submit">{t('contactPage.submit')}</button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function CompanyPage() {
  const page = useLocation().pathname;
  if (page === '/contact') return <ContactPage />;
  if (page === '/blog') return <BlogPage />;
  return page === '/mission' ? <MissionPage /> : <AboutPage />;
}
