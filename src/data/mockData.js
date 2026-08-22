// AquaGo Wash - Comprehensive Realistic Mock Data

export const VEHICLE_CATEGORIES = [
  { id: 'bike', name: 'Bike', icon: 'Bike', description: 'Standard & Sports Motorcycles' },
  { id: 'scooter', name: 'Scooter', icon: 'Zap', description: 'Scooters & Mopeds' },
  { id: 'hatchback', name: 'Hatchback', icon: 'Car', description: 'Compact Cars (Swift, i20, etc.)' },
  { id: 'sedan', name: 'Sedan', icon: 'CarFront', description: 'Mid-size & Executive Sedans (City, Verna)' },
  { id: 'suv', name: 'SUV / MUV', icon: 'Truck', description: 'Compact & Full-size SUVs (Creta, Fortuner)' },
  { id: 'luxury', name: 'Premium / Luxury', icon: 'Crown', description: 'Luxury Sedans & SUVs (BMW, Audi, Merc)' },
];

export const INITIAL_SERVICES = [
  {
    id: 'srv-1',
    name: 'Basic Exterior Wash',
    category: 'hatchback',
    price: 349,
    originalPrice: 449,
    duration: '35 mins',
    rating: 4.8,
    reviewsCount: 142,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
    description: 'High-pressure foam wash for exterior paint, window cleaning, and wheel rim wiping.',
    included: [
      'High-pressure eco-water rinse',
      'pH-neutral snow foam shampoo',
      'Tire & wheel rim pressure cleaning',
      'Exterior microfiber towel dry',
      'Windshield & mirror streak-free wiping'
    ],
    notIncluded: [
      'Interior vacuum cleaning',
      'Dashboard dressing & polish',
      'Underbody jet wash',
      'Engine bay cleaning'
    ],
    recommendedVehicles: ['Hatchback', 'Sedan', 'SUV']
  },
  {
    id: 'srv-2',
    name: 'Premium Doorstep Wash',
    category: 'sedan',
    price: 599,
    originalPrice: 799,
    duration: '55 mins',
    rating: 4.9,
    reviewsCount: 289,
    badge: 'Best Value',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
    description: 'Complete exterior foam wash plus deep interior vacuuming and dashboard shine polish.',
    included: [
      'Everything in Basic Exterior Wash',
      'Deep interior cabin vacuuming (Seats & Carpet)',
      'Dashboard & door trims UV polish & conditioning',
      'Tire shine spray dressing',
      'Footmat wash & stain removal',
      'Air freshener spray application'
    ],
    notIncluded: [
      'Seat upholstery deep shampoo extraction',
      'Hard wax body coating'
    ],
    recommendedVehicles: ['Hatchback', 'Sedan', 'SUV', 'Luxury']
  },
  {
    id: 'srv-3',
    name: 'Interior Spa & Sanitization',
    category: 'suv',
    price: 799,
    originalPrice: 1099,
    duration: '60 mins',
    rating: 4.9,
    reviewsCount: 96,
    badge: 'Hygiene Special',
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80',
    description: 'Deep interior shampooing, stain extraction, AC vent steam sanitization, and leather polish.',
    included: [
      'Full cabin high-power vacuuming',
      'Fabric seat dry foam shampooing',
      'Leather seat cleaning & nourishing conditioner',
      'AC vent anti-bacterial steam cleaning',
      'Roof lining spot cleaning',
      'Odor eliminator treatment'
    ],
    notIncluded: [
      'Exterior foam body wash'
    ],
    recommendedVehicles: ['Sedan', 'SUV', 'Luxury']
  },
  {
    id: 'srv-4',
    name: 'Full Interior + Exterior Combo',
    category: 'sedan',
    price: 999,
    originalPrice: 1399,
    duration: '90 mins',
    rating: 5.0,
    reviewsCount: 340,
    badge: 'Recommended',
    image: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&w=600&q=80',
    description: 'The ultimate package: Complete exterior wash with hard wax shine + deep interior spa treatment.',
    included: [
      'Complete Premium Exterior Snow Wash',
      'Body Gloss Hard Wax Polish application',
      'Deep Interior Upholstery Shampooing',
      'Engine Bay degreasing & shine dressing',
      'AC Vent antibacterial steam cleaning',
      'Tire gloss & Alloy wheel rim detailing'
    ],
    notIncluded: [],
    recommendedVehicles: ['All Cars', 'Luxury Vehicles']
  },
  {
    id: 'srv-5',
    name: 'Pro Bike & Scooter Foam Wash',
    category: 'bike',
    price: 199,
    originalPrice: 299,
    duration: '25 mins',
    rating: 4.8,
    reviewsCount: 215,
    badge: 'Quick Wash',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: 'Gentle high-pressure foam wash, chain degreasing, engine area wiping, and body shine coat.',
    included: [
      'High-pressure water rinse',
      'Ph-balanced foam wash',
      'Chain degreasing & lubricant spray',
      'Tire wall dress shine',
      'Seat polish & drying'
    ],
    notIncluded: ['Engine oil change', 'Polishing compound buffing'],
    recommendedVehicles: ['Bike', 'Scooter']
  },
  {
    id: 'srv-6',
    name: 'Eco Waterless Smart Wash',
    category: 'hatchback',
    price: 299,
    originalPrice: 399,
    duration: '30 mins',
    rating: 4.7,
    reviewsCount: 78,
    badge: 'Eco Friendly',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    description: 'Save 150+ liters of water! Nano-polymer spray encapsulated wash with streak-free shine.',
    included: [
      'Waterless nano-polymer emulsion spray',
      'Ultra-soft plush microfiber buffing',
      'Window glass clear vision coat',
      'Tire dust wipe & shine'
    ],
    notIncluded: ['Underbody mud blasting'],
    recommendedVehicles: ['Hatchback', 'Sedan', 'SUV']
  }
];

