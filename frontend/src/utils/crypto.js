import * as sodium from "libsodium-wrappers-sumo";

// Ensure sodium is initialized before use
const initializeSodium = async () => {
    await sodium.ready;
    return sodium;
};

// Derive a seed from the password
export const deriveSeedFromPassword = async (password, salt) => {
    const sodium = await initializeSodium();

    const opsLimit = sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE;
    const memLimit = sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE;

    return sodium.crypto_pwhash(
        32, // 32-byte seed
        password,
        salt,
        opsLimit,
        memLimit,
        sodium.crypto_pwhash_ALG_DEFAULT
    );
};

// Generate a keypair deterministically from password
export const generateKeypair = async (password, username) => {
    const sodium = await initializeSodium();
    
    // Unique salt per user (use username as salt for now)
    const salt = sodium.crypto_generichash(16, sodium.from_string(username));

    const seed = await deriveSeedFromPassword(password, salt);

    // Generate X25519 keypair for DH key exchange
    const keyPair = sodium.crypto_box_seed_keypair(seed);

    console.log("Key Pair - Public Key: "+sodium.to_hex(keyPair.publicKey));
    console.log("Key Pair - Private Key:", sodium.to_hex(keyPair.privateKey));

    return {
        privateKey: sodium.to_hex(keyPair.privateKey),
        publicKey: sodium.to_hex(keyPair.publicKey)
    };
};

// Diffie-Hellman Key Exchange to Derive Shared Secret
export const deriveSharedKey = async (myPrivateKey, otherUserPublicKey) => {
    const sodium = await initializeSodium();

    console.log("My Private Key:", myPrivateKey);
    console.log("Other User Public Key:", otherUserPublicKey);

    // Convert keys to Uint8Array
    const myPrivateKeyBytes = sodium.from_hex(myPrivateKey);
    const otherUserPublicKeyBytes = sodium.from_hex(otherUserPublicKey);

    // Compute shared secret using Diffie-Hellman (X25519)
    const sharedSecret = sodium.crypto_scalarmult(myPrivateKeyBytes, otherUserPublicKeyBytes);

    // Derive a 32-byte encryption key from shared secret (HKDF-like)
    const encryptionKey = sodium.crypto_generichash(32, sharedSecret);

    console.log("Derived Shared Key:", sodium.to_hex(encryptionKey));
    return encryptionKey;
};

// Encrypt Message
export const encryptMessage = async (sharedKey, message) => {
    const sodium = await initializeSodium();
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    let messageBytes;
    
    if (typeof message === "string") {
        // Convert text to Uint8Array
        messageBytes = sodium.from_string(message);
    } else if (message instanceof Uint8Array) {
        // If it's already a Uint8Array (e.g., file data), use as is
        messageBytes = message;
    } else {
        throw new Error("Unsupported input type for encryption.");
    }

    const ciphertext = sodium.crypto_secretbox_easy(messageBytes, nonce, sharedKey);
    
    return { 
        nonce: sodium.to_hex(nonce), 
        ciphertext: sodium.to_hex(ciphertext),
    };
};


export const decryptMessage = async (sharedKey, nonce, ciphertext) => {
    const sodium = await initializeSodium();
    const decrypted = sodium.crypto_secretbox_open_easy(
        sodium.from_hex(ciphertext),
        sodium.from_hex(nonce),
        sharedKey
    );
    return new TextDecoder().decode(decrypted);
};

const FIXED_SALT_HEX = '00112233445566778899aabbccddeeff'; // 16-byte hex string

export const hashPassword = async (password) => {
  await sodium.ready;

  const passwordBytes = sodium.from_string(password);

  // Use a fixed salt (16 bytes) instead of a random one
  const salt = sodium.from_hex(FIXED_SALT_HEX);

  const hashed = sodium.crypto_pwhash(
    sodium.crypto_pwhash_STRBYTES,       // Output length
    passwordBytes,                       // Password bytes
    salt,                                // Fixed salt
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  return {
    hash: sodium.to_base64(hashed)
  };
}