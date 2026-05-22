import { PrismaClient, UserRole, OrderStatus, PaymentStatus, PaymentProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BizOps database...');

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.businessSettings.deleteMany();

  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bizops.local',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@bizops.local',
      passwordHash: await bcrypt.hash('Manager123!', 12),
      firstName: 'Maria',
      lastName: 'Manager',
      role: UserRole.MANAGER,
    },
  });

  await prisma.user.create({
    data: {
      email: 'staff@bizops.local',
      passwordHash: await bcrypt.hash('Staff123!', 12),
      firstName: 'Sam',
      lastName: 'Staff',
      role: UserRole.STAFF,
    },
  });

  await prisma.businessSettings.create({
    data: {
      businessName: 'BizOps Demo Store',
      currency: 'USD',
      taxRate: 0.08,
      lowStockDefault: 10,
    },
  });

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        company: 'Johnson Retail',
        phone: '+1-555-0101',
      },
    }),
    prisma.customer.create({
      data: {
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        company: 'Smith Co',
        phone: '+1-555-0102',
      },
    }),
    prisma.customer.create({
      data: {
        email: 'carol@example.com',
        firstName: 'Carol',
        lastName: 'Davis',
        phone: '+1-555-0103',
      },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'SKU-001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        cost: 12,
        stock: 150,
        lowStockThreshold: 20,
        category: 'Electronics',
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-002',
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub',
        price: 49.99,
        cost: 22,
        stock: 8,
        lowStockThreshold: 15,
        category: 'Electronics',
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-003',
        name: 'Notebook Pack',
        description: 'Pack of 3 notebooks',
        price: 12.99,
        cost: 4,
        stock: 200,
        lowStockThreshold: 25,
        category: 'Stationery',
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-004',
        name: 'Desk Lamp',
        description: 'LED desk lamp',
        price: 39.99,
        cost: 18,
        stock: 5,
        lowStockThreshold: 10,
        category: 'Office',
      },
    }),
  ]);

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-DEMO-001',
      customerId: customers[0].id,
      status: OrderStatus.CONFIRMED,
      subtotal: 79.98,
      tax: 6.4,
      total: 86.38,
      createdById: admin.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            unitPrice: 29.99,
            total: 59.98,
          },
          {
            productId: products[2].id,
            quantity: 1,
            unitPrice: 12.99,
            total: 12.99,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-DEMO-002',
      customerId: customers[1].id,
      status: OrderStatus.PENDING,
      subtotal: 49.99,
      tax: 4,
      total: 53.99,
      createdById: admin.id,
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 1,
            unitPrice: 49.99,
            total: 49.99,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      customerId: customers[0].id,
      amount: 86.38,
      status: PaymentStatus.COMPLETED,
      provider: PaymentProvider.MANUAL,
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      customerId: customers[1].id,
      amount: 53.99,
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.STRIPE,
      providerRef: 'pi_demo_pending',
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        title: 'Welcome to BizOps',
        message: 'Your real-time business platform is ready.',
        type: 'INFO',
      },
      {
        title: 'Low stock: USB-C Hub',
        message: 'USB-C Hub has only 8 units left.',
        type: 'LOW_STOCK',
      },
      {
        title: 'Low stock: Desk Lamp',
        message: 'Desk Lamp has only 5 units left.',
        type: 'LOW_STOCK',
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Demo login: admin@bizops.local / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
