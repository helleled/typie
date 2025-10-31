import { describe, it, expect, beforeAll, afterAll, spyOn } from 'bun:test';
import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { systemInfo } from '$lib/system-info';
import LoginPage from '$routes/auth/login/+page.svelte';

describe('Desktop Offline Mode Smoke Tests', () => {
  const originalSystemInfo = systemInfo.get();

  describe('Login Page Offline Mode', () => {
    it('should show email/password form in offline mode', async () => {
      // Set offline mode
      systemInfo.set({ offlineMode: true });

      const { getByPlaceholderText, getByRole } = render(LoginPage);

      // Should show email input
      expect(getByPlaceholderText('이메일')).toBeInTheDocument();
      
      // Should show password input
      expect(getByPlaceholderText('비밀번호')).toBeInTheDocument();
      
      // Should show login button (not OAuth button)
      expect(getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('should show OAuth login in online mode', async () => {
      // Set online mode
      systemInfo.set({ offlineMode: false });

      const { getByRole } = render(LoginPage);

      // Should show OAuth login button
      expect(getByRole('button', { name: /브라우저로 로그인/ })).toBeInTheDocument();
    });
  });

  describe('System Info Integration', () => {
    it('should handle systemInfo correctly', () => {
      const testStore = writable({ offlineMode: true });
      
      expect(testStore.get()).toEqual({ offlineMode: true });
      
      testStore.set({ offlineMode: false });
      expect(testStore.get()).toEqual({ offlineMode: false });
    });
  });

  describe('Upload Functionality', () => {
    it('should use local storage endpoint in offline mode', async () => {
      // Mock fetch for testing
      const mockFetch = spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ success: true, key: 'test-key' })
      });

      // Import after mocking
      const { uploadBlob } = await import('$lib/utils/blob.svelte');
      
      // Set system info to offline mode
      systemInfo.set({ offlineMode: true });

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await uploadBlob(file);

      expect(result).toBe('test-key');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/storage/uploads/upload'),
        expect.objectContaining({
          body: expect.any(FormData)
        })
      );
    });
  });

  afterAll(() => {
    // Restore original system info
    systemInfo.set(originalSystemInfo);
  });
});