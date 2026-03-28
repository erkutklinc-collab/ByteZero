import { DataSource } from 'typeorm';
import { Department } from './entities/department.entity';
import { User } from './entities/user.entity';
import { CarbonEvent } from './entities/carbon-event.entity';

const EVENT_TYPES = ['email_deleted', 'attachment_removed', 'cache_cleared', 'mailbox_scanned'];

async function seed() {
  const ds = new DataSource({
    type: 'better-sqlite3',
    database: 'db.sqlite',
    entities: [Department, User, CarbonEvent],
    synchronize: true,
  });

  await ds.initialize();

  const deptRepo = ds.getRepository(Department);
  const userRepo = ds.getRepository(User);
  const eventRepo = ds.getRepository(CarbonEvent);

  // Departments
  const deptNames = ['Engineering', 'Marketing', 'HR', 'Sales'];
  const departments = await Promise.all(
    deptNames.map((name) => deptRepo.save(deptRepo.create({ name }))),
  );

  // Users (3-5 per department)
  const users: User[] = [];
  const names = [
    ['Alice', 'Bob', 'Charlie', 'Diana'],
    ['Eve', 'Frank', 'Grace'],
    ['Hank', 'Ivy', 'Jack'],
    ['Karen', 'Leo', 'Mia', 'Noah', 'Olivia'],
  ];

  for (let i = 0; i < departments.length; i++) {
    for (const name of names[i]) {
      const user = await userRepo.save(
        userRepo.create({
          name,
          email: `${name.toLowerCase()}@bytefootprint.com`,
          departmentId: departments[i].id,
        }),
      );
      users.push(user);
    }
  }

  // Carbon events (random spread over last 30 days)
  const now = Date.now();
  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const sizeBytes = Math.floor(Math.random() * 5_000_000) + 10_000;

    let co2Grams = 0;
    if (eventType === 'email_deleted') co2Grams = (sizeBytes / 1_000_000) * 0.2;
    else if (eventType === 'attachment_removed') co2Grams = (sizeBytes / 1_000_000) * 0.5;
    else if (eventType === 'cache_cleared') co2Grams = (sizeBytes / 1_000_000) * 0.1;

    const createdAt = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));

    await eventRepo.save(
      eventRepo.create({
        userId: user.id,
        eventType,
        metadata: { sizeBytes },
        co2Grams: Math.round(co2Grams * 100) / 100,
        createdAt,
      }),
    );
  }

  console.log(`Seeded: ${departments.length} departments, ${users.length} users, 200 events`);
  await ds.destroy();
}

seed().catch(console.error);
