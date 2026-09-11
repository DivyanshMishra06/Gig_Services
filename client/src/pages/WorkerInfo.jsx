import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function WorkerInfo() {
  const { t } = useTranslation();
  const { topic } = useParams();
  const validTopics = ['training', 'welfare', 'partner'];
  const activeTopic = validTopics.includes(topic) ? topic : 'training';

  const title = t(`workerInfo.${activeTopic}.title`);
  const intro = t(`workerInfo.${activeTopic}.intro`);
  const items = t(`workerInfo.${activeTopic}.items`, { returnObjects: true });

  return (
    <main className="worker-info-page">
      <section className="worker-info-card">
        <span className="worker-info-label">{t('workerInfo.forWorkers')}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <ul>{items.map((item) => <li key={item}>✓ {item}</li>)}</ul>
        <div className="worker-info-actions">
          <Link className="btn btn-primary" to="/register?role=worker">{t('workerInfo.joinAsWorker')}</Link>
          <Link className="btn btn-secondary" to="/">{t('workerInfo.backToHome')}</Link>
        </div>
      </section>
    </main>
  );
}
