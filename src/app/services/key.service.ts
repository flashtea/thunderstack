import { Injectable } from '@angular/core';
import { generatePrivateKey, getPublicKey } from 'nostr-tools';
import * as secp256k1 from '@noble/secp256k1'
import { bech32 } from 'bech32';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class KeyManagementService {
  private PRIVATE_KEY = 'privKey';

  constructor() { }

  getPrivKey(): string {
    return localStorage.getItem(this.PRIVATE_KEY) || '';
  }

  setPrivKey(privKey: string): void {
    if (privKey.startsWith('nsec')) {
      privKey = this.nsecToHex(privKey)
    }

    localStorage.setItem(this.PRIVATE_KEY, privKey);
  }

  removePrivKey(): void {
    localStorage.removeItem(this.PRIVATE_KEY);
  }

  isValidPrivateKey(privKey: string) {
    if (privKey.startsWith('nsec')) {
      privKey = this.nsecToHex(privKey)
    }

    return secp256k1.utils.isValidPrivateKey(privKey)
  }

  generatePrivateKey(): string {
    return this.hexToNsec(generatePrivateKey());
  }

  getPubKey(): string {
    if (this.getPrivKey()) {
      return getPublicKey(this.getPrivKey());
    }
    return '';
  }

  private hexToNsec(hexKey: string) {
    const buf = Buffer.from(hexKey, 'hex');
    const words = bech32.toWords(buf);
    return bech32.encode('nsec', words);
  }

  private nsecToHex(nsecKey: string) {
    try {
      const { prefix, words } = bech32.decode(nsecKey);
      if (prefix !== 'nsec') {
        throw new Error('Invalid nsec-prefix format');
      }
      const buf = Buffer.from(bech32.fromWords(words));
      return buf.toString('hex');
    } catch {
      return ''
    }
  }
}
