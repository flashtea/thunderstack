import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faBolt, faChevronDown, faChevronLeft, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Answer, Question, Tip } from '../../models/model';
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
    amount: 100
  }

  constructor(private route: ActivatedRoute,
    private nostrService: NostrService) { }

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

  sendTip(answer: Answer, amount: number) {
    this.tip.answer = undefined;
  }

  toggleTip(answer: Answer) {
    if(this.tip.answer === answer) {
      this.tip.answer = undefined
    } else {
      this.tip.answer = answer
    }
  }

  private async listAnswers() {
    this.answers = await this.nostrService.listAnswers(this.questionId)
    for(let answer of this.answers) {
      if(answer.id) {
        answer.vote = await this.nostrService.getVoteResult(answer.id)
      }
    }
    this.answers.sort((a, b) => b.vote - a.vote)
  }

  tipAnswer(answerId: string) {

  }

  downvoteAnswer(answerId: string, pubkey: string) {
    this.nostrService.vote(answerId, pubkey, 'down').then(() => this.listAnswers());
  }

  upvoteAnswer(answerId: string, pubkey: string) {
    this.nostrService.vote(answerId, pubkey, 'up').then(() => this.listAnswers());
  }


}
