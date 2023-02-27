import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NostrService } from '../../services/nostr.service';

@Component({
  selector: 'app-create-question',
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.scss']
})
export class CreateQuestionComponent {
  newQuestion = {
    title: '',
    question: ''
  };

  constructor(private nostrService: NostrService,
    private router: Router) {}

  onSubmit() {
    this.nostrService.createOrUpdateQuestion(this.newQuestion.title, this.newQuestion.question, '').then(questionId => {
      this.router.navigateByUrl('/question/' + questionId)
    })
  }
}
