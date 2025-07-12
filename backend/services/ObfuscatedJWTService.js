import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class ObfuscatedJWTService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';
    this.obfuscationKey = process.env.JWT_OBFUSCATION_KEY || 'obfuscation-key-123';
  }

  /**
   * Simple obfuscation using XOR cipher
   */
  obfuscate(data) {
    const text = JSON.stringify(data);
    const key = this.obfuscationKey;
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return Buffer.from(result).toString('base64');
  }

  /**
   * Deobfuscate data
   */
  deobfuscate(obfuscatedData) {
    const key = this.obfuscationKey;
    const decoded = Buffer.from(obfuscatedData, 'base64').toString();
    let result = '';
    
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return JSON.parse(result);
  }

  /**
   * Generate obfuscated JWT token
   */
  generateToken(user) {
    // Create minimal payload with obfuscated data
    const userData = {
      uid: user.id,
      em: user.email,
      org: user.organisationId,
      rl: user.role,
      ts: Date.now()
    };

    // Obfuscate the user data
    const obfuscatedData = this.obfuscate(userData);

    // Create JWT with obfuscated payload
    const payload = {
      data: obfuscatedData,
      v: '1', // version
      t: Math.floor(Date.now() / 1000) // timestamp
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      algorithm: 'HS256'
    });
  }

  /**
   * Verify and deobfuscate JWT token
   */
  verifyToken(token) {
    try {
      // Verify JWT signature
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256']
      });

      // Deobfuscate the data
      const userData = this.deobfuscate(decoded.data);

      // Return clean user data
      return {
        userId: userData.uid,
        email: userData.em,
        organisationId: userData.org,
        role: userData.rl,
        timestamp: userData.ts
      };

    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate a completely obfuscated token (alternative approach)
   */
  generateFullyObfuscatedToken(user) {
    // Create a hash of user data instead of storing it directly
    const userHash = crypto.createHash('sha256')
      .update(`${user.id}-${user.email}-${user.organisationId}-${user.role}`)
      .digest('hex');

    // Create minimal JWT with just the hash
    const payload = {
      h: userHash.substring(0, 16), // truncated hash
      t: Math.floor(Date.now() / 1000),
      s: crypto.randomBytes(8).toString('hex') // salt
    };

    return {
      token: jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
        algorithm: 'HS256'
      }),
      userHash: userHash // return hash for verification
    };
  }

  /**
   * Verify fully obfuscated token (requires user data)
   */
  verifyFullyObfuscatedToken(token, user) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256']
      });

      // Recreate hash from user data
      const expectedHash = crypto.createHash('sha256')
        .update(`${user.id}-${user.email}-${user.organisationId}-${user.role}`)
        .digest('hex');

      // Compare hashes
      if (decoded.h !== expectedHash.substring(0, 16)) {
        throw new Error('Token hash mismatch');
      }

      return {
        userId: user.id,
        email: user.email,
        organisationId: user.organisationId,
        role: user.role,
        timestamp: decoded.t
      };

    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
} 