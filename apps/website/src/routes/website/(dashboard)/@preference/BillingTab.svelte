<script lang="ts">
  import { css } from '@typie/styled-system/css';
  import { flex } from '@typie/styled-system/patterns';
  import { Button } from '@typie/ui/components';
  import { comma } from '@typie/ui/utils';
  import { fragment, graphql } from '$graphql';
  import { SettingsCard, SettingsDivider, SettingsRow } from '$lib/components';
  import RedeemCreditCodeModal from './RedeemCreditCodeModal.svelte';
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
      }
    `),
  );

  let redeemCreditCodeOpen = $state(false);
</script>

<div class={flex({ direction: 'column', gap: '40px', maxWidth: '640px' })}>
  <!-- Tab Header -->
  <div>
    <h1 class={css({ fontSize: '20px', fontWeight: 'semibold', color: 'text.default' })}>결제</h1>
  </div>

  <!-- Current Plan Section -->
  <div>
    <h2 class={css({ fontSize: '16px', fontWeight: 'semibold', color: 'text.default', marginBottom: '24px' })}>현재 플랜</h2>

    <SettingsCard>
      <SettingsRow>
        {#snippet label()}
          타이피 BASIC ACCESS
        {/snippet}
        {#snippet description()}
          타이피의 기본 기능을 무료로 이용할 수 있어요.
        {/snippet}
      </SettingsRow>
    </SettingsCard>
  </div>

  <!-- Credits Section -->
  <div>
    <h2 class={css({ fontSize: '16px', fontWeight: 'semibold', color: 'text.default', marginBottom: '24px' })}>크레딧</h2>

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

<RedeemCreditCodeModal bind:open={redeemCreditCodeOpen} />