export const ADD_ONS = [
  { id: 'addon-1', name: 'Tyre & Rim Polish', price: 99, icon: 'Disc', description: 'Deep black wet gloss tire shine spray' },
  { id: 'addon-2', name: 'Dashboard UV Shield Polish', price: 149, icon: 'Shield', description: 'Prevents cracking & gives rich satin finish' },
  { id: 'addon-3', name: 'High-Power Interior Vacuum', price: 199, icon: 'Wind', description: 'Removes deep dust, pet hair & sand' },
  { id: 'addon-4', name: 'AC Vent Steam Sanitization', price: 249, icon: 'Flame', description: 'Kills 99.9% germs and odor bacteria' },
  { id: 'addon-5', name: 'Carnuba Body Wax Coating', price: 349, icon: 'Sparkles', description: 'Hydrophobic protective shine layer' },
  { id: 'addon-6', name: 'Engine Bay Degreasing & Dressing', price: 299, icon: 'Cpu', description: 'Safe cleaning of engine hood area' },
];

export const INITIAL_COUPONS = [
  { code: 'FIRSTWASH', discount: 150, type: 'flat', minSpend: 300, description: 'Flat ₹150 OFF on your first booking!', expiry: '2026-12-31' },
  { code: 'SAVE10', discount: 10, type: 'percent', maxDiscount: 200, minSpend: 400, description: 'Get 10% OFF on orders above ₹400', expiry: '2026-10-15' },
  { code: 'WEEKEND20', discount: 20, type: 'percent', maxDiscount: 300, minSpend: 600, description: '20% OFF Special Weekend Discount', expiry: '2026-09-30' },
  { code: 'AQUAPRO', discount: 100, type: 'flat', minSpend: 500, description: 'Flat ₹100 OFF for registered members', expiry: '2026-11-20' },
];

export const MOCK_CUSTOMER_USER = {
  id: 'cust-101',
  role: 'customer',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 98765 43210',
  profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  currentLocation: 'Home – Vijayanagar, Mysuru',
  referralCode: 'RAHUL884',
  membership: { plan: 'Premium Monthly', expires: '2026-09-15', washesLeft: 3 }
};

export const MOCK_EMPLOYEE_USER = {
  id: 'emp-201',
  role: 'employee',
  name: 'Venkatesh Kumar',
  email: 'venky.wash@aquago.com',
  phone: '+91 91234 56789',
  photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  rating: 4.9,
  completedJobs: 184,
  todayEarnings: 1450,
  totalEarnings: 38200,
  status: 'Available', // 'Available' | 'On Job' | 'Offline'
  location: 'Saraswathipuram, Mysuru'
};

export const MOCK_ADMIN_USER = {
  id: 'admin-001',
  role: 'admin',
  name: 'Admin Supervisor',
  email: 'admin@aquago.com',
  phone: '+91 99000 11223'
};

