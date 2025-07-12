import bcrypt from 'bcryptjs';

const storedHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m';
const password = 'password123';

console.log('Testing password verification...');
console.log('Stored hash:', storedHash);
console.log('Password to test:', password);

// Test the password comparison
const isValid = await bcrypt.compare(password, storedHash);
console.log('Password is valid:', isValid);

// Let's also generate a new hash to see if it's different
const newHash = await bcrypt.hash(password, 12);
console.log('New hash for same password:', newHash);

// Test the new hash
const isNewHashValid = await bcrypt.compare(password, newHash);
console.log('New hash is valid:', isNewHashValid); 