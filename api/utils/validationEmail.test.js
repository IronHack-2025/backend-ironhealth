import validateEmail from './validateEmail.js';

test('valid email returns true', () => {
  expect(validateEmail('user@example.com')).toBe(true);
});

test('missing @ returns false', () => {
  expect(validateEmail('invalid-email')).toBe(false);
});

test('consecutive dots in local part returns false', () => {
  expect(validateEmail('user..name@example.com')).toBe(false);
});

test('local part starting or ending with dot returns false', () => {
  expect(validateEmail('.user@example.com')).toBe(false);
  expect(validateEmail('user.@example.com')).toBe(false);
});

test('empty string returns false', () => {
  expect(validateEmail('')).toBe(false);
});
