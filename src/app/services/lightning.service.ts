import { Injectable } from '@angular/core';
import { decodelnurl, getDomain } from 'js-lnurl';
import { Answer, PayRequestResponse } from '../models/model';
import { NostrService } from './nostr.service';

@Injectable({
  providedIn: 'root'
})
export class LightningService {

  constructor(private nostrService: NostrService) { }

  async generateZapInvoice(answer: Answer, amountMSat: number): Promise<string> {
    const amountSat = amountMSat * 1000;
  
    const [username, domain] = this.getUsernameAndDomain(answer.profile);
  
    const url = `https://${domain}/.well-known/lnurlp/${username}`
    const res: PayRequestResponse = await fetch(url).then(r => r.json())
  
    const zapRequest = this.nostrService.getZapRequest(answer.id, answer.pubkey, amountSat)
  
    const callbackUrl = `${res.callback}?amount=${amountSat}&nostr=${zapRequest}`
    const response = await fetch(callbackUrl);
    const invoice = await response.json();
  
    return invoice.pr;
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

}
