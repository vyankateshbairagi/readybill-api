import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ReadyBill database with demo retail data...');

  // 1. Seed Users (Owner, Manager, Cashier)
  const passwordHash = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.upsert({
    where: { mobile: '9999999999' },
    update: {},
    create: {
      name: 'Rajesh Sharma',
      mobile: '9999999999',
      password: passwordHash,
      role: UserRole.OWNER,
    },
  });

  const manager = await prisma.user.upsert({
    where: { mobile: '8888888888' },
    update: {},
    create: {
      name: 'Amit Verma',
      mobile: '8888888888',
      password: passwordHash,
      role: UserRole.MANAGER,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { mobile: '7777777777' },
    update: {},
    create: {
      name: 'Sunita Patel',
      mobile: '7777777777',
      password: passwordHash,
      role: UserRole.CASHIER,
    },
  });

  console.log('✅ Staff users created:');
  console.log('   - Owner: 9999999999 / password123');
  console.log('   - Manager: 8888888888 / password123');
  console.log('   - Cashier: 7777777777 / password123');

  // 2. Seed Sample Products
  const productsData = [
    { name: 'Basmati Rice 5kg', code: 'PRD-RIC-01', price: 450, stock: 45, category: 'Grains & Pulses' },
    { name: 'Sunflower Oil 1L', code: 'PRD-OIL-02', price: 165, stock: 32, category: 'Cooking Oils' },
    { name: 'Whole Wheat Atta 10kg', code: 'PRD-ATT-03', price: 380, stock: 28, category: 'Flours' },
    { name: 'Tata Salt 1kg', code: 'PRD-SLT-04', price: 28, stock: 120, category: 'Spices & Seasonings' },
    { name: 'Toor Dal 1kg', code: 'PRD-DAL-05', price: 155, stock: 8, category: 'Grains & Pulses' }, // Low stock!
    { name: 'Maggi Noodles Pack of 4', code: 'PRD-MAG-06', price: 56, stock: 65, category: 'Snacks & Packaged' },
    { name: 'Amul Butter 500g', code: 'PRD-BUT-07', price: 275, stock: 5, category: 'Dairy & Eggs' }, // Low stock!
    { name: 'Colgate Toothpaste 200g', code: 'PRD-COL-08', price: 110, stock: 40, category: 'Personal Care' },
    { name: 'Surf Excel Detergent 1kg', code: 'PRD-SRF-09', price: 140, stock: 35, category: 'Household & Cleaning' },
    { name: 'Brooke Bond Tea 500g', code: 'PRD-TEA-10', price: 240, stock: 3, category: 'Beverages' }, // Low stock!
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const prod = await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    createdProducts.push(prod);
  }
  console.log(`✅ ${createdProducts.length} retail products seeded.`);

  // 3. Seed Sample Customers
  const customersData = [
    { name: 'Virendra Sehwag', mobile: '9820011223', openingBalance: 0, balance: 1250 },
    { name: 'Pooja Hegde', mobile: '9830022334', openingBalance: 0, balance: 450 },
    { name: 'Rohit Gupta', mobile: '9840033445', openingBalance: 0, balance: 0 },
    { name: 'Deepika Rao', mobile: '9850044556', openingBalance: 0, balance: 2800 },
    { name: 'Sanjay Mehra', mobile: '9860055667', openingBalance: 0, balance: 0 },
  ];

  const createdCustomers: any[] = [];
  for (const c of customersData) {
    let cust = await prisma.customer.findFirst({ where: { mobile: c.mobile } });
    if (!cust) {
      cust = await prisma.customer.create({ data: c });
    }
    createdCustomers.push(cust);
  }
  console.log(`✅ ${createdCustomers.length} customer Khata profiles seeded.`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
