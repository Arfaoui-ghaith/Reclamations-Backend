const crypto = require('crypto');

// Function to generate a 32-byte key from a passphrase
function generateKeyFromPassphrase(passphrase) {
    const salt = 'GLSI-D'; // Replace with your own salt
    return crypto.pbkdf2Sync(passphrase, salt, 10000, 32, 'sha256');
}

const staticEncryptionKey = generateKeyFromPassphrase('TEK-UP'); // Replace with your own passphrase

// Function to generate a random IV
function generateRandomIV() {
    return crypto.randomBytes(16);
}

exports.encrypt = (subject, content) => {
    const ivData = generateRandomIV(); // Generate a random IV for data

    // Encrypt the subject using the static key and random IV
    const cipherSubject = crypto.createCipheriv('aes-256-cbc', Buffer.from(staticEncryptionKey), ivData);
    let encryptedSubject = cipherSubject.update(subject, 'utf-8', 'hex');
    encryptedSubject += cipherSubject.final('hex');

    // Encrypt the content using the static key and random IV
    const cipherContent = crypto.createCipheriv('aes-256-cbc', Buffer.from(staticEncryptionKey), ivData);
    let encryptedContent = cipherContent.update(content, 'utf-8', 'hex');
    encryptedContent += cipherContent.final('hex');

    return {
        subject: encryptedSubject,
        content: encryptedContent,
        ivData: ivData.toString('hex')
    };
}

exports.decrypt = (encryptedData) => {
    const ivData = Buffer.from(encryptedData.ivData, 'hex');
    const encryptedSubject = encryptedData.subject;
    const encryptedContent = encryptedData.content;

    // Decrypt the subject using the static key and IV
    const decipherSubject = crypto.createDecipheriv('aes-256-cbc', Buffer.from(staticEncryptionKey), ivData);
    let decryptedSubject = decipherSubject.update(encryptedSubject, 'hex', 'utf-8');
    decryptedSubject += decipherSubject.final('utf-8');

    // Decrypt the content using the static key and IV
    const decipherContent = crypto.createDecipheriv('aes-256-cbc', Buffer.from(staticEncryptionKey), ivData);
    let decryptedContent = decipherContent.update(encryptedContent, 'hex', 'utf-8');
    decryptedContent += decipherContent.final('utf-8');

    return {
        subject: decryptedSubject,
        content: decryptedContent
    };
}
