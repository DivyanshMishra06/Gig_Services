import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWorkerById } from '../../services/api';

export default function ProviderProfile() {
  const { workerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkerById(workerId).then(({ data }) => setProvider(data)).catch(() => setProvider(null)).finally(() => setLoading(false));
  }, [workerId]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!provider) return <main className="provider-page"><div className="empty-state"><h3>Provider not found</h3><Link className="btn btn-primary" to="/workers">Browse providers</Link></div></main>;

  const name = provider.userName || provider.userId?.name || 'Service provider';
  const phone = provider.userPhone || provider.userId?.phone || '9876543210';

  return (
    <main className="provider-page">
      <Link className="back-link" to="/workers">← Back to providers</Link>
      <section className="provider-profile-card">
        <div className="provider-profile-header">
          <div className="worker-avatar provider-avatar">{name.charAt(0).toUpperCase()}</div>
          <div className="provider-profile-intro">
            <div className="provider-title-row"><h1>{name}</h1>{provider.verificationStatus === 'verified' && <span className="badge badge-success">✓ Verified</span>}</div>
            <p>{provider.primarySkill || 'Gig services'} {provider.cooperativeName && ` · ${provider.cooperativeName}`}</p>
            <div className="provider-stats">⭐ {provider.rating || '0'} ({provider.totalRatings || 0} reviews) <span>•</span> 🛠️ {provider.experience || 0} years experience <span>•</span> ✅ {provider.completedJobs || 0} jobs</div>
          </div>
        </div>
        <p className="provider-bio">{provider.bio || 'This provider is ready to help with your service request.'}</p>
        <div className="provider-actions">
          <Link to={`/chat/${provider._id}`} state={{ provider }} className="btn btn-secondary">💬 Chat</Link>
          <a href={`tel:${phone}`} className="btn btn-secondary">📞 Call</a>
          {provider.verificationStatus === 'verified' && provider.availability !== 'offline'
            ? <Link to={`/book/${provider._id}`} className="btn btn-primary">Book now</Link>
            : <span className="btn btn-secondary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>{provider.availability === 'offline' ? 'Worker offline' : 'Not yet verified'}</span>}
        </div>
        <p className="provider-contact-note">Contact number: <a href={`tel:${phone}`}>{phone}</a></p>
      </section>
      <section className="provider-details-card">
        <h2>Services offered</h2>
        <div className="provider-skills">{(provider.skills?.length ? provider.skills : [provider.primarySkill]).filter(Boolean).map((skill) => <span className="skill" key={skill}>{skill}</span>)}</div>
        {provider.languages?.length > 0 && <><h2>Languages</h2><p>{provider.languages.join(', ')}</p></>}
      </section>
    </main>
  );
}
