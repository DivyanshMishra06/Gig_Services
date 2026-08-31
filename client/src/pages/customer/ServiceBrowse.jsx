import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../../services/api';

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
  { _id: '11', name: 'Pest Control', icon: '🐛', description: 'Cockroach, termite, mosquito treatment', basePrice: 799, category: 'Home Care', isEmergency: true },
  { _id: '12', name: 'Beauty & Salon', icon: '💇', description: 'Haircut, facial, makeup at home', basePrice: 399, category: 'Personal Care' }
];

export default function ServiceBrowse() {
  const [services, setServicesData] = useState(defaultServices);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getServices().then(res => {
      if (res.data?.length) setServicesData(res.data);
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
      <div className="page-header">
        <h1>Browse Services</h1>
        <p>Find the right service for your needs</p>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid-3">
        {filtered.map(s => (
          <Link to={`/workers?skill=${s.name}`} key={s._id} style={{ textDecoration: 'none' }}>
            <div className="service-card">
              <div className="icon">{s.icon}</div>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <div className="price">Starting ₹{s.basePrice}</div>
              {s.isEmergency && <div className="badge badge-danger" style={{ marginTop: '12px' }}>🚨 Emergency Available</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
