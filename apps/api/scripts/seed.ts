#!/usr/bin/env node

// import { logger } from '@typie/lib';

// Simple logger for testing
const logger = {
  getChild: (name: string) => ({
    info: (message: string, data?: any) => console.log(`[${name}] ${message}`, data || ''),
    error: (message: string, data?: any) => console.error(`[${name}] ${message}`, data || ''),
  }),
};
import { PlanId } from '@/const';
import { db, Plans, Users, Images } from '@/db';
import { PlanAvailability, PlanInterval, UserState, UserRole } from '@/enums';
import { sql, eq } from 'drizzle-orm';
import { generateRandomAvatar, persistBlobAsImage } from '@/utils';
import { createSite } from '@/utils/site';

const log = logger.getChild('seed');

export async function seedDatabase() {
  log.info('Seeding database...');

  try {
    // Create default user for local-only mode
    await createDefaultLocalUser();

    // Check if plans are already seeded
    const existingPlans = await db.select({ count: sql<number>`count(*)` }).from(Plans).get();
    
    if (existingPlans && existingPlans.count > 0) {
      log.info('Plans already seeded, skipping plan seeding');
    } else {
      await seedPlans();
    }

    log.info('Database seeding completed successfully');
  } catch (err) {
    log.error('Database seeding failed {*}', { error: err });
    throw err;
  }
}

async function createDefaultLocalUser() {
  log.info('Creating default local user...');
  
  try {
    // Check if default user already exists
    const existingUser = await db
      .select({ id: Users.id })
      .from(Users)
      .where(sql`${Users.email} = 'local@typie.app'`)
      .get();

    if (existingUser) {
      log.info('Default local user already exists');
      return existingUser;
    }

    // Create default user
    const file = await generateRandomAvatar();
    const avatar = await persistBlobAsImage({ file });

    const user = await db.transaction(async (tx) => {
      // Insert user
      const newUser = await tx
        .insert(Users)
        .values({
          email: 'local@typie.app',
          name: 'Local User',
          avatarId: avatar.id,
          role: UserRole.USER,
          state: UserState.ACTIVE,
        })
        .returning({ id: Users.id })
        .then((rows) => rows[0]);

      // Update avatar with user ID
      await tx
        .update(Images)
        .set({ userId: newUser.id })
        .where(eq(Images.id, avatar.id));

      // Create default site
      await createSite({
        userId: newUser.id,
        name: 'Local Site',
        slug: 'local-site',
        tx,
      });

      return newUser;
    });

    log.info('Default local user created successfully');
    return user;
  } catch (err) {
    log.error('Failed to create default local user {*}', { error: err });
    throw err;
  }
}

async function seedPlans() {
  await db.transaction(async (tx) => {
    // Seed plans (insert or ignore if already exists)
    const plans = [
        {
          id: PlanId.FULL_ACCESS_1MONTH_WITH_BILLING_KEY,
          name: '타이피 FULL ACCESS (월간)',
          fee: 4900,
          availability: PlanAvailability.BILLING_KEY,
          interval: PlanInterval.MONTHLY,
          rule: {
            maxTotalCharacterCount: -1,
            maxTotalBlobSize: -1,
          },
        },
        {
          id: PlanId.FULL_ACCESS_1YEAR_WITH_BILLING_KEY,
          name: '타이피 FULL ACCESS (연간)',
          fee: 49_000,
          availability: PlanAvailability.BILLING_KEY,
          interval: PlanInterval.YEARLY,
          rule: {
            maxTotalCharacterCount: -1,
            maxTotalBlobSize: -1,
          },
        },
        {
          id: PlanId.FULL_ACCESS_1MONTH_WITH_IN_APP_PURCHASE,
          name: '타이피 FULL ACCESS (월간)',
          fee: 6900,
          availability: PlanAvailability.IN_APP_PURCHASE,
          interval: PlanInterval.MONTHLY,
          rule: {
            maxTotalCharacterCount: -1,
            maxTotalBlobSize: -1,
          },
        },
        {
          id: PlanId.FULL_ACCESS_1YEAR_WITH_IN_APP_PURCHASE,
          name: '타이피 FULL ACCESS (연간)',
          fee: 69_000,
          availability: PlanAvailability.IN_APP_PURCHASE,
          interval: PlanInterval.YEARLY,
          rule: {
            maxTotalCharacterCount: -1,
            maxTotalBlobSize: -1,
          },
        },
      ];

      for (const plan of plans) {
        await tx
          .insert(Plans)
          .values(plan)
          .onConflictDoNothing()
          .execute();
      }
    });
  }

// Run if called directly
if (import.meta.main) {
  await seedDatabase();
  process.exit(0);
}
