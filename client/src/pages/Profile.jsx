import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMe, updateProfile, updateWorker } from '../services/api';
import LocationPicker from '../components/LocationPicker';
import { useTranslation } from 'react-i18next';

const formatLocation = (location, t) => {
  if (!location) return t('profile.notProvided');
  return [location.address, location.city, location.state, location.pincode].filter(Boolean).join(', ') || t('profile.notProvided');
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({});

  const createForm = (data) => ({
    name: data?.name || '',
    phone: data?.phone || '',
    avatar: data?.avatar || '',
    language: data?.language || 'en',
    address: data?.location?.address || '',
    city: data?.location?.city || '',
    state: data?.location?.state || '',
    pincode: data?.location?.pincode || '',
    location: data?.location?.coordinates?.length === 2 ? data.location : null,
    serviceArea: data?.workerProfile?.serviceArea || 10
  });

  useEffect(() => {
    let active = true;
    getMe()
      .then(({ data }) => {
        if (active) {
          setProfile(data);
          updateUser(data);
          setForm(createForm(data));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const startEditing = () => {
    setForm(createForm(profile));
    setMessage('');
    setError('');
    setIsEditing(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { address, city, state, pincode, location: selectedLocation, serviceArea, ...account } = form;
      const location = selectedLocation?.coordinates?.length === 2
        ? { ...selectedLocation, address, city, state, pincode }
        : undefined;
      const { data } = await updateProfile({ ...account, ...(location ? { location } : {}) });
      if (profile?.role === 'worker') await updateWorker({ ...(location ? { location } : {}), serviceArea: Number(serviceArea) });
      const updatedProfile = { ...data, workerProfile: { ...profile?.workerProfile, serviceArea: Number(serviceArea), ...(location ? { location } : {}) } };
      setProfile(updatedProfile);
      updateUser(updatedProfile);
      setIsEditing(false);
      setMessage(t('profile.updateSuccess'));
    } catch (saveError) {
      setError(saveError.response?.data?.message || t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const details = [
    [t('profile.emailAddress'), profile?.email || t('profile.notProvided')],
    [t('profile.phoneNumber'), profile?.phone || t('profile.notProvided')],
    [t('profile.locationLabel'), formatLocation(profile?.location, t)],
    [t('profile.preferredLanguage'), profile?.language === 'hi' ? t('profile.hindi') : t('profile.english')],
    [t('profile.accountType'), profile?.role || t('profile.notProvided')]
  ];

  return (
    <main className="profile-page">
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>
      <section className="profile-card" aria-label="Profile information">
        <div className="profile-hero">
          <div className="profile-avatar">
            {profile?.avatar ? <img src={profile.avatar} alt="" /> : profile?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2>{profile?.name || t('profile.user')}</h2>
            <p>{profile?.email || t('profile.noEmail')}</p>
            <span className="profile-role">{profile?.role || t('profile.accountType')} {t('profile.accountLabel')}</span>
          </div>
          {!isEditing && <button className="btn btn-secondary btn-sm profile-edit-button" onClick={startEditing}>{t('profile.editProfile')}</button>}
        </div>
        {message && <p className="profile-message profile-success" role="status">{message}</p>}
        {error && <p className="profile-message profile-error" role="alert">{error}</p>}
        {isEditing ? (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group"><label htmlFor="profile-name">{t('profile.fullName')}</label><input id="profile-name" name="name" value={form.name} onChange={handleChange} required /></div>
              <div className="form-group"><label htmlFor="profile-phone">{t('profile.phoneNumber')}</label><input id="profile-phone" name="phone" value={form.phone} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label htmlFor="profile-avatar">{t('profile.avatarUrl')}</label><input id="profile-avatar" name="avatar" type="url" value={form.avatar} onChange={handleChange} placeholder="https://example.com/photo.jpg" /></div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="profile-address">{t('profile.address')}</label><input id="profile-address" name="address" value={form.address} onChange={handleChange} /></div>
              <div className="form-group"><label htmlFor="profile-city">{t('profile.city')}</label><input id="profile-city" name="city" value={form.city} onChange={handleChange} /></div>
            </div>
            <LocationPicker value={form.location} onChange={location => setForm(current => ({
              ...current,
              location,
              address: location.address || current.address,
              city: location.city || current.city
            }))} actionLabel={profile?.role === 'worker' ? t('profile.useServiceLocation') : t('profile.useCurrentLocation')} />
            <div className="form-row">
              <div className="form-group"><label htmlFor="profile-state">{t('profile.state')}</label><input id="profile-state" name="state" value={form.state} onChange={handleChange} /></div>
              <div className="form-group"><label htmlFor="profile-pincode">{t('profile.pinCode')}</label><input id="profile-pincode" name="pincode" value={form.pincode} onChange={handleChange} /></div>
            </div>
            {profile?.role === 'worker' && <div className="form-group"><label htmlFor="profile-service-area">{t('profile.serviceArea')}</label><input id="profile-service-area" name="serviceArea" type="number" min="0.1" max="100" step="0.1" value={form.serviceArea} onChange={handleChange} required /><p className="profile-readonly">{t('profile.serviceAreaHint')}</p></div>}
            <div className="form-group"><label htmlFor="profile-language">{t('profile.preferredLanguage')}</label><select id="profile-language" name="language" value={form.language} onChange={handleChange}><option value="en">{t('profile.english')}</option><option value="hi">{t('profile.hindi')}</option></select></div>
            <p className="profile-readonly">{t('profile.cannotChange')}</p>
            <div className="profile-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setError(''); }}>{t('common.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('profile.saving') : t('profile.saveChanges')}</button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            {details.map(([label, value]) => (
              <div className="profile-detail" key={label}>
                <span className="profile-detail-label">{label}</span>
                <span className="profile-detail-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
