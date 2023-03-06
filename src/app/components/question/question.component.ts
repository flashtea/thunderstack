import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { faBolt, faChevronDown, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Answer, PayRequestResponse, Question, Tip } from '../../models/model';
import { NostrService } from '../../services/nostr.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit {

  faChevronLeft = faChevronLeft;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faBolt = faBolt;

  questionId: string;
  question: Question;
  answers: Answer[] = [];
  answer: string = "";

  tip: Tip = {
    answer: undefined,
    amount: 100,
    invoiceCode: undefined
  }

  constructor(private route: ActivatedRoute,
    private nostrService: NostrService,
    private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.questionId = params['id']
      this.nostrService.isConnected().subscribe(connected => {
        if (connected) {
          this.nostrService.getQuestion(this.questionId).then(question => {
            this.question = question
          })
          this.listAnswers()
        }
      })
    })
  }

  createAnswer() {
    this.nostrService.createAnswer(this.questionId, this.answer).then(() => {
      this.answer = ''
      this.listAnswers()
    })
  }

  async sendZap(answer: Answer, amountMSat: number): Promise<string> {
    const amountSat = amountMSat * 1000;
    if (answer.profile?.lud16) {
      // console.log(decodelnurl(answer.profile.lud06))
      const addressArr = answer.profile.lud16.split('@');

      // Must only have 2 fields (username and domain name)
      if (addressArr.length !== 2) {
        throw new Error('Invalid internet identifier format.');
      }

      const [username, domain] = addressArr;

      // Must only have 2 fields (username and domain name)
      if (addressArr[1].indexOf('.') === -1) {
        throw new Error('Invalid internet identifier format.');
      }

      const url = `https://${domain}/.well-known/lnurlp/${username}`
      const res: PayRequestResponse = await fetch(url).then(r => r.json())

      const zapRequest = this.nostrService.getZapRequest(answer.id, answer.pubkey, amountSat)
      
      const callbackUrl = `${res.callback}?amount=${amountSat}&nostr=${zapRequest}`
      const response = await fetch(callbackUrl);
      const invoice = await response.json();
      console.log(invoice.pr)
      return invoice.pr;
    } else if (answer.profile?.lud06) {
      return answer.profile?.lud06
    }
    return ""; 
  }

  async sendTip(answer: Answer, amount: number) {
    
    this.tip.invoiceCode = await this.sendZap(answer, amount)
    this.nostrService.waitForZap(answer.id, this.tip.invoiceCode).then(() => {
      this.tip.answer = undefined
      this.tip.invoiceCode = undefined
      this.listAnswers()
    })
  }

  getLightningLink(invoice: string) {
    return this.domSanitizer.bypassSecurityTrustUrl("lightning:" + invoice)
  }

  toggleTip(answer: Answer) {
    if (this.tip.answer === answer) {
      this.tip.answer = undefined
    } else {
      this.tip.answer = answer
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  private async listAnswers() {
    this.answers = await this.nostrService.listAnswers(this.questionId)
    for (let answer of this.answers) {
      this.nostrService.getVoteResult(answer.id).then(res => answer.vote = res)
      this.nostrService.getProfile(answer.pubkey).then(res => answer.profile = res)
      this.nostrService.getZaps(answer.id).then(res => answer.zaps = res)
    }
    this.answers.sort((a, b) => b.vote - a.vote)
  }

  downvoteAnswer(answerId: string, pubkey: string) {
    this.nostrService.vote(answerId, pubkey, 'down').then(() => this.listAnswers());
  }

  upvoteAnswer(answerId: string, pubkey: string) {
    this.nostrService.vote(answerId, pubkey, 'up').then(() => this.listAnswers());
  }
}