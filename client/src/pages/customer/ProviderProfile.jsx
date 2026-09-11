import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getWorkerById } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function ProviderProfile() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkerById(workerId).then(({ data }) => setProvider(data)).catch(() => setProvider(null)).finally(() => setLoading(false));
  }, [workerId]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!provider) return <main className="provider-page"><div className="empty-state"><h3>{t('providerProfile.notFound')}</h3><Link className="btn btn-primary" to="/workers">{t('providerProfile.browseProviders')}</Link></div></main>;

  const name = provider.userName || provider.userId?.name || t('providerProfile.serviceProvider');
  const phone = provider.userPhone || provider.userId?.phone || '9876543210';

  return (
    <main className="provider-page">
      <button type="button" className="public-back-button" onClick={() => navigate(-1)}>← {t('nav.back')}</button>
      <Link className="back-link" to="/workers">← {t('providerProfile.backToProviders')}</Link>
      <section className="provider-profile-card">
        <div className="provider-profile-header">
          <div className="worker-avatar provider-avatar">{name.charAt(0).toUpperCase()}</div>
          <div className="provider-profile-intro">
            <div className="provider-title-row"><h1>{name}</h1>{provider.verificationStatus === 'verified' && <span className="badge badge-success">✓ {t('providerProfile.verified')}</span>}</div>
            <p>{provider.primarySkill || t('providerProfile.gigServices')} {provider.cooperativeName && ` · ${provider.cooperativeName}`}</p>
            <div className="provider-stats">⭐ {provider.rating || '0'} ({provider.totalRatings || 0} {t('providerProfile.reviews')}) <span>•</span> 🛠️ {provider.experience || 0} {t('providerProfile.yearsExperience')} <span>•</span> ✅ {provider.completedJobs || 0} {t('providerProfile.jobs')}</div>
          </div>
        </div>
        <p className="provider-bio">{provider.bio || t('providerProfile.defaultBio')}</p>
        <div className="provider-actions">
          <Link to={`/chat/${provider._id}`} state={{ provider }} className="btn btn-secondary">💬 {t('providerProfile.chatAction')}</Link>
          <a href={`tel:${phone}`} className="btn btn-secondary">📞 {t('providerProfile.callAction')}</a>
          {provider.verificationStatus === 'verified' && provider.availability !== 'offline'
            ? <Link to={`/book/${provider._id}`} className="btn btn-primary">{t('providerProfile.bookNow')}</Link>
            : <span className="btn btn-secondary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>{provider.availability === 'offline' ? t('providerProfile.workerOffline') : t('providerProfile.notYetVerified')}</span>}
        </div>
        <p className="provider-contact-note">{t('providerProfile.contactNumber')} <a href={`tel:${phone}`}>{phone}</a></p>
      </section>
      <section className="provider-details-card">
        <h2>{t('providerProfile.servicesOffered')}</h2>
        <div className="provider-skills">{(provider.skills?.length ? provider.skills : [provider.primarySkill]).filter(Boolean).map((skill) => <span className="skill" key={skill}>{skill}</span>)}</div>
        {provider.languages?.length > 0 && <><h2>{t('providerProfile.languages')}</h2><p>{provider.languages.join(', ')}</p></>}
      </section>
    </main>
  );
}
