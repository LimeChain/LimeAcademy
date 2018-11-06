const crypto = require('crypto');
const ecies = require('eth-ecies');
const ethers = require('ethers');

const SYMMETRIC_ALGORITHM = 'aes-256-ctr';
const SYMMETRIC_KEY_SIZE = 32;
const INITIAL_VECTOR_SIZE = 16;
const HASH_ALGORITHM = 'sha1';

class CryptoService {

    /**
     * Generates random 32 bytes symmetric key.
     */
    static generateSymmetricKey() {
        return crypto.randomBytes(SYMMETRIC_KEY_SIZE);
    }

    /**
     * Generates random 16 bytes initialization vector (salt).
     */
    static generateIV() {
        return crypto.randomBytes(INITIAL_VECTOR_SIZE);
    }

    /**
     * Encrypts a content, using a provided symmetric key and initialization vector (salt).
     */
    static encryptFile(content, symmetricKey, iv) {
        let bufferContent = Buffer.from(content);

        let cipher = crypto.createCipheriv(SYMMETRIC_ALGORITHM, symmetricKey, iv);
        let encrypted = Buffer.concat([cipher.update(bufferContent), cipher.final()]);

        return encrypted;
    }

    /**
     * Decrypts an encrypted content, using a provided symmetric key and initialization vector (salt).
     */
    static decryptFile(encryptedContent, symmetricKey, iv) {
        let bufferEncryptedContent = Buffer.from(encryptedContent);

        let decipher = crypto.createDecipheriv(SYMMETRIC_ALGORITHM, symmetricKey, iv);
        let decrypted = Buffer.concat([decipher.update(bufferEncryptedContent), decipher.final()]);

        return decrypted;
    }

    /**
     * Encrypts a symmetric key, using a provided public key.
     */
    static encryptKey(symmetricKey, publicKey) {
        let bufferSymmetricKey = Buffer.from(symmetricKey);

        // removes prefix '0x04' from uncompressed public key before convert to buffer
        let bufferPublicKey = Buffer.from(publicKey.substring(4), 'hex');
        let encryptedSymmetricKey = ecies.encrypt(bufferPublicKey, bufferSymmetricKey);

        return encryptedSymmetricKey;
    }

    /**
     * Decrypts an encrypted symmetric key, using corresponding wallet private key.
     */
    static async decryptKey(encryptedSymmetricKey, walletJSON, walletPassword) {
        let wallet = await ethers.Wallet.fromEncryptedWallet(walletJSON, walletPassword);

        // removes prefix '0x' from private key before convert to buffer
        let bufferPrivateKey = Buffer.from(wallet.privateKey.substring(2), 'hex');
        let bufferEncryptedSymmetricKey = Buffer.from(encryptedSymmetricKey, 'base64');

        let decryptedSymmetricKey = ecies.decrypt(bufferPrivateKey, bufferEncryptedSymmetricKey);

        return decryptedSymmetricKey;
    }

}

module.exports = CryptoService;