// src/app/data/dummyData.ts

export const dummyInventory = [
  {
    id: 1,
    name: 'Kain Sutra Emas',
    description: 'Kain sutra premium warna emas dengan motif klasik',
    supplier: 'PT. Sinar Jaya Abadi',
    quantity: 150,
    unit: 'meter',
    price: 450000,
    category: 'Kain',
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c4f7?w=400'
  },
  {
    id: 2,
    name: 'Kain Batik Khas Jawa',
    description: 'Batik tulis halus motif parang rusak',
    supplier: 'CV. Aselole Hahahehe',
    quantity: 85,
    unit: 'meter',
    price: 350000,
    category: 'Kain',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'
  },
  {
    id: 3,
    name: 'Benang Polyester',
    description: 'Benang jahit kualitas tinggi berbagai warna',
    supplier: 'PT. Textile Indonesia',
    quantity: 500,
    unit: 'roll',
    price: 45000,
    category: 'Benang',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea60c12e?w=400'
  },
  {
    id: 4,
    name: 'Kancing Logam Premium',
    description: 'Kancing logam brass gold finish',
    supplier: 'UD. Logam Jaya',
    quantity: 2000,
    unit: 'pcs',
    price: 2500,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400'
  },
  {
    id: 5,
    name: 'Resleting YKK 60cm',
    description: 'Resleting metal original YKK',
    supplier: 'YKK Indonesia',
    quantity: 300,
    unit: 'pcs',
    price: 15000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'
  },
  {
    id: 6,
    name: 'Kain Wool Premium',
    description: 'Wool import Australia grade A',
    supplier: 'PT. Import Textile',
    quantity: 120,
    unit: 'meter',
    price: 650000,
    category: 'Kain',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea60c12e?w=400'
  },
  {
    id: 7,
    name: 'Kain Linen Natural',
    description: 'Linen 100% natural fiber',
    supplier: 'CV. Natural Fabric',
    quantity: 95,
    unit: 'meter',
    price: 280000,
    category: 'Kain',
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c4f7?w=400'
  },
  {
    id: 8,
    name: 'Pita Satin 2cm',
    description: 'Pita satin berbagai warna lebar 2cm',
    supplier: 'Toko Pita Cantik',
    quantity: 450,
    unit: 'roll',
    price: 12000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400'
  }
]

export const dummyHistory = [
  {
    id: 1,
    transaction_id: '345772',
    item_name: 'Sutra emas cina',
    description: 'pt citra industri asoy geboy',
    quantity: 12,
    unit: 'pcs',
    date: '2025-10-05',
    admin_name: 'Agus kopling',
    admin_id: 1
  },
  {
    id: 2,
    transaction_id: '345773',
    item_name: 'Kain abtik khas jawa',
    description: 'cv aselole hahahehe',
    quantity: 12,
    unit: 'pcs',
    date: '2025-10-05',
    admin_name: 'Agus kopling',
    admin_id: 1
  },
  {
    id: 3,
    transaction_id: '345774',
    item_name: 'HR Department',
    description: 'Talent acquisition, employee welfare',
    quantity: 12,
    unit: 'pcs',
    date: '2025-10-05',
    admin_name: 'Agus kopling',
    admin_id: 1
  },
  {
    id: 4,
    transaction_id: '345775',
    item_name: 'Sales Division',
    description: 'Customer relations, sales strategy',
    quantity: 12,
    unit: 'pcs',
    date: '2025-10-05',
    admin_name: 'Agus kopling',
    admin_id: 1
  },
  {
    id: 5,
    transaction_id: '345776',
    item_name: 'Marketing Team',
    description: 'Digital marketing campaigns',
    quantity: 8,
    unit: 'pcs',
    date: '2025-10-06',
    admin_name: 'Siti Rahman',
    admin_id: 2
  }
]

export const dummyAdmins = [
  {
    id: 177013,
    name: 'Agus Kopling',
    email: 'agus@delova.com',
    role: 'SuperAdmin',
    created_at: '2025-10-05',
    last_login: '2025-10-05'
  },
  {
    id: 177014,
    name: 'Bernadya',
    email: 'bernadya@delova.com',
    role: 'Admin',
    created_at: '2025-10-05',
    last_login: '2025-10-05'
  },
  {
    id: 177015,
    name: 'Mac',
    email: 'mac@delova.com',
    role: 'Admin',
    created_at: '2025-10-05',
    last_login: '2025-10-05'
  }
]