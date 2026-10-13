export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return false;
  }

  return true;
}

export function validateSignup(name, email, password) {
  return (
    name &&
    name.trim() !== '' &&
    validateEmail(email) &&
    validatePassword(password)
  );
}

export function validateLogin(email, password) {
  return (
    validateEmail(email) &&
    password &&
    password.trim() !== ''
  );
}