const crypto = require('crypto');

// Function to generate a 32-byte key from a passphrase and a random 16-byte salt
function generateKeyFromPassphrase(passphrase, salt) {
    return crypto.pbkdf2Sync(passphrase, salt, 10000, 32, 'sha256');
}

// Function to generate a random IV
function generateRandomIV() {
    return crypto.randomBytes(16);
}

exports.encrypt = (subject, content) => {
    const ivData = generateRandomIV(); // Generate a random IV for data
    const salt = crypto.randomBytes(16); // Generate a random 16-byte salt
    const encryptionKey = generateKeyFromPassphrase('TEK-UP', salt);

    // Encrypt the subject using the derived key and random IV
    const cipherSubject = crypto.createCipheriv('aes-256-cbc', encryptionKey, ivData);
    let encryptedSubject = cipherSubject.update(subject, 'utf-8', 'hex');
    encryptedSubject += cipherSubject.final('hex');

    // Encrypt the content using the derived key and random IV
    const cipherContent = crypto.createCipheriv('aes-256-cbc', encryptionKey, ivData);
    let encryptedContent = cipherContent.update(content, 'utf-8', 'hex');
    encryptedContent += cipherContent.final('hex');

    return {
        subject: encryptedSubject,
        content: encryptedContent,
        ivData: ivData.toString('hex'),
        salt: salt.toString('hex') // Include the salt in the output
    };
}

exports.decrypt = (encryptedData) => {
    const ivData = Buffer.from(encryptedData.ivData, 'hex');
    const salt = Buffer.from(encryptedData.salt, 'hex'); // Retrieve the salt from the input
    const encryptedSubject = encryptedData.subject;
    const encryptedContent = encryptedData.content;
    const decryptionKey = generateKeyFromPassphrase('TEK-UP', salt);

    // Decrypt the subject using the derived key and IV
    const decipherSubject = crypto.createDecipheriv('aes-256-cbc', decryptionKey, ivData);
    let decryptedSubject = decipherSubject.update(encryptedSubject, 'hex', 'utf-8');
    decryptedSubject += decipherSubject.final('utf-8');

    // Decrypt the content using the derived key and IV
    const decipherContent = crypto.createDecipheriv('aes-256-cbc', decryptionKey, ivData);
    let decryptedContent = decipherContent.update(encryptedContent, 'hex', 'utf-8');
    decryptedContent += decipherContent.final('utf-8');

    return {
        subject: decryptedSubject,
        content: decryptedContent
    };
}
