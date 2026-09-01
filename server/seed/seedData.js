const mongoose = require('mongoose');

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const Cooperative = require('../models/Cooperative');

const services = [
  { name: 'Plumbing', nameHi: 'प्लंबिंग', category: 'Home Repair', description: 'Pipe fixing, leak repair, bathroom fitting', descriptionHi: 'पाइप फिक्सिंग, लीक रिपेयर', icon: '🔧', basePrice: 299, popularity: 95 },
  { name: 'Electrical', nameHi: 'इलेक्ट्रिकल', category: 'Home Repair', description: 'Wiring, switch repair, fan installation', descriptionHi: 'वायरिंग, स्विच रिपेयर', icon: '⚡', basePrice: 249, popularity: 92 },
  { name: 'AC Repair', nameHi: 'एसी रिपेयर', category: 'Appliance', description: 'AC servicing, gas refill, installation', descriptionHi: 'एसी सर्विसिंग', icon: '❄️', basePrice: 499, popularity: 88 },
  { name: 'Cleaning', nameHi: 'सफाई', category: 'Home Care', description: 'Deep cleaning, sofa cleaning, kitchen cleaning', descriptionHi: 'गहरी सफाई', icon: '🧹', basePrice: 399, popularity: 90 },
  { name: 'Carpentry', nameHi: 'बढ़ई', category: 'Home Repair', description: 'Furniture repair, door fixing, wood work', descriptionHi: 'फर्नीचर रिपेयर', icon: '🪚', basePrice: 349, popularity: 75 },
  { name: 'Painting', nameHi: 'पेंटिंग', category: 'Home Care', description: 'Wall painting, waterproofing, texture', descriptionHi: 'दीवार पेंटिंग', icon: '🎨', basePrice: 599, popularity: 70 },
  { name: 'Appliance Repair', nameHi: 'उपकरण मरम्मत', category: 'Appliance', description: 'Washing machine, fridge, microwave repair', descriptionHi: 'वाशिंग मशीन, फ्रिज रिपेयर', icon: '🔌', basePrice: 349, popularity: 82 },
  { name: 'Home Caregiver', nameHi: 'होम केयरगिवर', category: 'Care', description: 'Elderly care, patient care, companionship', descriptionHi: 'बुजुर्गों की देखभाल', icon: '🏥', basePrice: 599, popularity: 65 },
  { name: 'Driver', nameHi: 'ड्राइवर', category: 'Transport', description: 'Personal driver, outstation, daily commute', descriptionHi: 'पर्सनल ड्राइवर', icon: '🚗', basePrice: 499, popularity: 78 },
  { name: 'Gardening', nameHi: 'बागवानी', category: 'Home Care', description: 'Garden maintenance, plant care, landscaping', descriptionHi: 'बगीचे की देखभाल', icon: '🌿', basePrice: 299, popularity: 60 },
  { name: 'Pest Control', nameHi: 'कीट नियंत्रण', category: 'Home Care', description: 'Cockroach, termite, mosquito treatment', descriptionHi: 'कीट नियंत्रण', icon: '🐛', basePrice: 799, popularity: 72, isEmergency: true },
  { name: 'Beauty & Salon', nameHi: 'ब्यूटी और सैलून', category: 'Personal Care', description: 'Haircut, facial, makeup at home', descriptionHi: 'हेयरकट, फेशियल', icon: '💇', basePrice: 399, popularity: 85 }
];

const cooperatives = [
  { name: 'Bareilly Skilled Workers Cooperative', registrationNumber: 'BSWC-2024-001', location: { address: 'Civil Lines, Bareilly', city: 'Bareilly', state: 'Uttar Pradesh', coordinates: [79.415, 28.370] }, totalMembers: 245, activeWorkers: 189, services: ['Plumbing', 'Electrical', 'Carpentry'], rating: 4.5, federationName: 'UP Workers Federation', welfareFund: 450000, totalRevenue: 2800000, description: 'Premier cooperative serving Bareilly region since 2020' },
  { name: 'Lucknow Home Services Society', registrationNumber: 'LHSS-2024-002', location: { address: 'Gomti Nagar, Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', coordinates: [80.996, 26.856] }, totalMembers: 380, activeWorkers: 295, services: ['AC Repair', 'Cleaning', 'Appliance Repair', 'Painting'], rating: 4.6, federationName: 'UP Workers Federation', welfareFund: 620000, totalRevenue: 4500000, description: 'Largest home services cooperative in Lucknow' },
  { name: 'Delhi NCR Gig Workers Union', registrationNumber: 'DNGWU-2024-003', location: { address: 'Saket, New Delhi', city: 'Delhi', state: 'Delhi', coordinates: [77.218, 28.524] }, totalMembers: 520, activeWorkers: 410, services: ['All Services'], rating: 4.4, federationName: 'National Gig Workers Federation', welfareFund: 890000, totalRevenue: 7200000, description: 'Serving the Delhi NCR metropolitan area' }
];

