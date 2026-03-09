import { describe, expect, it } from 'vitest';
import {
  validateBusinessSubmission,
  validateLoginInput,
  validateRegisterInput,
} from './forms';

describe('validateLoginInput', () => {
  it('accepts a valid email and password', () => {
    const result = validateLoginInput({
      email: 'USER@example.com',
      password: 'supersecret123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  it('rejects an invalid email', () => {
    const result = validateLoginInput({
      email: 'bad-email',
      password: 'supersecret123',
    });

    expect(result.success).toBe(false);
  });
});

describe('validateRegisterInput', () => {
  it('accepts allowed roles', () => {
    const result = validateRegisterInput({
      nombre: 'William',
      email: 'test@example.com',
      password: 'Password123',
      rol: 'business',
    });

    expect(result.success).toBe(true);
  });

  it('rejects admin as self-selected role', () => {
    const result = validateRegisterInput({
      nombre: 'William',
      email: 'test@example.com',
      password: 'Password123',
      rol: 'admin',
    });

    expect(result.success).toBe(false);
  });
});

describe('validateBusinessSubmission', () => {
  it('accepts a valid business payload', () => {
    const result = validateBusinessSubmission({
      nombre: 'Cafe Boricua',
      descripcion: 'Cafe artesanal en el casco urbano.',
      municipio: 'San Juan',
      addressText: 'Calle Fortaleza 123',
      telefono: '(787) 555-1212',
      whatsapp: '7875551212',
      instagram: '@cafeboricua',
      website: 'https://cafeboricua.com',
      categorias: ['restaurante', 'cafetería'],
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid categories', () => {
    const result = validateBusinessSubmission({
      nombre: 'Cafe Boricua',
      municipio: 'San Juan',
      categorias: ['No existe'],
    });

    expect(result.success).toBe(false);
  });
});
