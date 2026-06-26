import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');

// Helper to ensure data directory and files exist
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const files = {
    'categories.json': getSeedCategories(),
    'products.json': getSeedProducts(),
    'users.json': getSeedUsers(),
    'orders.json': [],
    'inquiries.json': getSeedInquiries()
  };

  for (const [filename, defaultData] of Object.entries(files)) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    }
  }
}

// Read data
export function readData(file) {
  initDb();
  const filePath = path.join(DATA_DIR, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

// Write data
export function writeData(file, data) {
  initDb();
  const filePath = path.join(DATA_DIR, file);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${file}:`, error);
    return false;
  }
}

// Core Database Methods
export const db = {
  // Products
  getProducts: () => readData('products.json'),
  saveProducts: (products) => writeData('products.json', products),

  // Categories
  getCategories: () => readData('categories.json'),
  saveCategories: (categories) => writeData('categories.json', categories),

  // Users
  getUsers: () => readData('users.json'),
  saveUsers: (users) => writeData('users.json', users),

  // Orders
  getOrders: () => readData('orders.json'),
  saveOrders: (orders) => writeData('orders.json', orders),

  // Inquiries
  getInquiries: () => readData('inquiries.json'),
  saveInquiries: (inquiries) => writeData('inquiries.json', inquiries),
};

// Seed Data helper functions
function getSeedCategories() {
  return [
    { id: 'edible-oils', name: 'Edible Oils', slug: 'edible-oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80' },
    { id: 'groundnuts', name: 'Groundnuts', slug: 'groundnuts', image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&auto=format&fit=crop&q=80' },
    { id: 'masala-items', name: 'Masala Items', slug: 'masala-items', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80' },
    { id: 'rice-varieties', name: 'Rice Varieties', slug: 'rice-varieties', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80' },
    { id: 'biriyani-powder-mixes', name: 'Biriyani Powder Mixes', slug: 'biriyani-powder-mixes', image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80' },
    { id: 'malt-powder', name: 'Malt Powder', slug: 'malt-powder', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&auto=format&fit=crop&q=80' },
    { id: 'health-mix-products', name: 'Health Mix Products', slug: 'health-mix-products', image: 'https://images.unsplash.com/photo-1610970881699-44a5587caa9e?w=500&auto=format&fit=crop&q=80' },
    { id: 'brown-sugar', name: 'Brown Sugar', slug: 'brown-sugar', image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&auto=format&fit=crop&q=80' },
    { id: 'millet-rice', name: 'Millet Rice', slug: 'millet-rice', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80' },
    { id: 'flours', name: 'Flours', slug: 'flours', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80' },
    { id: 'seekakai-powder', name: 'Seekakai Powder', slug: 'seekakai-powder', image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=80' }
  ];
}

function getSeedProducts() {
  return [
    {
      id: 'prod_1',
      name: 'Cold Pressed Groundnut Oil (Wood Pressed)',
      description: '100% pure cold-pressed groundnut oil, made using traditional wooden chekku methods. Packed with nutrients and retains its natural aroma. Ideal for wholesale distribution and bulk kitchen applications.',
      price: 2850,
      unit: '15L Tin',
      stock: 45,
      rating: 4.8,
      numReviews: 24,
      categoryId: 'edible-oils',
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610970881699-44a5587caa9e?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Extraction Method': 'Cold Wood Pressed',
        'Grade': 'Premium Food Grade',
        'Packaging': 'Recyclable Tin',
        'Shelf Life': '12 Months'
      },
      benefits: [
        'Rich in Vitamin E and antioxidants',
        'High smoke point, perfect for deep frying',
        'No artificial preservatives or added chemicals'
      ],
      usage: [
        'Ideal for daily cooking and deep frying',
        'Used in commercial kitchens and pickle manufacturing'
      ]
    },
    {
      id: 'prod_2',
      name: 'Premium Bold Groundnuts (Raw)',
      description: 'Selected handpicked bold groundnuts. Cleaned, graded, and stored under moisture-controlled conditions. Perfect for oil extraction, roasting, and confectionery use.',
      price: 6800,
      unit: '50kg Bag',
      stock: 30,
      rating: 4.6,
      numReviews: 18,
      categoryId: 'groundnuts',
      images: [
        'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Moisture Content': 'Less than 6%',
        'Count': '40/50 per ounce',
        'Grade': 'Export Grade',
        'Packaging': 'Gunny Bag'
      },
      benefits: [
        'High oil content',
        'Uniform size and clean kernels',
        'Long shelf life under dry conditions'
      ],
      usage: [
        'Oil pressing plants',
        'Snack manufacturing and wholesale retailing'
      ]
    },
    {
      id: 'prod_3',
      name: 'Pure Turmeric Powder (High Curcumin)',
      description: 'Grown organically, harvested, polished, and ground. Contains high natural curcumin content (~5%) giving a deep golden color and strong earthy flavor.',
      price: 2200,
      unit: '10kg Box (1kg x 10)',
      stock: 60,
      rating: 4.9,
      numReviews: 32,
      categoryId: 'masala-items',
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Curcumin Content': '4.8% - 5.2%',
        'Form': 'Powdered',
        'Adulteration': '0%',
        'Shelf Life': '18 Months'
      },
      benefits: [
        'Strong anti-inflammatory properties',
        'Natural colorant and spice',
        'No artificial colors added'
      ],
      usage: [
        'Daily cooking and food industries',
        'Ayurvedic formulations and cosmetic labs'
      ]
    },
    {
      id: 'prod_4',
      name: 'Jeeraga Samba Rice (Aromatic)',
      description: 'Highly aromatic, small grain Jeeraga Samba rice. Cleaned and aged for over 1 year to ensure non-sticky texture and perfect cooking quality. The staple rice for authentic South Indian Biriyani.',
      price: 3800,
      unit: '25kg Bag',
      stock: 40,
      rating: 4.9,
      numReviews: 45,
      categoryId: 'rice-varieties',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Age': '12+ Months Aged',
        'Grain Size': 'Short, Fine Grain',
        'Aroma': 'High Natural Aroma',
        'Packaging': 'BOPP bag'
      },
      benefits: [
        'Aromatic and tasty',
        'Light on stomach and easy digestion',
        'Grains remain separate when cooked'
      ],
      usage: [
        'Biriyani and Pulao preparation',
        'Special occasion rice dishes'
      ]
    },
    {
      id: 'prod_5',
      name: 'Classic Biriyani Masala Powder',
      description: 'An premium blend of spices (cardamom, cinnamon, cloves, mace, nutmeg, star anise) ground to perfection. A ready-to-use mix that guarantees restaurant-style biriyani aroma.',
      price: 1500,
      unit: '5kg Pack (500g x 10)',
      stock: 80,
      rating: 4.7,
      numReviews: 29,
      categoryId: 'biriyani-powder-mixes',
      images: [
        'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Ingredients': 'Cardamom, Cinnamon, Cloves, Mace, Star Anise, Fennel, Spices',
        'Grade': 'Aromatic Blend',
        'Shelf Life': '12 Months'
      },
      benefits: [
        'Balanced flavor profile',
        'Time-saving for commercial catering',
        'Retains aroma for long periods'
      ],
      usage: [
        'Restaurant kitchens and home cooking',
        'Caterers and food processors'
      ]
    },
    {
      id: 'prod_6',
      name: 'Organic Brown Sugar (Country Sugar)',
      description: 'Traditional Country Brown Sugar (Nattu Sakkarai) made from organic sugarcane juice without using chemicals or refining agents. Rich in iron and minerals.',
      price: 2400,
      unit: '20kg bag',
      stock: 50,
      rating: 4.8,
      numReviews: 21,
      categoryId: 'brown-sugar',
      images: [
        'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Type': 'Unrefined Country Sugar',
        'Moisture': 'Less than 1.5%',
        'Grade': 'Grade 1 Organic',
        'Chemicals': 'Nil'
      },
      benefits: [
        'Healthy alternative to refined sugar',
        'Rich in calcium, iron, and potassium',
        'No chemical bleaching agents'
      ],
      usage: [
        'Sweetening tea, coffee, and beverages',
        'Traditional sweet manufacturing'
      ]
    },
    {
      id: 'prod_7',
      name: 'Premium Sprouted Health Mix (Sathu Maavu)',
      description: 'A traditional food prepared from 18 natural ingredients including sprouted millets, grains, pulses, and dry fruits. Highly nutritious, ideal for toddlers, growing children, and health-conscious adults.',
      price: 3200,
      unit: '10kg (1kg x 10)',
      stock: 25,
      rating: 4.9,
      numReviews: 38,
      categoryId: 'health-mix-products',
      images: [
        'https://images.unsplash.com/photo-1610970881699-44a5587caa9e?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Ingredients': 'Sprouted Ragi, Bajra, Wheat, Jowar, Green Gram, Roasted Gram, Almonds, Cashews, Cardamom',
        'Form': 'Powdered Mix',
        'Preservatives': 'None',
        'Age Group': 'All ages (6 months+)'
      },
      benefits: [
        'Loaded with dietary fibers, proteins, and vitamins',
        'Improves immunity and bone strength',
        'Easy to digest and tasty'
      ],
      usage: [
        'Porridge preparation with milk or water',
        'Can be baked into health biscuits or cookies'
      ]
    },
    {
      id: 'prod_8',
      name: 'Chocolate Malt Nutrition Powder',
      description: 'Premium malted beverage powder fortified with essential vitamins and minerals. Perfect for retail packaging or institutional use in school hostels and gyms.',
      price: 2900,
      unit: '10kg Bag',
      stock: 35,
      rating: 4.5,
      numReviews: 12,
      categoryId: 'malt-powder',
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Flavor': 'Rich Chocolate',
        'Type': 'Malted Milk Food',
        'Shelf Life': '12 Months'
      },
      benefits: [
        'High energy drink mix',
        'Provides vitamins B, D, Iron, and Calcium',
        'Delicious chocolate flavor'
      ],
      usage: [
        'Stir into hot or cold milk',
        'Baking and smoothie addition'
      ]
    },
    {
      id: 'prod_9',
      name: 'Organic Foxtail Millet Rice',
      description: 'Foxtail millet (Thinai) sourced directly from organic farmers. Hull removed carefully to retain maximum nutritional value. Low glycemic index food.',
      price: 1800,
      unit: '10kg Bag',
      stock: 55,
      rating: 4.7,
      numReviews: 19,
      categoryId: 'millet-rice',
      images: [
        'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Millet Type': 'Foxtail (Thinai)',
        'Grade': 'Polished & Cleaned Grade A',
        'Gluten': 'Gluten-Free'
      },
      benefits: [
        'Regulates blood sugar and cholesterol',
        'High in dietary fiber and magnesium',
        'Super food for diabetic diets'
      ],
      usage: [
        'Alternative to normal white rice',
        'Used to make porridge, upma, and idli batter'
      ]
    },
    {
      id: 'prod_10',
      name: 'Premium Chakki Atta (Whole Wheat)',
      description: 'Stone ground whole wheat flour. Milled from selected high-quality Sharbati grains. Retains natural bran and fiber for soft, healthy rotis and chapatis.',
      price: 2300,
      unit: '50kg Bag',
      stock: 45,
      rating: 4.8,
      numReviews: 50,
      categoryId: 'flours',
      images: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Milling': 'Stone-ground (Chakki)',
        'Wheat Quality': '100% Sharbati Wheat',
        'Bran Content': 'High (Unrefined)'
      },
      benefits: [
        'Makes extra soft rotis that last long',
        'High dietary fiber aids digestion',
        'No Maida blending'
      ],
      usage: [
        'Chapati, Roti, Naan, and Parotta',
        'Commercial bakeries and hotels'
      ]
    },
    {
      id: 'prod_11',
      name: 'Natural Seekakai Powder (Herbal Hair Wash)',
      description: 'Pure, organic Seekakai (Soap pod) powder blended with Reetha (Soapnut), Amla (Gooseberry), and Hibiscus. A traditional chemical-free hair cleanser and conditioner.',
      price: 1950,
      unit: '5kg (500g x 10)',
      stock: 20,
      rating: 4.8,
      numReviews: 15,
      categoryId: 'seekakai-powder',
      images: [
        'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Ingredients': 'Seekakai, Reetha, Amla, Methi, Hibiscus petals, Neem',
        '100% Organic': 'Yes',
        'Chemicals/Sulphates': '0%'
      },
      benefits: [
        'Reduces dandruff and controls hair fall',
        'Acts as a natural conditioner and detangler',
        'Safe for regular use on all hair types'
      ],
      usage: [
        'Mix with warm water to form paste, apply on hair, and wash'
      ]
    },
    {
      id: 'prod_12',
      name: 'Cold Pressed Coconut Oil (Sulfur-Free)',
      description: 'Extracted from sun-dried copra without any heat treatment. Naturally clarified and sulfur-free. Rich in medium-chain triglycerides (MCTs).',
      price: 3300,
      unit: '15L Tin',
      stock: 32,
      rating: 4.9,
      numReviews: 27,
      categoryId: 'edible-oils',
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Extraction': 'Cold Pressed Copra',
        'Sulfur Content': '0%',
        'Grade': 'Premium Cooking Grade'
      },
      benefits: [
        'Immunity booster due to Lauric Acid',
        'Adds exquisite flavor to South Indian cuisine',
        'Excellent for hair and skin care too'
      ],
      usage: [
        'Cooking, sautéing, and baking',
        'Cosmetic formulation ingredient'
      ]
    },
    {
      id: 'prod_13',
      name: 'Sona Masoori Rice (Aged 1 Year)',
      description: 'Premium light-weight and aromatic medium grain Sona Masoori Rice. Aged for minimum 12 months. Low starch content, cooks beautifully.',
      price: 1550,
      unit: '25kg Bag',
      stock: 70,
      rating: 4.7,
      numReviews: 54,
      categoryId: 'rice-varieties',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Type': 'Medium Grain Sona Masoori',
        'Age': '12+ Months',
        'Moisture': '< 12%'
      },
      benefits: [
        'Low starch, suitable for diabetic control',
        'Fluffy and separate grains upon cooking',
        'Exceptional taste'
      ],
      usage: [
        'Daily rice consumption',
        'Used in schools, office canteens, and catering'
      ]
    },
    {
      id: 'prod_14',
      name: 'Roasted Split Gram (Chutney Dhal)',
      description: 'Crisp roasted split gram. Fully de-hulled, polished, and roasted under uniform temperatures. Essential ingredient for South Indian chutneys and snacks.',
      price: 1400,
      unit: '20kg bag',
      stock: 45,
      rating: 4.8,
      numReviews: 16,
      categoryId: 'masala-items',
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Type': 'Roasted Gram (Pottukadalai)',
        'Grade': 'Premium Yellow Bold',
        'Admixture': 'Max 0.5%'
      },
      benefits: [
        'High plant-based protein content',
        'Crunchy and fresh packing',
        'No artificial colors'
      ],
      usage: [
        'Coconut chutneys and snack mixtures',
        'Sweet preparations like roasted gram laddu'
      ]
    },
    {
      id: 'prod_15',
      name: 'Finger Millet (Ragi) Malt Powder',
      description: 'Finely milled sprouted ragi (finger millet) malt powder mixed with organic cardamom. Excellent morning nutritional drink for all ages.',
      price: 1600,
      unit: '10kg (1kg x 10)',
      stock: 40,
      rating: 4.7,
      numReviews: 22,
      categoryId: 'malt-powder',
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&auto=format&fit=crop&q=80'
      ],
      specs: {
        'Millet Type': 'Sprouted Ragi (Finger Millet)',
        'Cardamom flavor': 'Yes',
        'Shelf life': '9 Months'
      },
      benefits: [
        'Rich in natural Calcium and Iron',
        'Gluten-free nutrient source',
        'Aids in cooling down body heat'
      ],
      usage: [
        'Make ragi malt porridge with milk/buttermilk',
        'Substitute in baking recipes for cookies'
      ]
    }
  ];
}

function getSeedUsers() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('adminpassword', salt);
  const userPasswordHash = bcrypt.hashSync('retailerpassword', salt);

  return [
    {
      id: 'usr_admin',
      name: 'Bommal Admin',
      email: 'admin@bommalfoods.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+91 9876543210',
      address: 'Admin Block, Bommal Foods Wholesale Plaza, Chennai, TN, India'
    },
    {
      id: 'usr_retailer',
      name: 'Senthil Store Owner',
      email: 'retailer@gmail.com',
      passwordHash: userPasswordHash,
      role: 'retailer',
      phone: '+91 9444123456',
      address: 'No 45, Bazaar Street, Madurai, Tamil Nadu, India'
    }
  ];
}

function getSeedInquiries() {
  return [
    {
      id: 'inq_1',
      name: 'Karthik Raja',
      email: 'karthik@rajadistributors.com',
      subject: 'Bulk Purchase Discount Inquiry',
      message: 'Hello Bommal Foods team, we are a major distributor in Trichy. We are interested in purchasing 100 tins of Groundnut Oil and 50 bags of Sona Masoori Rice monthly. Do you offer special volume discounts or custom delivery contracts for this quantity?',
      status: 'pending',
      createdAt: '2026-06-11T10:00:00.000Z'
    },
    {
      id: 'inq_2',
      name: 'Priya Mani',
      email: 'priya@organicsuperstore.com',
      subject: 'Organic Certification Inquiry',
      message: 'Hi, I run an organic grocery chain. I want to verify if your Sprouted Health Mix and Country Brown Sugar have official NPOP organic certifications, and can you share the certification certificates over email?',
      status: 'replied',
      replyMessage: 'Hello Priya, yes, our Sprouted Health Mix and Brown Sugar are fully certified organic. We have sent the certificates to your email address. Thank you!',
      createdAt: '2026-06-10T14:30:00.000Z'
    }
  ];
}