export const INITIAL_VEHICLES = [
  {
    id: 'veh-1',
    type: 'sedan',
    brand: 'Honda',
    model: 'City ZX',
    regNumber: 'KA-09-MA-7821',
    color: 'Platinum White',
    isDefault: true
  },
  {
    id: 'veh-2',
    type: 'bike',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    regNumber: 'KA-09-EV-3490',
    color: 'Stealth Black',
    isDefault: false
  }
];

export const INITIAL_ADDRESSES = [
  {
    id: 'addr-1',
    label: 'Home',
    house: 'No. 42, 3rd Main Road',
    street: 'Gokulam 2nd Stage',
    area: 'Vijayanagar',
    landmark: 'Near Water Tank',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570002',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'Office',
    house: 'Suite 304, Tech Park',
    street: 'Hebbal Industrial Area',
    area: 'Hebbal',
    landmark: 'Opposite Infosys Campus',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570016',
    isDefault: false
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'AGW-84920',
    service: INITIAL_SERVICES[1],
    vehicle: INITIAL_VEHICLES[0],
    address: INITIAL_ADDRESSES[0],
    date: '2026-08-07',
    timeSlot: '09:00 AM – 10:00 AM',
    addons: [ADD_ONS[0], ADD_ONS[1]],
    couponApplied: 'FIRSTWASH',
    discountAmount: 150,
    basePrice: 599,
    addonsTotal: 248,
    finalAmount: 697,
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'Paid',
    status: 'Ongoing', // Upcoming | Ongoing | Completed | Cancelled
    progressStep: 2, // 0: Confirmed, 1: Assigned, 2: On The Way, 3: In Progress, 4: Completed
    employee: {
      id: 'emp-201',
      name: 'Venkatesh Kumar',
      phone: '+91 91234 56789',
      photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      completedJobs: 184
    },
    createdAt: '2026-08-06 20:30'
  },
  {
    id: 'AGW-83104',
    service: INITIAL_SERVICES[4],
    vehicle: INITIAL_VEHICLES[1],
    address: INITIAL_ADDRESSES[1],
    date: '2026-08-08',
    timeSlot: '02:00 PM – 03:00 PM',
    addons: [ADD_ONS[0]],
    couponApplied: null,
    discountAmount: 0,
    basePrice: 199,
    addonsTotal: 99,
    finalAmount: 298,
    paymentMethod: 'Cash After Service',
    paymentStatus: 'Pending',
    status: 'Upcoming',
    progressStep: 1,
    employee: {
      id: 'emp-202',
      name: 'Suresh Gowda',
      phone: '+91 98877 66554',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      completedJobs: 142
    },
    createdAt: '2026-08-06 18:15'
  },
  {
    id: 'AGW-79201',
    service: INITIAL_SERVICES[3],
    vehicle: INITIAL_VEHICLES[0],
    address: INITIAL_ADDRESSES[0],
    date: '2026-07-28',
    timeSlot: '10:00 AM – 11:00 AM',
    addons: [ADD_ONS[3]],
    couponApplied: 'SAVE10',
    discountAmount: 100,
    basePrice: 999,
    addonsTotal: 249,
    finalAmount: 1148,
    paymentMethod: 'Credit Card (HDFC)',
    paymentStatus: 'Paid',
    status: 'Completed',
    progressStep: 4,
    employee: {
      id: 'emp-201',
      name: 'Venkatesh Kumar',
      phone: '+91 91234 56789',
      photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      rating: 4.9
    },
    review: {
      rating: 5,
      comment: 'Excellent doorstep car cleaning! Venkatesh was prompt, professional, and left my Honda City sparkling inside out.',
      date: '2026-07-28'
    },
    createdAt: '2026-07-27 14:00'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Professional On The Way 🚗',
    message: 'Venkatesh is driving towards your location (Vijayanagar, Mysuru). ETA: 15 mins.',
    time: '10 mins ago',
    read: false,
    type: 'booking'
  },
  {
    id: 'notif-2',
    title: 'Booking Confirmed! ✅',
    message: 'Your booking #AGW-84920 for Premium Doorstep Wash on 7th Aug has been confirmed.',
    time: '2 hours ago',
    read: false,
    type: 'booking'
  },
  {
    id: 'notif-3',
    title: 'Weekend Special Offer 🎁',
    message: 'Use code WEEKEND20 to get 20% OFF on full interior + exterior spa wash.',
    time: '1 day ago',
    read: true,
    type: 'offer'
  }
];

