import { Component, OnInit } from '@angular/core';
import { Question } from '../../models/model';
import { NostrService } from '../../services/nostr.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  questions: Question[] = [];

  constructor(private nostr: NostrService) { }

  async ngOnInit(): Promise<void> {
    this.nostr.listQuestions().then((questions: Question[]) => {
      this.questions = questions
    });
  }

}
