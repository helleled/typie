import { describe, it, expect, beforeAll, afterAll, spyOn } from 'bun:test';
import { env } from '@/env';
import { sendEmail } from '@/email';
import * as spellcheck from '@/external/spellcheck';
import * as portone from '@/external/portone';
import * as iframely from '@/external/iframely';
import { render } from '@react-email/components';
import type { React.ReactElement } from 'react';

// Save original env to restore later
const originalOfflineMode = env.OFFLINE_MODE;

describe('Integration Smoke Tests (Offline Mode)', () => {
  beforeAll(() => {
    // Force offline mode for testing
    (env as any).OFFLINE_MODE = true;
  });

  afterAll(() => {
    // Restore original env
    (env as any).OFFLINE_MODE = originalOfflineMode;
  });

  describe('Password Reset Email Flow', () => {
    it('should handle password reset email without network calls', async () => {
      const consoleSpy = spyOn(console, 'log');
      
      // Simulate password reset email
      await sendEmail({
        subject: '[타이피] 비밀번호를 재설정해 주세요',
        recipient: 'user@example.com',
        body: <div>Reset your password</div> as React.ReactElement,
      });

      expect(consoleSpy.calls.length).toBeGreaterThan(0);
      expect(consoleSpy.calls[0][0]).toBe('[Email Outbox]');
    });
  });

  describe('Spellcheck Flow', () => {
    it('should handle spell checking without network calls', async () => {
      const consoleSpy = spyOn(console, 'log');
      
      const testText = '이것은 테스트 문장입니다. 잘못된 철자가 포함되어 있을 수 있습니다.';
      const errors = await spellcheck.check(testText);

      expect(errors).toEqual([]);
      expect(consoleSpy.calls.length).toBeGreaterThan(0);
      expect(consoleSpy.calls[0][0]).toBe('[Spellcheck Offline]');
    });

    it('should handle empty text gracefully', async () => {
      const errors = await spellcheck.check('');
      expect(errors).toEqual([]);
    });

    it('should handle large text without network calls', async () => {
      const consoleSpy = spyOn(console, 'log');
      
      const largeText = '테스트 '.repeat(1000);
      const errors = await spellcheck.check(largeText);

      expect(errors).toEqual([]);
      expect(consoleSpy.calls[0][0]).toBe('[Spellcheck Offline]');
    });
  });

  describe('Payment Attempt Flow', () => {
    it('should handle billing key issuance without network calls', async () => {
      const result = await portone.issueBillingKey({
        customerId: 'test-customer-123',
        cardNumber: '4111111111111111',
        expiryYear: '25',
        expiryMonth: '12',
        birthOrBusinessRegistrationNumber: '900101',
        passwordTwoDigits: '12',
      });

      expect(result.status).toBe('failed');
      expect(result.message).toContain('unavailable in offline mode');
    });

    it('should handle payment without network calls', async () => {
      const result = await portone.payWithBillingKey({
        paymentId: 'test-payment-123',
        billingKey: 'test-billing-key',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        orderName: 'Test Order',
        amount: 10000,
      });

      expect(result.status).toBe('failed');
      expect(result.message).toContain('unavailable in offline mode');
    });

    it('should handle billing key deletion without network calls', async () => {
      const result = await portone.deleteBillingKey({
        billingKey: 'test-billing-key',
      });

      expect(result.status).toBe('failed');
      expect(result.message).toContain('unavailable in offline mode');
    });
  });

  describe('Link Embedding Flow', () => {
    it('should handle link unfurling without network calls', async () => {
      await expect(iframely.unfurl('https://example.com')).rejects.toThrow(
        'Link embedding is unavailable in offline mode'
      );
    });

    it('should handle various URL types without network calls', async () => {
      const urls = [
        'https://www.youtube.com/watch?v=test',
        'https://twitter.com/test/status/123',
        'https://example.com/article',
      ];

      for (const url of urls) {
        await expect(iframely.unfurl(url)).rejects.toThrow(
          'Link embedding is unavailable in offline mode'
        );
      }
    });
  });

  describe('No Network Calls Guarantee', () => {
    it('should guarantee no fetch/ky calls are made in offline mode', async () => {
      // Mock global fetch to track calls
      const originalFetch = global.fetch;
      let fetchCalls = 0;
      
      global.fetch = () => {
        fetchCalls++;
        throw new Error('Network call detected!');
      };

      try {
        // Test various operations
        await sendEmail({
          subject: 'Test',
          recipient: 'test@example.com',
          body: <div>Test</div> as React.ReactElement,
        });

        await spellcheck.check('test text');

        await portone.issueBillingKey({
          customerId: 'test',
          cardNumber: '4111111111111111',
          expiryYear: '25',
          expiryMonth: '12',
          birthOrBusinessRegistrationNumber: '900101',
          passwordTwoDigits: '12',
        });

        // Should have made no network calls
        expect(fetchCalls).toBe(0);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});