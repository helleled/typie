<script lang="ts">
  import { openUrl } from '@tauri-apps/plugin-opener';
  import { css } from '@typie/styled-system/css';
  import { center, flex } from '@typie/styled-system/patterns';
  import { Button, Form, Icon, Input } from '@typie/ui/components';
  import { serializeOAuthState } from '@typie/ui/utils';
  import qs from 'query-string';
  import GlobeIcon from '~icons/lucide/globe';
  import { goto } from '$app/navigation';
  import Logo from '$assets/logos/logo.svg?component';
  import { PUBLIC_AUTH_URL, PUBLIC_OIDC_CLIENT_ID } from '$env/static/public';
  import { graphql } from '$graphql';
  import { store } from '$lib/store';
  import { systemInfo } from '$lib/system-info';

  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';

  const handleEmailLogin = async () => {
    if (!email || !password) {
      error = '이메일과 비밀번호를 입력해주세요.';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const result = await graphql(
        /* GraphQL */ `
          mutation LoginWithEmail_Mutation($input: LoginWithEmailInput!) {
            loginWithEmail(input: $input)
          }
        `,
        { input: { email, password } },
      );

      // Store tokens locally
      await store.set('access_token', result.loginWithEmail);
      await store.set('refresh_token', result.loginWithEmail);

      // Redirect to main app
      goto('/');
    } catch (err: unknown) {
      error = (err instanceof Error ? err.message : typeof err === 'string' ? err : '로그인에 실패했습니다.') || '로그인에 실패했습니다.';
    } finally {
      isLoading = false;
    }
  };
</script>

<main class={center({ height: 'full' })}>
  <div class={flex({ flexDirection: 'column', gap: '24px', width: '320px' })}>
    <Logo class={css({ height: '40px' })} />

    <p class={css({ fontSize: '15px', textAlign: 'center', lineHeight: '[1.6]' })}>
      <span>작성, 정리, 공유까지.</span>
      <br />
      <span class={css({ fontWeight: 'bold' })}>
        글쓰기의 모든 과정을
        <br />
        타이피 하나로 해결해요.
      </span>
    </p>

    {#if $systemInfo.offlineMode}
      <!-- Email/Password Login Form for Offline Mode -->
      <Form.Root onsubmit={handleEmailLogin}>
        <div class={flex({ flexDirection: 'column', gap: '16px' })}>
          <Form.Field name="email">
            <Input
              disabled={isLoading}
              oninput={(e) => (email = e.currentTarget.value)}
              placeholder="이메일"
              required
              type="email"
              value={email}
            />
          </Form.Field>

          <Form.Field name="password">
            <Input
              disabled={isLoading}
              oninput={(e) => (password = e.currentTarget.value)}
              placeholder="비밀번호"
              required
              type="password"
              value={password}
            />
          </Form.Field>

          {#if error}
            <div class={css({ color: 'red.500', fontSize: '14px', textAlign: 'center' })}>
              {error}
            </div>
          {/if}

          <Button disabled={isLoading} type="submit">
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </div>
      </Form.Root>
    {:else}
      <!-- OAuth Login for Online Mode -->
      <Button
        onclick={async () => {
          const url = qs.stringifyUrl({
            url: `${PUBLIC_AUTH_URL}/authorize`,
            query: {
              client_id: PUBLIC_OIDC_CLIENT_ID,
              response_type: 'code',
              redirect_uri: `${PUBLIC_AUTH_URL}/desktop`,
              state: serializeOAuthState({ redirect_uri: 'typie:///auth/callback' }),
            },
          });

          await openUrl(url);
        }}
      >
        <div class={flex({ alignItems: 'center', gap: '8px' })}>
          <Icon icon={GlobeIcon} />
          <div class={css({ lineHeight: '[1]' })}>브라우저로 로그인</div>
        </div>
      </Button>
    {/if}
  </div>
</main>
