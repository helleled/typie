import { text } from 'drizzle-orm/sqlite-core';
import * as E from '@/enums';

function createSqliteEnum<T extends string>(obj: Record<string, T>) {
  const values = Object.values(obj) as [T, ...T[]];
  return (name: string) => text(name, { enum: values });
}

export const _CreditCodeState = createSqliteEnum(E.CreditCodeState);
export const _EntityAvailability = createSqliteEnum(E.EntityAvailability);
export const _EntityState = createSqliteEnum(E.EntityState);
export const _EntityType = createSqliteEnum(E.EntityType);
export const _EntityVisibility = createSqliteEnum(E.EntityVisibility);
export const _FontState = createSqliteEnum(E.FontState);
export const _FontFamilyState = createSqliteEnum(E.FontFamilyState);
export const _InAppPurchaseStore = createSqliteEnum(E.InAppPurchaseStore);
export const _NoteState = createSqliteEnum(E.NoteState);
export const _PaymentInvoiceState = createSqliteEnum(E.PaymentInvoiceState);
export const _PaymentOutcome = createSqliteEnum(E.PaymentOutcome);
export const _PlanAvailability = createSqliteEnum(E.PlanAvailability);
export const _PlanInterval = createSqliteEnum(E.PlanInterval);
export const _PostContentRating = createSqliteEnum(E.PostContentRating);
export const _PostLayoutMode = createSqliteEnum(E.PostLayoutMode);
export const _PostType = createSqliteEnum(E.PostType);
export const _PreorderPaymentState = createSqliteEnum(E.PreorderPaymentState);
export const _SiteState = createSqliteEnum(E.SiteState);
export const _SingleSignOnProvider = createSqliteEnum(E.SingleSignOnProvider);
export const _SubscriptionState = createSqliteEnum(E.SubscriptionState);
export const _UserRole = createSqliteEnum(E.UserRole);
export const _UserState = createSqliteEnum(E.UserState);
