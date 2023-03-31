import { LightningService } from './lightning.service';
import { NostrService } from './nostr.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { KeyManagementService } from './key.service';

describe('LightningService', () => {
  let service: LightningService;
  let nostrService: NostrService;
  let http: HttpClient;
  let domSanitizer: DomSanitizer;
  let keyManagementService: KeyManagementService;

  beforeEach(() => {
    nostrService = new NostrService(keyManagementService);
    http = jest.fn() as any;
    domSanitizer = jest.fn() as any;
    service = new LightningService(nostrService, http, domSanitizer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a Zap invoice', async () => {
    // const answer = { profile: { lud16: 'user@example.com' } };
    const answer = {
      id: 'answerId',
      pubkey: 'pubKey',
      profile: { id: '', pubkey: '', lud16: 'username@domain.com' },
      message: '',
      vote: 0
    };
    const amountSat = 100;
    const payRequestResponse = { callback: 'https://example.com/callback', allowsNostr: false };
    const invoiceResponse = { pr: 'lnbc12345' };
    const zapRequest = 'zap12345';
    const getUsernameAndDomainSpy = jest.spyOn(service as any, 'getUsernameAndDomain').mockReturnValue(['user', 'example.com']);
    const firstValueFromSpy = jest.spyOn(service as any, 'firstValueFrom').mockReturnValueOnce(of(payRequestResponse)).mockReturnValueOnce(of(invoiceResponse));
    const getZapRequestSpy = jest.spyOn(nostrService, 'getZapRequest').mockReturnValueOnce(zapRequest);
    const result = await service.generateZapInvoice(answer, amountSat);
    expect(getUsernameAndDomainSpy).toHaveBeenCalledWith(answer.profile);
    expect(firstValueFromSpy).toHaveBeenCalledTimes(2);
    expect(firstValueFromSpy).toHaveBeenCalledWith(http.get(payRequestResponse.callback));
    expect(firstValueFromSpy).toHaveBeenCalledWith(http.get(`${payRequestResponse.callback}?amount=${amountSat * 1000}&nostr=${zapRequest}`));
    expect(getZapRequestSpy).toHaveBeenCalledWith(answer.id, answer.pubkey, amountSat * 1000);
    expect(result).toEqual(invoiceResponse.pr);
  });

  // it('should return empty string if answer has no profile', async () => {
  //   const answer = {};
  //   const amountSat = 100;
  //   const result = await service.generateZapInvoice(answer, amountSat);
  //   expect(result).toEqual('');
  // });

  // it('should return empty string if answer profile has no payment request URL', async () => {
  //   const answer = { profile: {} };
  //   const amountSat = 100;
  //   const result = await service.generateZapInvoice(answer, amountSat);
  //   expect(result).toEqual('');
  // });

  // it('should generate a callback URL', () => {
  //   const payRequestResponse = { callback: 'https://example.com/callback', allowsNostr: false };
  //   const answer = { id: '12345', pubkey: 'abcdef' };
  //   const amountMSat = 100000;
});
   
