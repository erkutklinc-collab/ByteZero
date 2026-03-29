import { DataSource } from 'typeorm';
import { Department } from './entities/department.entity';
import { User } from './entities/user.entity';
import { CarbonEvent } from './entities/carbon-event.entity';

const EVENT_TYPES = ['email_deleted', 'attachment_removed', 'cache_cleared', 'mailbox_scanned'];

const DEPT_NAMES = ['Engineering', 'Marketing', 'HR', 'Sales', 'Finance', 'Operations', 'Legal'];

const FIRST_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack',
  'Karen', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tina',
  'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zach', 'Amber', 'Brian', 'Chloe', 'Derek',
  'Elena', 'Felix', 'Gina', 'Hugo', 'Iris', 'James', 'Kira', 'Liam', 'Maya', 'Nate',
  'Olga', 'Peter', 'Rosa', 'Sean', 'Thea', 'Umar', 'Vera', 'Will', 'Ximena', 'Yusuf',
  'Zoe', 'Adrian', 'Bella', 'Carlos', 'Daria', 'Ethan', 'Fiona', 'George', 'Hana', 'Ivan',
  'Julia', 'Kevin', 'Luna', 'Marco', 'Nora', 'Oscar', 'Priya', 'Ravi', 'Sonia', 'Tom',
  'Ursula', 'Violet', 'Wayne', 'Xenia', 'Yasmin', 'Zara', 'Anton', 'Bianca', 'Craig', 'Dana',
  'Emil', 'Flora', 'Grant', 'Helen', 'Igor', 'Jana', 'Kurt', 'Lisa', 'Milan', 'Nina',
  'Otto', 'Paula', 'Rene', 'Stella', 'Troy', 'Ulrich', 'Vanda', 'Wyatt', 'Yael', 'Zeke',
];

const CO2_FACTORS: Record<string, (size: number) => number> = {
  email_deleted: (s) => (s / 1_000_000) * 0.5,
  attachment_removed: (s) => (s / 1_000_000) * 1,
  cache_cleared: (s) => (s / 1_000_000) * 0.2,
  mailbox_scanned: () => 0,
};

export async function seedDatabase(ds: DataSource) {
  const deptRepo = ds.getRepository(Department);
  const userRepo = ds.getRepository(User);
  const eventRepo = ds.getRepository(CarbonEvent);

  // Clear existing data and reset auto-increment
  await eventRepo.clear();
  await userRepo.clear();
  await deptRepo.clear();
  await ds.query("DELETE FROM sqlite_sequence");

  // Departments
  const departments = await Promise.all(
    DEPT_NAMES.map((name) => deptRepo.save(deptRepo.create({ name }))),
  );

  // Realistic headcount per department (~100 total)
  const deptHeadcount: Record<string, number> = {
    Engineering: 30,
    Sales: 20,
    Marketing: 15,
    Operations: 8,
    Finance: 6,
    HR: 7,
    Legal: 4,
  };

  const users: User[] = [];
  let nameIdx = 0;
  for (const dept of departments) {
    const count = deptHeadcount[dept.name] ?? 5;
    for (let j = 0; j < count && nameIdx < FIRST_NAMES.length; j++) {
      const name = FIRST_NAMES[nameIdx];
      const user = await userRepo.save(
        userRepo.create({
          name,
          email: `${name.toLowerCase()}${nameIdx}@bytefootprint.com`,
          departmentId: dept.id,
        }),
      );
      users.push(user);
      nameIdx++;
    }
  }

  // Weekly summary events per user over 4 weeks (targets ~800kg total CO2)
  // Each event represents a week's worth of deletions/cleanups for one user
  const WEEKS = 4;
  const now = Date.now();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const events: Partial<CarbonEvent>[] = [];

  // Department size multipliers (Sales handles lots of contracts, Operations is leaner)
  const deptSizeMultiplier: Record<string, number> = {
    Sales: 1.4,
    Operations: 0.6,
  };
  const userDeptName = new Map(users.map(u => [u.id, departments.find(d => d.id === u.departmentId)!.name]));

  for (const user of users) {
    const multiplier = deptSizeMultiplier[userDeptName.get(user.id)!] ?? 1;
    for (let week = 0; week < WEEKS; week++) {
      // Each user gets one event per type per week
      for (const eventType of EVENT_TYPES) {
        // 500MB–2GB base, scaled by department multiplier
        const baseSizeBytes = Math.floor(Math.random() * 1_500_000_000) + 500_000_000;
        const sizeBytes = Math.round(baseSizeBytes * multiplier);
        const co2Grams = Math.round(CO2_FACTORS[eventType](sizeBytes) * 100) / 100;
        // Spread within the week with some randomness
        const weekStart = now - (WEEKS - week) * WEEK_MS;
        const createdAt = new Date(weekStart + Math.floor(Math.random() * WEEK_MS));

        events.push({ userId: user.id, eventType, metadata: { sizeBytes }, co2Grams, createdAt });
      }
    }
  }

  // Add ~20 recent individual events in the last 24 hours for the activity feed
  const recentActions = ['email_deleted', 'attachment_removed', 'cache_cleared'];
  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const eventType = recentActions[Math.floor(Math.random() * recentActions.length)];
    const multiplier = deptSizeMultiplier[userDeptName.get(user.id)!] ?? 1;
    const sizeBytes = Math.round((Math.floor(Math.random() * 50_000_000) + 5_000_000) * multiplier);
    const co2Grams = Math.round(CO2_FACTORS[eventType](sizeBytes) * 100) / 100;
    const createdAt = new Date(now - Math.floor(Math.random() * 24 * 60 * 60 * 1000));

    events.push({ userId: user.id, eventType, metadata: { sizeBytes }, co2Grams, createdAt });
  }

  // Batch insert
  for (let i = 0; i < events.length; i += 500) {
    await eventRepo.insert(events.slice(i, i + 500));
  }

  return { departments: departments.length, users: users.length, events: events.length };
}

// Run directly via `npm run seed`
if (require.main === module) {
  const ds = new DataSource({
    type: 'better-sqlite3',
    database: 'db.sqlite',
    entities: [Department, User, CarbonEvent],
    synchronize: true,
  });

  ds.initialize()
    .then((ds) => seedDatabase(ds))
    .then((result) => {
      console.log(`Seeded: ${result.departments} departments, ${result.users} users, ${result.events} events`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
