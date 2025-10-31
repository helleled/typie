import { describe, it, expect, beforeAll, spyOn } from 'bun:test';
import { env } from '@/env';
import * as aws from '@/external/aws';
import * as iframely from '@/external/iframely';
import * as portone from '@/external/portone';
import * as slack from '@/external/slack';
import * as spellcheck from '@/external/spellcheck';
import { sendEmail } from '@/email';
import { apple, google, kakao, naver } from '@/external/sso';
import { render } from '@react-email/components';
import type { React.ReactElement } from 'react';

// Save original env to restore later
const originalOfflineMode = env.OFFLINE_MODE;

describe('Offline Mode External Services', () => {
  beforeAll(() => {
    // Force offline mode for testing
    (env as any).OFFLINE_MODE = true;
  });

  it('should stub AWS services', () => {
    expect(aws.ses).toBeNull();
    expect(aws.costExplorer).toBeNull();
    expect(aws.createFragmentedS3ObjectKey()).toBe('offline-mode-stub-key');
  });

  it('should stub email sending', async () => {
    const consoleSpy = spyOn(console, 'log');
    
    await sendEmail({
      subject: 'Test Subject',
      recipient: 'test@example.com',
      body: <div>Test Body</div> as React.ReactElement,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Email Outbox]',
      expect.stringContaining('Test Subject')
    );
  });

  it('should stub Slack notifications', async () => {
    const consoleSpy = spyOn(console, 'log');
    
    await slack.sendMessage({
      channel: '#test',
      message: 'Test message',
      username: 'TestBot',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Slack Offline]',
      expect.stringContaining('Test message')
    );
  });

  it('should stub spell checking', async () => {
    const consoleSpy = spyOn(console, 'log');
    
    const result = await spellcheck.check('테스트 문장입니다.');
    
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Spellcheck Offline]',
      'Skipping check for text of length:',
      9
    );
  });

  it('should stub Iframely unfurling', async () => {
    await expect(iframely.unfurl('https://example.com')).rejects.toThrow(
      'Link embedding is unavailable in offline mode'
    );
  });

  it('should stub PortOne payments', async () => {
    const result = await portone.issueBillingKey({
      customerId: 'test-customer',
      cardNumber: '4111111111111111',
      expiryYear: '25',
      expiryMonth: '12',
      birthOrBusinessRegistrationNumber: '900101',
      passwordTwoDigits: '12',
    });

    expect(result).toEqual({
      status: 'failed',
      code: 'Error',
      message: 'Payment processing is unavailable in offline mode',
    });
  });

  it('should stub SSO services', async () => {
    // Test Apple SSO
    await expect(apple.authorizeUser({ code: 'test-code' })).rejects.toThrow(
      'Apple Sign-In is unavailable in offline mode'
    );

    // Test Google SSO
    await expect(google.authorizeUser({ code: 'test-code' })).rejects.toThrow(
      'Google Sign-In is unavailable in offline mode'
    );

    // Test Kakao SSO
    await expect(kakao.authorizeUser({ code: 'test-code' })).rejects.toThrow(
      'Kakao Sign-In is unavailable in offline mode'
    );

    // Test Naver SSO
    await expect(naver.authorizeUser({ code: 'test-code' })).rejects.toThrow(
      'Naver Sign-In is unavailable in offline mode'
    );
  });

  it('should stub SSO authorization URL generation', () => {
    expect(() => google.generateAuthorizationUrl('test-state')).toThrow(
      'Google Sign-In is unavailable in offline mode'
    );

    expect(() => kakao.generateAuthorizationUrl('test-state')).toThrow(
      'Kakao Sign-In is unavailable in offline mode'
    );

    expect(() => naver.generateAuthorizationUrl('test-state')).toThrow(
      'Naver Sign-In is unavailable in offline mode'
    );

    expect(() => apple.generateAuthorizationUrl()).toThrow(
      'Apple Sign-In is unavailable in offline mode'
    );
  });
});