import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { decodelnurl, getDomain } from 'js-lnurl';
import { firstValueFrom } from 'rxjs';
import { Answer, InvoiceResponseObject, PayRequestResponse, Profile } from '../models/model';
import { NostrService } from './nostr.service';

@Injectable({
  providedIn: 'root'
})
export class LightningService {

  constructor(private nostrService: NostrService,
    private http: HttpClient,
    private domSanitizer: DomSanitizer) { }

  async generateZapInvoice(answer: Answer, amountSat: number): Promise<string> {

    if(!answer.profile || (!answer.profile.lud16 && !answer.profile.lud06)) {
      return ''
    }

    const amountMSat = amountSat * 1000;
    const [username, domain] = this.getUsernameAndDomain(answer.profile);
    const lnurl = `https://${domain}/.well-known/lnurlp/${username}`
    const payRequestResponse = await firstValueFrom(this.http.get<PayRequestResponse>(lnurl))

    if(!payRequestResponse) {
      return answer.profile.lud16 || answer.profile.lud06 || '';
    }
  
    let callbackUrl = this.generateCallbackUrl(payRequestResponse, amountMSat, answer);

    const invoiceResponse = await firstValueFrom(this.http.get<InvoiceResponseObject>(callbackUrl))  
    return invoiceResponse.pr;
  }
  
  private generateCallbackUrl(payRequestResponse: PayRequestResponse, amountMSat: number, answer: Answer) {
    let callbackUrl = `${payRequestResponse.callback}?amount=${amountMSat}`;
    if (!payRequestResponse.allowsNostr) {
      const zapRequest = this.nostrService.getZapRequest(answer.id, answer.pubkey, amountMSat);
      callbackUrl += `&nostr=${zapRequest}`;
    }
    return callbackUrl;
  }

  private getUsernameAndDomain(profile: any): [string, string] {
    let username = '';
    let domain = '';
  
    if (profile?.lud16) {
      const addressArr = profile.lud16.split('@');
  
      if (addressArr.length === 2) {
        username = addressArr[0];
        domain = addressArr[1];
      } else {
        throw new Error('Invalid internet identifier format.');
      }
    } else if (profile?.lud06) {
      const lnurl = decodelnurl(profile?.lud06);
      username = this.getUsernameFromLnurl(lnurl);
      domain = getDomain(lnurl);
    } else {
      throw new Error('No payment request URL found in profile.');
    }
  
    if (domain.indexOf('.') === -1) {
      throw new Error('Invalid internet identifier format.');
    }
  
    return [username, domain];
  }
  
  private getUsernameFromLnurl(lnurl: string): string {
    const match = lnurl.match(/\/([^/]+)\.json$/);
    return match ? match[1] : '';
  }

  getSanitizedLightningLink(profile: Profile): SafeUrl {
    if(!profile.lud16 && !profile.lud06) return ''

    let link = 'lightning:' + (profile.lud06 || profile.lud06)
    return this.domSanitizer.bypassSecurityTrustUrl(link)
  }

}
