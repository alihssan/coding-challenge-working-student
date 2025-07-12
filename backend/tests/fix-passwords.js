import bcrypt from 'bcryptjs';

const password = 'password123';
const saltRounds = 12;

console.log('Generating correct hash for password:', password);
const correctHash = await bcrypt.hash(password, saltRounds);
console.log('Correct hash:', correctHash);

// Test the hash
const isValid = await bcrypt.compare(password, correctHash);
console.log('Hash validation test:', isValid);

console.log('\nTo fix the database, run this SQL command:');
console.log(`UPDATE users SET password = '${correctHash}' WHERE email IN ('alice@acme.com', 'bob@acme.com', 'carol@globex.com', 'sarah@techcorp.com', 'michael@techcorp.com', 'emily@techcorp.com', 'james@digitalinnovations.com', 'lisa@digitalinnovations.com', 'robert@digitalinnovations.com', 'jennifer@cloudsystems.com', 'daniel@cloudsystems.com', 'amanda@dataflow.com', 'christopher@dataflow.com', 'nicole@securenet.com', 'kevin@securenet.com', 'rachel@mobilefirst.com', 'andrew@mobilefirst.com', 'stephanie@airesearch.com', 'brandon@airesearch.com', 'megan@blockchainventures.com', 'ryan@blockchainventures.com', 'admin@system.com');`); 