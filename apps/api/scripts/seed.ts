#!/usr/bin/env node

import { logger } from '@typie/lib';
import { PlanId } from '@/const';
import { db, Plans } from '@/db';
import { PlanAvailability, PlanInterval } from '@/enums';
import { sql } from 'drizzle-orm';

const log = logger.getChild('seed');

export async function seedDatabase() {
  log.info('Seeding database...');

  try {
    // Check if plans are already seeded
    const existingPlans = await db.select({ count: sql<number>`count(*)` }).from(Plans).get();
    
    if (existingPlans && existingPlans.count > 0) {
      log.info('Database already seeded, skipping');
      return;
    }

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

    log.info('Database seeding completed successfully');
  } catch (err) {
    log.error('Database seeding failed {*}', { error: err });
    throw err;
  }
}

// Run if called directly
if (import.meta.main) {
  await seedDatabase();
  process.exit(0);
}