const workerProfiles = [
  { name: 'Ramesh Kumar', email: 'ramesh@demo.com', phone: '9876543210', skills: ['Plumbing', 'Pipe Fitting'], primarySkill: 'Plumbing', cooperativeName: 'Bareilly Skilled Workers Cooperative', experience: 8, rating: 4.7, totalRatings: 124, completedJobs: 340, verificationStatus: 'verified', startingPrice: 299, languages: ['Hindi', 'English'], bio: 'Expert plumber with 8 years experience. Specializing in modern bathroom fittings.', city: 'Bareilly', coordinates: [79.432, 28.367] },
  { name: 'Suresh Yadav', email: 'suresh@demo.com', phone: '9876543211', skills: ['Electrical', 'Wiring', 'Fan Installation'], primarySkill: 'Electrical', cooperativeName: 'Bareilly Skilled Workers Cooperative', experience: 12, rating: 4.8, totalRatings: 210, completedJobs: 520, verificationStatus: 'verified', startingPrice: 249, languages: ['Hindi'], bio: 'Licensed electrician. Government certified. All types of residential and commercial wiring.', city: 'Bareilly', coordinates: [79.420, 28.365] },
  { name: 'Priya Sharma', email: 'priya@demo.com', phone: '9876543212', skills: ['Cleaning', 'Deep Cleaning', 'Kitchen Cleaning'], primarySkill: 'Cleaning', cooperativeName: 'Lucknow Home Services Society', experience: 5, rating: 4.9, totalRatings: 185, completedJobs: 290, verificationStatus: 'verified', startingPrice: 399, languages: ['Hindi', 'English'], bio: 'Professional cleaning services with eco-friendly products.', city: 'Lucknow', coordinates: [80.990, 26.860] },
  { name: 'Vikram Singh', email: 'vikram@demo.com', phone: '9876543213', skills: ['AC Repair', 'AC Installation', 'AC Servicing'], primarySkill: 'AC Repair', cooperativeName: 'Lucknow Home Services Society', experience: 10, rating: 4.6, totalRatings: 156, completedJobs: 410, verificationStatus: 'verified', startingPrice: 499, languages: ['Hindi', 'English', 'Urdu'], bio: 'All brand AC repair expert. Quick diagnosis, affordable rates.', city: 'Lucknow', coordinates: [81.000, 26.850] },
  { name: 'Anita Devi', email: 'anita@demo.com', phone: '9876543214', skills: ['Home Caregiver', 'Elderly Care', 'Patient Care'], primarySkill: 'Home Caregiver', cooperativeName: 'Delhi NCR Gig Workers Union', experience: 7, rating: 4.8, totalRatings: 98, completedJobs: 180, verificationStatus: 'verified', startingPrice: 599, languages: ['Hindi', 'English', 'Punjabi'], bio: 'Trained caregiver with nursing background. Compassionate patient care.', city: 'Delhi', coordinates: [77.220, 28.520] },
  { name: 'Mohd Aamir', email: 'aamir@demo.com', phone: '9876543215', skills: ['Carpentry', 'Furniture Repair', 'Wood Work'], primarySkill: 'Carpentry', cooperativeName: 'Bareilly Skilled Workers Cooperative', experience: 15, rating: 4.5, totalRatings: 178, completedJobs: 450, verificationStatus: 'verified', startingPrice: 349, languages: ['Hindi', 'Urdu'], bio: 'Master carpenter. Custom furniture, repairs, and modern fittings.', city: 'Bareilly', coordinates: [79.440, 28.355] },
  { name: 'Deepak Verma', email: 'deepak@demo.com', phone: '9876543216', skills: ['Painting', 'Waterproofing', 'Texture Painting'], primarySkill: 'Painting', cooperativeName: 'Lucknow Home Services Society', experience: 9, rating: 4.4, totalRatings: 112, completedJobs: 280, verificationStatus: 'verified', startingPrice: 599, languages: ['Hindi'], bio: 'Professional painter with expertise in Asian Paints, texture & waterproofing.', city: 'Lucknow', coordinates: [80.980, 26.870] },
  { name: 'Sunita Kumari', email: 'sunita@demo.com', phone: '9876543217', skills: ['Beauty & Salon', 'Facial', 'Makeup'], primarySkill: 'Beauty & Salon', cooperativeName: 'Delhi NCR Gig Workers Union', experience: 6, rating: 4.9, totalRatings: 220, completedJobs: 380, verificationStatus: 'verified', startingPrice: 399, languages: ['Hindi', 'English'], bio: 'Certified beautician. Bridal makeup, facials, and at-home salon services.', city: 'Delhi', coordinates: [77.215, 28.530] },
  { name: 'Rajesh Tiwari', email: 'rajesh@demo.com', phone: '9876543218', skills: ['Appliance Repair', 'Washing Machine', 'Fridge Repair'], primarySkill: 'Appliance Repair', cooperativeName: 'Bareilly Skilled Workers Cooperative', experience: 11, rating: 4.3, totalRatings: 145, completedJobs: 360, verificationStatus: 'pending', startingPrice: 349, languages: ['Hindi'], bio: 'Multi-brand appliance repair. Samsung, LG, Whirlpool specialist.', city: 'Bareilly', coordinates: [79.425, 28.375] },
  { name: 'Kavita Patel', email: 'kavita@demo.com', phone: '9876543219', skills: ['Gardening', 'Landscaping', 'Plant Care'], primarySkill: 'Gardening', cooperativeName: 'Delhi NCR Gig Workers Union', experience: 4, rating: 4.7, totalRatings: 67, completedJobs: 120, verificationStatus: 'verified', startingPrice: 299, languages: ['Hindi', 'English'], bio: 'Passionate gardener. Terrace gardens, landscaping, and plant care.', city: 'Delhi', coordinates: [77.225, 28.518] }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Worker.deleteMany({});
    await Service.deleteMany({});
    await Cooperative.deleteMany({});
    console.log('Cleared existing data');

    // Seed services
    const createdServices = await Service.insertMany(services);
    console.log(`Seeded ${createdServices.length} services`);

    // Seed cooperatives
    const createdCoops = await Cooperative.insertMany(cooperatives);
    console.log(`Seeded ${createdCoops.length} cooperatives`);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@coopgig.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      location: { type: 'Point', coordinates: [79.432, 28.367], address: 'Civil Lines', city: 'Bareilly', state: 'UP', pincode: '243001' }
    });
    console.log('Created admin user: admin@coopgig.com / admin123');

    // Create customer user
    const customer = await User.create({
      name: 'Rahul Gupta',
      email: 'customer@demo.com',
      password: 'customer123',
      phone: '9888888888',
      role: 'customer',
      location: { type: 'Point', coordinates: [79.430, 28.368], address: 'MG Road, Bareilly', city: 'Bareilly', state: 'UP', pincode: '243001' },
      savedAddresses: [
        { label: 'Home', address: 'MG Road, Bareilly', city: 'Bareilly', coordinates: [79.430, 28.368] },
        { label: 'Office', address: 'Civil Lines, Bareilly', city: 'Bareilly', coordinates: [79.415, 28.370] }
      ]
    });
    console.log('Created customer user: customer@demo.com / customer123');

    // Create worker users and profiles
    for (const wp of workerProfiles) {

      const user = await User.create({
        name: wp.name,
        email: wp.email,
        password: 'worker123',
        phone: wp.phone,
        role: 'worker',
        location: { type: 'Point', coordinates: wp.coordinates, address: `${wp.city} Area`, city: wp.city, state: 'UP' }
      });

      const coopDoc = createdCoops.find(c => c.name === wp.cooperativeName);

      await Worker.create({
        userId: user._id,
        skills: wp.skills,
        primarySkill: wp.primarySkill,
        cooperativeId: coopDoc?._id,
        cooperativeName: wp.cooperativeName,
        experience: wp.experience,
        rating: wp.rating,
        totalRatings: wp.totalRatings,
        completedJobs: wp.completedJobs,
        verificationStatus: wp.verificationStatus,
        startingPrice: wp.startingPrice,
        languages: wp.languages,
        bio: wp.bio,
        location: { type: 'Point', coordinates: wp.coordinates, address: `${wp.city} Area`, city: wp.city },
        availability: 'available',
        welfareStatus: {
          insurance: wp.verificationStatus === 'verified',
          accidentCoverage: wp.verificationStatus === 'verified',
          trainingCompleted: Math.floor(Math.random() * 5) + 1,
          healthSupport: wp.verificationStatus === 'verified',
          emergencySupport: wp.verificationStatus === 'verified',
          welfareContribution: Math.floor(Math.random() * 500) + 100,
          cooperativeContribution: Math.floor(Math.random() * 1000) + 200
        },
        earnings: {
          today: Math.floor(Math.random() * 2000) + 500,
          weekly: Math.floor(Math.random() * 10000) + 3000,
          monthly: Math.floor(Math.random() * 40000) + 15000,
          total: Math.floor(Math.random() * 200000) + 80000
        }
      });
      console.log(`Created worker: ${wp.name} (${wp.email} / worker123)`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Accounts:');
    console.log('  Admin:    admin@coopgig.com / admin123');
    console.log('  Customer: customer@demo.com / customer123');
    console.log('  Worker:   ramesh@demo.com / worker123 (or any worker email)');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
