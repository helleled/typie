import dayjs from 'dayjs';
import { and, eq, gt } from 'drizzle-orm';
import { defaultPlanRules } from '@/const';
import { CreditCodes, db, firstOrThrowWith, TableCode, validateDbId } from '@/db';
import { CreditCodeState } from '@/enums';
import { NotFoundError, TypieError } from '@/errors';
import { delay } from '@/utils/promise';
import { redeemCodeSchema } from '@/validation';
import { builder } from '../builder';
import { CreditCode, isTypeOf, PaymentInvoice, Plan, PlanRule, Subscription, UserBillingKey } from '../objects';

CreditCode.implement({
  isTypeOf: isTypeOf(TableCode.CREDIT_CODES),
  fields: (t) => ({
    id: t.exposeID('id'),
    code: t.exposeString('code'),
    amount: t.exposeInt('amount'),
  }),
});

PaymentInvoice.implement({
  isTypeOf: isTypeOf(TableCode.PAYMENT_INVOICES),
  fields: (t) => ({
    id: t.exposeID('id'),
    amount: t.exposeInt('amount'),
    paidAt: t.field({ type: 'DateTime', resolve: (self) => self.paidAt }),
  }),
});

Plan.implement({
  isTypeOf: isTypeOf(TableCode.PLANS),
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    price: t.exposeInt('price'),
  }),
});

Subscription.implement({
  isTypeOf: isTypeOf(TableCode.SUBSCRIPTIONS),
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    planId: t.exposeID('planId'),
  }),
});

PlanRule.implement({
  fields: (t) => ({
    maxTotalCharacterCount: t.int({ resolve: (self) => self.maxTotalCharacterCount ?? defaultPlanRules.maxTotalCharacterCount }),
    maxTotalBlobSize: t.int({ resolve: (self) => self.maxTotalBlobSize ?? defaultPlanRules.maxTotalBlobSize }),
  }),
});

builder.queryFields((t) => ({
  defaultPlanRule: t.field({
    type: PlanRule,
    resolve: async () => {
      return defaultPlanRules;
    },
  }),

  creditCode: t.withAuth({ session: true }).field({
    type: CreditCode,
    args: { code: t.input.string({ validate: { schema: redeemCodeSchema } }) },
    resolve: async (_, args) => {
      const code = args.code.toUpperCase().replaceAll('-', '').replaceAll('O', '0').replaceAll('I', '1').replaceAll('L', '1');

      await delay(Math.random() * 1000);

      return await db
        .select()
        .from(CreditCodes)
        .where(and(eq(CreditCodes.code, code), eq(CreditCodes.state, CreditCodeState.AVAILABLE), gt(CreditCodes.expiresAt, dayjs())))
        .then(firstOrThrowWith(new NotFoundError()));
    },
  }),
}));

builder.mutationFields((t) => ({
  updateBillingKey: t.withAuth({ session: true }).fieldWithInput({
    type: UserBillingKey,
    input: {
      cardNumber: t.input.string(),
      expiryDate: t.input.string(),
      birthOrBusinessRegistrationNumber: t.input.string(),
      passwordTwoDigits: t.input.string(),
    },
    resolve: async () => {
      throw new TypieError({ code: 'payment_features_disabled' });
    },
  }),

  subscribePlanWithBillingKey: t.withAuth({ session: true }).fieldWithInput({
    type: Subscription,
    input: { planId: t.input.id({ validate: validateDbId(TableCode.PLANS) }) },
    resolve: async () => {
      throw new TypieError({ code: 'payment_features_disabled' });
    },
  }),

  schedulePlanChange: t.withAuth({ session: true }).fieldWithInput({
    type: Subscription,
    input: { planId: t.input.id({ validate: validateDbId(TableCode.PLANS) }) },
    resolve: async () => {
      throw new TypieError({ code: 'payment_features_disabled' });
    },
  }),

  cancelPlanChange: t.withAuth({ session: true }).field({
    type: Subscription,
    resolve: async () => {
      throw new TypieError({ code: 'payment_features_disabled' });
    },
  }),

  subscribeOrChangePlanWithInAppPurchase: t.withAuth({ session: true }).fieldWithInput({
    type: Subscription,
    input: {
      store: t.input.string(),
      data: t.input.string(),
    },
    resolve: async () => {
      throw new TypieError({ code: 'payment_features_disabled' });
    },
  }),

  scheduleSubscriptionCancellation: t.withAuth({ session: true }).field({
    type: Subscription,
    resolve: async () => {
      throw new TypieError({ code: 'payment_features_disabled' });
    },
  }),

  cancelSubscriptionCancellation: t.withAuth({ session: true }).field({
    type: Subscription,
    resolve: async () => {
      throw new TypieError({ code: 'payment_features_disabled' });
    },
  }),
}));
