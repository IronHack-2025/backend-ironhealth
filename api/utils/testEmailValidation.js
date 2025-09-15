import validateEmail from './validateEmail.js';

// Vamos a hacer tests unitarios


console.log(validateEmail('user@example.com')); // true
console.log(validateEmail('invalid-email')); // false
console.log(validateEmail('user.name+tag@example.com')); // true
console.log(validateEmail('user..name+tag@example.com')); // 
