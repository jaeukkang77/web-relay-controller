import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_COST = 12;

async function seedUsers(): Promise<void> {
  const adminPasswordHash = await bcrypt.hash('102100**', BCRYPT_COST);

  const admin = await prisma.user.upsert({
    where: { id: 'admin' },
    update: {},
    create: {
      id: 'admin',
      passwordHash: adminPasswordHash,
      role: UserRole.admin,
    },
  });

  console.log(`✓ User seeded: ${admin.id} (${admin.role})`);
}

async function seedRegions(): Promise<void> {
  const regions = [
    { name: '화순군' },
    { name: '무안군' },
  ];

  for (const data of regions) {
    const region = await prisma.region.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
    console.log(`✓ Region seeded: [${region.id}] ${region.name}`);
  }
}

async function seedDevices(): Promise<void> {
  // 지역이 존재할 때만 장치 시딩
  const region1 = await prisma.region.findFirst({ where: { name: '화순군' } });
  const region2 = await prisma.region.findFirst({ where: { name: '무안군' } });

  if (!region1 || !region2) {
    console.warn('⚠ Region not found, skipping device seed');
    return;
  }

  const devices = [
    {
      regionId: region1.id,
      name: '조명 릴레이 1',
      ip: '192.168.1.100',
      port: 4001,
      slaveId: 1,
      address: 1,
    },
    {
      regionId: region1.id,
      name: '조명 릴레이 2',
      ip: '192.168.1.100',
      port: 4001,
      slaveId: 1,
      address: 2,
    },
    {
      regionId: region2.id,
      name: '에어컨 릴레이',
      ip: '192.168.1.101',
      port: 4001,
      slaveId: 1,
      address: 1,
    },
  ];

  for (const data of devices) {
    // ip + address 조합으로 중복 방지 (upsert key 없으므로 createMany + skipDuplicates 대신 조회 후 생성)
    const existing = await prisma.device.findFirst({
      where: { ip: data.ip, address: data.address, regionId: data.regionId },
    });

    if (!existing) {
      const device = await prisma.device.create({ data });
      console.log(`✓ Device seeded: [${device.id}] ${device.name} (${device.ip}:${device.address})`);
    } else {
      console.log(`  Device already exists: [${existing.id}] ${existing.name}`);
    }
  }
}

async function main(): Promise<void> {
  console.log('🌱 Starting seed...\n');

  await seedUsers();
  await seedRegions();
  await seedDevices();

  console.log('\n✅ Seed completed');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
