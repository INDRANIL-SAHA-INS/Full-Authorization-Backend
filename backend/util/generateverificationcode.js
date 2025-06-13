export function generateVerificationCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
  }
  return code;
}