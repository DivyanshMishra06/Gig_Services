import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getServices } from '../../services/api';
import { useTranslation } from 'react-i18next';
import plumberImage from '../../assets/images/services/plumber.jpg';
import painterImage from '../../assets/images/services/painter.jpg';
import electricianImage from '../../assets/images/services/electrician.jpg';
import driverImage from '../../assets/images/services/Driver.jpg';
import cleanerImage from '../../assets/images/services/cleaner.jpg';
import carpenterImage from '../../assets/images/services/carpenter.jpg';
import beautyImage from '../../assets/images/services/Beauty.jpg';
import applianceImage from '../../assets/images/services/Appliance_repair.jpg';
import acRepairImage from '../../assets/images/services/AC_repair.jpg';
import gardeningImage from '../../assets/images/services/Gardening.jpg';
import homeCaregiverImage from '../../assets/images/services/Home_Caregiver.jpg';
import homeCookImage from '../../assets/images/services/Home_Cook.jpg';
import dishwashingImage from '../../assets/images/services/Dishwahing.jpg';

const serviceImages = {
  plumbing: plumberImage,
  painting: painterImage,
  electrical: electricianImage,
  electrician: electricianImage,
  driver: driverImage,
  cleaning: cleanerImage,
  'house cleaning': cleanerImage,
  carpentry: carpenterImage,
  carpenter: carpenterImage,
  beauty: beautyImage,
  'beauty & salon': beautyImage,
  'beauty / salon': beautyImage,
  'appliance repair': applianceImage,
  'ac repair': acRepairImage,
  gardening: gardeningImage,
  'home caregiver': homeCaregiverImage,
  'home cook': homeCookImage,
  dishwashing: dishwashingImage
};

const getServiceImage = (serviceName) => serviceImages[serviceName?.trim().toLowerCase()];

const defaultServices = [
  { _id: '1', name: 'Plumbing', icon: '🔧', description: 'Pipe fixing, leak repair, bathroom fitting', basePrice: 299, category: 'Home Repair' },
  { _id: '2', name: 'Electrical', icon: '⚡', description: 'Wiring, switch repair, fan installation', basePrice: 249, category: 'Home Repair' },
  { _id: '3', name: 'AC Repair', icon: '❄️', description: 'AC servicing, gas refill, installation', basePrice: 499, category: 'Appliance' },
  { _id: '4', name: 'Cleaning', icon: '🧹', description: 'Deep cleaning, sofa cleaning, kitchen cleaning', basePrice: 399, category: 'Home Care' },
  { _id: '5', name: 'Carpentry', icon: '🪚', description: 'Furniture repair, door fixing, wood work', basePrice: 349, category: 'Home Repair' },
  { _id: '6', name: 'Painting', icon: '🎨', description: 'Wall painting, waterproofing, texture', basePrice: 599, category: 'Home Care' },
  { _id: '7', name: 'Appliance Repair', icon: '🔌', description: 'Washing machine, fridge, microwave repair', basePrice: 349, category: 'Appliance' },
  { _id: '8', name: 'Home Caregiver', icon: '🏥', description: 'Elderly care, patient care, companionship', basePrice: 599, category: 'Care' },
  { _id: '9', name: 'Driver', icon: '🚗', description: 'Personal driver, outstation, daily commute', basePrice: 499, category: 'Transport' },
  { _id: '10', name: 'Gardening', icon: '🌿', description: 'Garden maintenance, plant care, landscaping', basePrice: 299, category: 'Home Care' },
  { _id: '12', name: 'Beauty & Salon', icon: '💇', description: 'Haircut, facial, makeup at home', basePrice: 399, category: 'Personal Care' },
  { _id: '13', name: 'Home Cook', icon: '👨‍🍳', description: 'Skilled home cooks for fresh, hygienic everyday meals prepared at your home.', basePrice: 299, priceLabel: 'From ₹299 / visit', category: 'Home Care' },
  { _id: '14', name: 'Dishwashing', icon: '🍽️', description: 'Reliable help for washing dishes and keeping your kitchen clean and organized.', basePrice: 149, priceLabel: 'From ₹149 / visit', category: 'Home Care' }
];

const mergeServices = (remoteServices) => {
  const servicesByName = new Map();
  [...remoteServices, ...defaultServices].forEach((service) => {
    const normalizedName = service.name?.trim().toLowerCase();
    if (normalizedName && !servicesByName.has(normalizedName)) {
      servicesByName.set(normalizedName, service);
    }
  });
  return [...servicesByName.values()];
};

export default function ServiceBrowse() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const [services, setServicesData] = useState(defaultServices);
  const [search, setSearch] = useState(urlParams.get('search') || '');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getServices().then(res => {
      if (res.data?.length) setServicesData(mergeServices(res.data));
    }).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(services.map(s => s.category))];

  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || s.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button type="button" className="public-back-button" onClick={() => navigate(-1)}>← {t('nav.back')}</button>
      <div className="page-header">
        <h1>{t('services.browse')}</h1>
        <p>{t('services.subtitle')}</p>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            placeholder={t('services.placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c === 'All' ? t('services.all') : c}</option>)}
        </select>
      </div>

      <div className="grid-3">
        {filtered.map(s => (
          <Link to={`/workers?skill=${s.name}`} key={s._id} style={{ textDecoration: 'none' }}>
            <div className="service-card">
              {getServiceImage(s.name) && (
                <img
                  className="service-card-image"
                  src={getServiceImage(s.name)}
                  alt={`${s.name} service`}
                />
              )}
              <div className="icon">{s.icon}</div>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <div className="price">{s.priceLabel || `${t('services.starting')} ₹${s.basePrice}`}</div>
              {s.isEmergency && <div className="badge badge-danger" style={{ marginTop: '12px' }}>🚨 {t('services.emergency')}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
