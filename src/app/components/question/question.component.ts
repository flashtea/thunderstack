import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faBolt, faChevronDown, faChevronLeft, faChevronUp, faCopy } from '@fortawesome/free-solid-svg-icons';
import { Answer, Question, Zap } from '../../models/model';
import { LightningService } from '../../services/lightning.service';
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
  faCopy = faCopy;

  questionId: string;
  question: Question;
  answers: Answer[] = [];
  answer: string = "";

  zap: Zap = {
    answer: undefined,
    amount: 100,
    invoiceCode: undefined
  }

  dialogMessage?: string;

  @ViewChild('lightningLink') 
  lightningLink!: ElementRef<HTMLAnchorElement>;

  constructor(private route: ActivatedRoute,
    private nostrService: NostrService,
    private lightningService: LightningService) { }

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

  async downvoteAnswer(answer: Answer, pubkey: string) {
    this.nostrService.vote(answer.id, pubkey, 'down').then(() => this.updateVotesForAnswer(answer));
  }

  async upvoteAnswer(answer: Answer, pubkey: string) {
    this.nostrService.vote(answer.id, pubkey, 'up').then(() => this.updateVotesForAnswer(answer));
  }

  async sendZap(answer: Answer, amount: number) {
    this.zap.invoiceCode = await this.lightningService.generateZapInvoice(answer, amount)
    this.triggerPaymentLink(this.zap.invoiceCode);

    this.nostrService.waitForZap(answer.id, this.zap.invoiceCode).then(() => {
      this.zap.answer = undefined
      this.zap.invoiceCode = undefined
      this.updateZapsForAnswer(answer)
    })
  }

  private triggerPaymentLink(invoiceCode: string) {
    const lightningLink = "lightning:" + invoiceCode;
    this.lightningLink.nativeElement.href = lightningLink ;
    this.lightningLink.nativeElement.click();
  }

  toggleZapDialog(answer: Answer) {
    if (this.zap.answer === answer) {
      this.zap.answer = undefined
    } else {
      this.zap.answer = answer
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.dialogMessage = "Copied Invoice to Clipboard!";
      setTimeout(() => {
        this.dialogMessage = undefined;
      }, 3000);
    });
  }

  private async listAnswers() {
    this.answers = await this.nostrService.listAnswers(this.questionId)
    for (let answer of this.answers) {
      this.updateProfileForAnswer(answer);
      this.updateVotesForAnswer(answer);
      this.updateZapsForAnswer(answer);
    }
    this.answers.sort((a, b) => b.vote - a.vote)
  }

  private updateProfileForAnswer(answer: Answer) {
    this.nostrService.getProfile(answer.pubkey).then(res => answer.profile = res);
  }

  private updateVotesForAnswer(answer: Answer) {
    this.nostrService.getVoteResult(answer.id).then(res => answer.vote = res);
  }

  private updateZapsForAnswer(answer: Answer) {
    this.nostrService.getZaps(answer.id).then(res => answer.zaps = res);
  }

}