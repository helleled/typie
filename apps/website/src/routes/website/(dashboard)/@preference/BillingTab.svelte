<script lang="ts">
  import { cache } from '@typie/sark/internal';
  import { css } from '@typie/styled-system/css';
  import { flex } from '@typie/styled-system/patterns';
  import { Button } from '@typie/ui/components';
  import { Dialog } from '@typie/ui/notification';
  import { comma } from '@typie/ui/utils';
  import dayjs from 'dayjs';
  import mixpanel from 'mixpanel-browser';
  import { PlanPair } from '@/const';
  import { PlanInterval, SubscriptionState } from '@/enums';
  import { fragment, graphql } from '$graphql';
  import { SettingsCard, SettingsDivider, SettingsRow } from '$lib/components';
  import RedeemCreditCodeModal from './RedeemCreditCodeModal.svelte';
  import SubscriptionCancellationSurveyModal from './SubscriptionCancellationSurveyModal.svelte';
  import UpdatePaymentMethodModal from './UpdatePaymentMethodModal.svelte';
  import type { DashboardLayout_PreferenceModal_BillingTab_user } from '$graphql';

  type Props = {
    $user: DashboardLayout_PreferenceModal_BillingTab_user;
  };

  let { $user: _user }: Props = $props();

  const user = fragment(
    _user,
    graphql(`
      fragment DashboardLayout_PreferenceModal_BillingTab_user on User {
        id
        credit
        ...DashboardLayout_PreferenceModal_BillingTab_UpdatePaymentMethodModal_user
        ...DashboardLayout_PreferenceModal_BillingTab_SubscriptionCancellationSurveyModal_user

        billingKey {
          id
          name
        }
      }
    `),
  );

  const scheduleSubscriptionCancellation = graphql(`
    mutation DashboardLayout_PreferenceModal_BillingTab_ScheduleSubscriptionCancellation_Mutation {
      scheduleSubscriptionCancellation {
        id
      }
    }
  `);

  const cancelSubscriptionCancellation = graphql(`
    mutation DashboardLayout_PreferenceModal_BillingTab_CancelSubscriptionCancellation_Mutation {
      cancelSubscriptionCancellation {
        id
      }
    }
  `);

  const schedulePlanChange = graphql(`
    mutation DashboardLayout_PreferenceModal_BillingTab_SchedulePlanChange_Mutation($input: SchedulePlanChangeInput!) {
      schedulePlanChange(input: $input) {
        id
      }
    }
  `);

  const cancelPlanChange = graphql(`
    mutation DashboardLayout_PreferenceModal_BillingTab_CancelPlanChange_Mutation {
      cancelPlanChange {
        id
      }
    }
  `);

  const recordSurvey = graphql(`
    mutation DashboardLayout_PreferenceModal_BillingTab_RecordSurvey_Mutation($input: RecordSurveyInput!) {
      recordSurvey(input: $input) {
        id
      }
    }
  `);

  let updatePaymentMethodOpen = $state(false);
  let redeemCreditCodeOpen = $state(false);
  let cancellationSurveyOpen = $state(false);

  async function handleCancellationSurveySubmit(surveyData: unknown) {
    await recordSurvey({
      name: 'subscription_cancellation_202510',
      value: surveyData,
    });

    await scheduleSubscriptionCancellation();

    mixpanel.track('cancel_plan', surveyData as Record<string, unknown>);
  }
</script>

<div class={flex({ direction: 'column', gap: '40px', maxWidth: '640px' })}>
  <!-- Tab Header -->
  <div>
    <h1 class={css({ fontSize: '20px', fontWeight: 'semibold', color: 'text.default' })}>결제</h1>
  </div>

  <!-- Current Plan Section -->
  <!-- <div>
    <h2 class={css({ fontSize: '16px', fontWeight: 'semibold', color: 'text.default', marginBottom: '24px' })}>현재 플랜</h2>

    <SettingsCard>
      <SettingsRow>
        {#snippet label()}
          타이피 BASIC ACCESS
        {/snippet}
        {#snippet description()}
          타이피의 기본 기능을 무료로 이용할 수 있어요.
        {/snippet}
        {#snippet value()}
          <Button onclick={() => (updatePaymentMethodOpen = true)} size="sm" variant="secondary">업그레이드</Button>
        {/snippet}
      </SettingsRow>
    </SettingsCard>
  </div> -->

  <!-- Payment Methods Section -->
  <div>
    <h2 class={css({ fontSize: '16px', fontWeight: 'semibold', color: 'text.default', marginBottom: '24px' })}>결제 수단</h2>

    <SettingsCard>
      <SettingsRow>
        {#snippet label()}
          결제 카드
        {/snippet}
        {#snippet description()}
          {#if $user.billingKey}
            {$user.billingKey.name}
          {:else}
            등록된 카드가 없어요.
          {/if}
        {/snippet}
        {#snippet value()}
          <Button onclick={() => (updatePaymentMethodOpen = true)} size="sm" variant="secondary">
            {$user.billingKey ? '카드 변경' : '카드 등록'}
          </Button>
        {/snippet}
      </SettingsRow>
    </SettingsCard>

    <div class={css({ marginTop: '16px' })}>
      <SettingsCard>
        <SettingsRow>
          {#snippet label()}
            현재 크레딧
          {/snippet}
          {#snippet description()}
            구독료 결제 시 크레딧이 있으면 우선 차감돼요.
          {/snippet}
          {#snippet value()}
            <span>{comma($user.credit)}원</span>
          {/snippet}
        </SettingsRow>

        <SettingsDivider />

        <SettingsRow>
          {#snippet label()}
            할인 코드
          {/snippet}
          {#snippet description()}
            이벤트나 프로모션 코드로 크레딧을 충전해요.
          {/snippet}
          {#snippet value()}
            <Button onclick={() => (redeemCreditCodeOpen = true)} size="sm" variant="secondary">코드 등록</Button>
          {/snippet}
        </SettingsRow>
      </SettingsCard>
    </div>
  </div>

  <!-- {#if $user.subscription?.state === SubscriptionState.ACTIVE || $user.subscription?.state === SubscriptionState.IN_GRACE_PERIOD}
    <div>
      <h2 class={css({ fontSize: '16px', fontWeight: 'semibold', color: 'text.default', marginBottom: '24px' })}>구독 해지</h2>

      <SettingsCard>
        <SettingsRow>
          {#snippet label()}
            구독 해지
          {/snippet}
          {#snippet description()}
            해지 후에도 결제일까지는 유료 기능을 계속 사용할 수 있어요.
          {/snippet}
          {#snippet value()}
            <Button
              onclick={() => {
                cancellationSurveyOpen = true;
              }}
              size="sm"
              variant="ghost"
            >
              해지하기
            </Button>
          {/snippet}
        </SettingsRow>
      </SettingsCard>
    </div>
  {/if} -->
</div>

<UpdatePaymentMethodModal {$user} bind:open={updatePaymentMethodOpen} />
<RedeemCreditCodeModal bind:open={redeemCreditCodeOpen} />
<SubscriptionCancellationSurveyModal {$user} onSubmit={handleCancellationSurveySubmit} bind:open={cancellationSurveyOpen} />
