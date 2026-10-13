import { validateSignup } from '../lib/validation';

describe('Bommal Foods Signup Unit Testing', () => {

  test('should accept valid signup details', () => {
    const result = validateSignup(
      'Nivasini',
      'nivasini@gmail.com',
      'password123'
    );

    expect(result).toBe(true);
  });

  test('should reject empty name', () => {
    const result = validateSignup(
      '',
      'nivasini@gmail.com',
      'password123'
    );

    expect(result).toBe(false);
  });

  test('should reject invalid email', () => {
    const result = validateSignup(
      'Nivasini',
      'nivasini@',
      'password123'
    );

    expect(result).toBe(false);
  });

  test('should reject short password', () => {
    const result = validateSignup(
      'Nivasini',
      'nivasini@gmail.com',
      '123'
    );

    expect(result).toBe(false);
  });

});