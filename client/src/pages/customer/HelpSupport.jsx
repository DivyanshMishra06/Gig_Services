import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function HelpSupport() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const faqs = ['book', 'cancel', 'payment', 'contact', 'absent', 'report'].map((key) => [
    t(`helpSupport.faqs.${key}Question`),
    t(`helpSupport.faqs.${key}Answer`)
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ subject: '', message: '' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  };

  return (
    <main className="help-support-page">
      <header className="page-header help-support-header">
        <span className="help-support-eyebrow">{t('helpSupport.eyebrow')}</span>
        <h1>{t('helpSupport.title')}</h1>
        <p>{t('helpSupport.subtitle')}</p>
      </header>

      <section className="help-faq-card card" aria-labelledby="faq-heading">
        <div className="help-section-heading">
          <h2 id="faq-heading">{t('helpSupport.faqTitle')}</h2>
          <p>{t('helpSupport.faqSubtitle')}</p>
        </div>
        <div className="help-faq-list">
          {faqs.map(([question, answer]) => (
            <details className="help-faq-item" key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="help-contact-card card" aria-labelledby="contact-support-heading">
        <div className="help-section-heading">
          <h2 id="contact-support-heading">{t('helpSupport.contactTitle')}</h2>
          <p>{t('helpSupport.contactSubtitle')}</p>
        </div>
        {submitted && (
          <p className="help-support-message" role="status">
            {t('helpSupport.localConfirmation')}
          </p>
        )}
        <form className="help-support-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="support-subject">{t('helpSupport.subject')}</label>
            <input id="support-subject" name="subject" value={form.subject} onChange={handleChange} placeholder={t('helpSupport.subjectPlaceholder')} required />
          </div>
          <div className="form-group">
            <label htmlFor="support-message">{t('helpSupport.message')}</label>
            <textarea id="support-message" name="message" value={form.message} onChange={handleChange} placeholder={t('helpSupport.messagePlaceholder')} rows="6" required />
          </div>
          <button className="btn btn-primary" type="submit">{t('helpSupport.submit')}</button>
        </form>
      </section>
    </main>
  );
}
