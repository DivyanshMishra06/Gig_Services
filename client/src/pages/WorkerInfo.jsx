import { Link, useParams } from 'react-router-dom';

const content = {
  training: {
    title: 'Worker Training',
    intro: 'Build practical skills and grow your service career with ActiveSetu.',
    items: ['Skill-focused learning for home and local services', 'Safety, customer service, and digital-work guidance', 'Certificates to help strengthen your worker profile']
  },
  welfare: {
    title: 'Welfare Benefits',
    intro: 'ActiveSetu helps workers understand the support available through cooperative work.',
    items: ['Fair and transparent earning opportunities', 'Guidance on welfare and insurance options', 'A community designed to support workers and their families']
  },
  partner: {
    title: 'Partner with ActiveSetu',
    intro: 'Cooperatives and service organisations can partner with us to create better local work opportunities.',
    items: ['Connect your skilled workforce to service requests', 'Support verified worker profiles and reliable bookings', 'Grow with a people-first local services network']
  }
};

export default function WorkerInfo() {
  const { topic } = useParams();
  const page = content[topic] || content.training;

  return (
    <main className="worker-info-page">
      <section className="worker-info-card">
        <span className="worker-info-label">For Workers</span>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <ul>{page.items.map((item) => <li key={item}>✓ {item}</li>)}</ul>
        <div className="worker-info-actions">
          <Link className="btn btn-primary" to="/register?role=worker">Join as a worker</Link>
          <Link className="btn btn-secondary" to="/">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
