import { createHash } from 'crypto';
import bigInt from 'big-integer';

export {
  generateDigestBigint,
  toBigInt,
  generateRandomPrime,
  generateRsaParams,
  rsaSign,
};

/**
 * Generates a SHA-256 digest of the input message and returns the hash as a native bigint.
 * @param  message - The input message to be hashed.
 * @returns The SHA-256 hash of the input message as a native bigint.
 */
function generateDigestBigint(message: string) {
  const digest = createHash('sha256').update(message, 'utf8').digest('hex');
  return BigInt('0x' + digest);
}

/**
 * Converts a big-integer object to a native bigint.
 * @param x - The big-integer object to be converted.
 * @returns The big-integer value converted to a native bigint.
 */
function toBigInt(x: bigInt.BigInteger): bigint {
  return BigInt('0x' + x.toString(16));
}

/**
 * Generates a random prime number with the specified bit length.
 * @param bitLength - The desired bit length of the prime number. Default is 1024.
 * @returns A random prime number with the specified bit length.
 */
function generateRandomPrime(bitLength: number): bigint {
  let primeCandidate;
  do {
    // Generate a random number with the desired bit length
    primeCandidate = bigInt.randBetween(
      bigInt(2).pow(bitLength - 1), // Lower bound
      bigInt(2).pow(bitLength).minus(1) // Upper bound
    );

    // Ensure the number is odd
    if (!primeCandidate.isOdd()) {
      primeCandidate = primeCandidate.add(1);
    }
  } while (!primeCandidate.isPrime());

  return toBigInt(primeCandidate);
}

/**
 * Generates RSA parameters including prime numbers, public exponent, and private exponent.
 * @param primeSize - The bit size of the prime numbers used for generating the RSA parameters.
 * @returns An object containing the RSA parameters:
 *                    - p (prime),
 *                    - q (prime),
 *                    - n (modulus),
 *                    - phiN (Euler's totient function),
 *                    - e (public exponent),
 *                    - d (private exponent).
 */
function generateRsaParams(primeSize: number) {
  // Generate two random prime numbers
  const p = generateRandomPrime(primeSize / 2);
  const q = generateRandomPrime(primeSize / 2);

  // Public exponent
  const e = 65537n;

  // Euler's totient function
  const phiN = (p - 1n) * (q - 1n);

  // Private exponent
  const d = toBigInt(bigInt(e).modInv(phiN));

  return { p, q, n: p * q, phiN, e, d };
}

/**
 * Generates an RSA signature for the given message using the private key and modulus.
 * @param message - The message to be signed.
 * @param privateKey - The private exponent used for signing.
 * @param modulus - The modulus used for signing.
 * @returns The RSA signature of the message.
 */
function rsaSign(message: bigint, privateKey: bigint, modulus: bigint): bigint {
  // Calculate the signature using modular exponentiation
  return toBigInt(bigInt(message).modPow(privateKey, modulus));
}
