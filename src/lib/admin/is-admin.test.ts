import { describe, expect, it } from 'vitest';
import { hasAdminAccess, isAdminFromAuthMetadata } from './is-admin';

describe('isAdminFromAuthMetadata', () => {
  it('returns true when admin role is present in user metadata', () => {
    expect(isAdminFromAuthMetadata({ user_metadata: { rol: 'admin' } })).toBe(true);
  });

  it('returns true when admin role is present in app metadata', () => {
    expect(isAdminFromAuthMetadata({ app_metadata: { role: 'admin' } })).toBe(true);
  });

  it('returns false when role is not admin', () => {
    expect(isAdminFromAuthMetadata({ user_metadata: { rol: 'user' } })).toBe(false);
  });
});

describe('hasAdminAccess', () => {
  it('always trusts admin profile role', () => {
    expect(hasAdminAccess('admin', null)).toBe(true);
  });

  it('falls back to auth metadata outside production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    expect(hasAdminAccess(null, { user_metadata: { rol: 'admin' } })).toBe(true);

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('does not allow metadata fallback in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    expect(hasAdminAccess(null, { user_metadata: { rol: 'admin' } })).toBe(false);

    process.env.NODE_ENV = originalNodeEnv;
  });
});