export const INITIAL_OFFERS = [
  {
    id: 'off-1',
    title: 'Welcome First Wash Offer',
    description: 'Get flat ₹150 discount on your very first doorstep vehicle wash experience with AquaGo.',
    code: 'FIRSTWASH',
    discount: '₹150 OFF',
    validTill: '31st Dec 2026',
    category: 'Welcome'
  },
  {
    id: 'off-2',
    title: 'Weekend Detailing Blowout',
    description: 'Save 20% on all deep interior spa & wax detailing services booked for Saturday or Sunday.',
    code: 'WEEKEND20',
    discount: '20% OFF',
    validTill: '30th Sep 2026',
    category: 'Weekend'
  },
  {
    id: 'off-3',
    title: 'Refer & Wash Free',
    description: 'Invite your friends! When they book their first wash, both of you get ₹100 wash credits.',
    code: 'RAHUL884',
    discount: '₹100 Credit',
    validTill: 'Always Active',
    category: 'Referral'
  }
];

export const INITIAL_EMPLOYEES = [
  {
    id: 'emp-201',
    name: 'Venkatesh Kumar',
    phone: '+91 91234 56789',
    email: 'venky@aquago.com',
    role: 'Senior Detailing Technician',
    rating: 4.9,
    status: 'Available', // Active | Inactive
    activeJobId: 'AGW-84920',
    completedJobs: 184,
    photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-202',
    name: 'Suresh Gowda',
    phone: '+91 98877 66554',
    email: 'suresh@aquago.com',
    role: 'Wash Specialist',
    rating: 4.8,
    status: 'Available',
    activeJobId: null,
    completedJobs: 142,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'emp-203',
    name: 'Manjunath R',
    phone: '+91 97766 55443',
    email: 'manju@aquago.com',
    role: 'Eco-Wash Technician',
    rating: 4.7,
    status: 'Inactive',
    activeJobId: null,
    completedJobs: 98,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    city: 'Mysuru',
    status: 'Active',
    totalBookings: 8,
    totalSpent: 4850,
    joinedDate: '2026-03-12'
  },
  {
    id: 'cust-102',
    name: 'Priya Nayak',
    email: 'priya.n@example.com',
    phone: '+91 99112 23344',
    city: 'Mysuru',
    status: 'Active',
    totalBookings: 3,
    totalSpent: 1890,
    joinedDate: '2026-05-20'
  },
  {
    id: 'cust-103',
    name: 'Arun Varma',
    email: 'arun.varma@example.com',
    phone: '+91 98223 34455',
    city: 'Mysuru',
    status: 'Active',
    totalBookings: 12,
    totalSpent: 8900,
    joinedDate: '2026-01-10'
  }
];

export const ADMIN_ANALYTICS_DATA = {
  totalCustomers: 1248,
  totalEmployees: 18,
  todayBookings: 42,
  pendingBookings: 7,
  completedBookings: 31,
  cancelledBookings: 4,
  todayRevenue: 24650,
  monthlyRevenue: 482000,
  popularServices: [
    { name: 'Premium Doorstep Wash', count: 340, percentage: 42 },
    { name: 'Full Interior + Exterior Combo', count: 210, percentage: 26 },
    { name: 'Pro Bike Foam Wash', count: 180, percentage: 22 },
    { name: 'Basic Exterior Wash', count: 80, percentage: 10 },
  ],
  revenueByMonth: [
    { month: 'Jan', revenue: 320000 },
    { month: 'Feb', revenue: 380000 },
    { month: 'Mar', revenue: 410000 },
    { month: 'Apr', revenue: 435000 },
    { month: 'May', revenue: 460000 },
    { month: 'Jun', revenue: 490000 },
    { month: 'Jul', revenue: 520000 },
    { month: 'Aug', revenue: 482000 }
  ]
};

export const INITIAL_BUSINESS_SETTINGS = {
  businessName: 'AquaGo Wash',
  tagline: 'Professional Vehicle Care at Your Doorstep',
  phone: '+91 800-AQUAGO (278246)',
  email: 'support@aquago.com',
  address: '102 Waterworks Blvd, Gokulam 3rd Stage, Mysuru, Karnataka 570002',
  openingTime: '07:00 AM',
  closingTime: '08:00 PM',
  serviceAreas: 'Mysuru City, Hebbal, Vijayanagar, Kuvempunagar, Saraswathipuram, Jayalakshmipuram',
  taxPercentage: 18,
  cancellationRules: 'Free cancellation up to 2 hours before scheduled slot. 20% fee thereafter.'
};
