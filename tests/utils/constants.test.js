import { describe, it, expect, beforeEach } from 'vitest';
import { API_BASE_URL, RECAPTCHA_SITE_KEY } from '../../src/utils/constants';

describe('Constants', () => {
  it('should have valid API_BASE_URL from env', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(API_BASE_URL).toBe(import.meta.env.VITE_REACT_APP_API_URL);
    expect(API_BASE_URL).toMatch(/^http[s]?:\/\/.+/); // Should be a valid URL
  });

  it('should have valid RECAPTCHA_SITE_KEY from env', () => {
    expect(RECAPTCHA_SITE_KEY).toBeDefined();
    expect(RECAPTCHA_SITE_KEY).toBe(import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY);
    expect(RECAPTCHA_SITE_KEY.length).toBeGreaterThan(0);
  });

  it('should throw error if environment variables are missing', () => {
    // Save original env values
    const originalAPI = import.meta.env.VITE_REACT_APP_API_URL;
    const originalRecaptcha = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;

    // Simulate missing env variables
    import.meta.env.VITE_REACT_APP_API_URL = undefined;
    import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY = undefined;

    expect(() => require('../../src/utils/constants')).toThrow();

    // Restore env values
    import.meta.env.VITE_REACT_APP_API_URL = originalAPI;
    import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY = originalRecaptcha;
  });
});
