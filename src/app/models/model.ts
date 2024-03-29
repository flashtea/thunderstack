
export class Event {
    id: string;
    tags?: string[][];
    pubkey: string;
}

export class Question extends Event {
    title: string;
    message: string;
    picture?: string;
}

export class Answer extends Event {
    message: string;
    vote: number;

    zaps?: number;
    profile?: Profile;
}

export class Comment extends Event {
    message: string;
}

export class Zap {
    answer?: Answer;
    amount: number;
    invoiceCode?: string;
}

export class Profile extends Event {
    name?: string;
    about?: string;
    picture?: string;
    nip05?: string;
    lud06?: string;
    lud16?: string;
}


export class PayRequestResponse {
    status: string;
    tag: string;
    commentAllowed: number;
    callback: string;
    metadata: string;
    minSendable: number;
    maxSendable: number;
    payerData: PayerData;
    nostrPubkey: string;
    allowsNostr: boolean;
  }
  
  export class PayerData {
    name: PayerDataItem;
    email: PayerDataItem;
  }
  
  export class PayerDataItem {
    mandatory: boolean;
  }

  export interface InvoiceResponseObject {
    pr: string;
    status: string;
    verify: string;
    // successAction: SuccessAction;
    // routes: any[];
  }

  export class Relay {
    name: string;
    url: string;
  
    constructor(name: string, url: string) {
      this.name = name;
      this.url = url;
    }
  }
  
  