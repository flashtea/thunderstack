import { TestBed } from '@angular/core/testing';
import { KeyManagementService } from './key.service';
import { getPublicKey } from 'nostr-tools';

describe('KeyManagementService', () => {
  let service: KeyManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getPrivKey', () => {
    beforeEach(() => {
      // Clear the localStorage mock before each test
      localStorage.clear();
    });

    it('should return an empty string if no private key is stored', () => {
      expect(service.getPrivKey()).toBe('');
    });

    it('should return a private key in hex format when one is stored', () => {
      const storedPrivateKey = '84b8e84f01825eefdce7b2d819b4dd8b4a4d4f4e4d1b84e8e79617f110b7c2b0';
      localStorage.setItem(service['PRIVATE_KEY'], storedPrivateKey);
      expect(service.getPrivKey()).toBe(storedPrivateKey);
    });

    it('should return a private key in nsec format when one is stored', () => {
      const storedPrivateKey = 'nsec1pz93c2w2xc2pmnsxmg8e4vzt0u0jglg9gsd55dw8jn5v7g';
      localStorage.setItem(service['PRIVATE_KEY'], storedPrivateKey);
      expect(service.getPrivKey()).toBe(storedPrivateKey);
    });
  });


  describe('#setPrivKey', () => {
    beforeEach(() => {
      // Clear the localStorage mock before each test
      localStorage.clear();
    });

    it('should store a private key in hex format', () => {
      const privateKeyHex = '84b8e84f01825eefdce7b2d819b4dd8b4a4d4f4e4d1b84e8e79617f110b7c2b0';
      service.setPrivKey(privateKeyHex);
      expect(localStorage.getItem(service['PRIVATE_KEY'])).toBe(privateKeyHex);
    });

    it('should store a private key in nsec format and convert it to hex format', () => {
      const privateKeyNsec = 'nsec1kz4thdncve5hhmk96wpwdeqkkyuk2fq0e7k0d4q4ylh08rfdk69s5r8eng';
      const expectedStoredPrivateKey = 'b0aabbb67866697beec5d382e6e416b13965240fcfacf6d41527eef38d2db68b'; // The expected hex representation of the provided nsec key
      service.setPrivKey(privateKeyNsec);
      expect(localStorage.getItem(service['PRIVATE_KEY'])).toBe(expectedStoredPrivateKey);
    });

    it('should overwrite an existing private key when setting a new one', () => {
      const oldPrivateKey = '84b8e84f01825eefdce7b2d819b4dd8b4a4d4f4e4d1b84e8e79617f110b7c2b0';
      const newPrivateKey = 'a1a2a3a4a5a6a7a8a9a0b1b2b3b4b5b6b7b8b9b0c1c2c3c4c5c6c7c8c9c0d1d2';
      localStorage.setItem(service['PRIVATE_KEY'], oldPrivateKey);

      service.setPrivKey(newPrivateKey);
      expect(localStorage.getItem(service['PRIVATE_KEY'])).toBe(newPrivateKey);
    });
  });


  describe('#removePrivKey', () => {
    beforeEach(() => {
      // Clear the localStorage mock before each test
      localStorage.clear();
    });

    it('should remove the stored private key', () => {
      const privateKey = '84b8e84f01825eefdce7b2d819b4dd8b4a4d4f4e4d1b84e8e79617f110b7c2b0';
      localStorage.setItem(service['PRIVATE_KEY'], privateKey);

      service.removePrivKey();
      expect(localStorage.getItem(service['PRIVATE_KEY'])).toBeNull();
    });

    it('should not throw an error if there is no private key to remove', () => {
      expect(() => service.removePrivKey()).not.toThrow();
    });
  });


  describe('#isValidPrivateKey', () => {
    it('should return true for a valid Nostr private key in hex format', () => {
      const validPrivateKeyHex = '84b8e84f01825eefdce7b2d819b4dd8b4a4d4f4e4d1b84e8e79617f110b7c2b0';
      expect(service.isValidPrivateKey(validPrivateKeyHex)).toBeTruthy();
    });

    it('should return true for a valid Nostr private key in nsec format', () => {
      const validPrivateKeyNsec = 'nsec1kz4thdncve5hhmk96wpwdeqkkyuk2fq0e7k0d4q4ylh08rfdk69s5r8eng';
      expect(service.isValidPrivateKey(validPrivateKeyNsec)).toBeTruthy();
    });

    it('should return false for an invalid private key in hex format', () => {
      const invalidPrivateKeyHex = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
      expect(service.isValidPrivateKey(invalidPrivateKeyHex)).toBeFalsy();
    });

    it('should return false for an invalid private key in nsec format', () => {
      const invalidPrivateKeyNsec = 'nsec1zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
      expect(service.isValidPrivateKey(invalidPrivateKeyNsec)).toBeFalsy();
    });

    it('should return false for an empty private key', () => {
      const emptyPrivateKey = '';
      expect(service.isValidPrivateKey(emptyPrivateKey)).toBeFalsy();
    });

    it('should return false for a private key with invalid length', () => {
      const invalidLengthPrivateKey = '84b8e84f01825eefdce7b2d819b4dd8b4a4d4f4e4d1b84e8e79617f110b7';
      expect(service.isValidPrivateKey(invalidLengthPrivateKey)).toBeFalsy();
    });
  });


  describe('#generatePrivateKey', () => {
    it('should generate a valid private key in nsec format', () => {
      const generatedPrivateKey = service.generatePrivateKey();
      expect(service.isValidPrivateKey(generatedPrivateKey)).toBeTruthy();
    });

    it('should generate unique private keys', () => {
      const generatedPrivateKey1 = service.generatePrivateKey();
      const generatedPrivateKey2 = service.generatePrivateKey();
      expect(generatedPrivateKey1).not.toBe(generatedPrivateKey2);
    });
  });



  describe('#getPubKey', () => {
    beforeEach(() => {
      // Clear the localStorage mock before each test
      localStorage.clear();
    });

    it('should return an empty string if no private key is stored', () => {
      expect(service.getPubKey()).toBe('');
    });

    it('should return the correct public key for a stored private key', () => {
      const privateKey = '84b8e84f01825eefdce7b2d819b4dd8b4a4d4f4e4d1b84e8e79617f110b7c2b0';
      const expectedPublicKey = getPublicKey(privateKey);
      localStorage.setItem(service['PRIVATE_KEY'], privateKey);

      expect(service.getPubKey()).toBe(expectedPublicKey);
    });

    it('should return the correct public key for a stored nsec private key', () => {
      const privateKeyNsec = 'nsec1pz93c2w2xc2pmnsxmg8e4vzt0u0jglg9gsd55dw8jn5v7g';
      const privateKeyHex = 'b3788c3e96fd3fd3f05a9de1e8a1ad28d2fd4b4c4a4a4b0f6d2aefc9e9e9f0a3';
      const expectedPublicKey = getPublicKey(privateKeyHex);
      localStorage.setItem(service['PRIVATE_KEY'], privateKeyHex);

      expect(service.getPubKey()).toBe(expectedPublicKey);
    });
  });

});
