import { Injectable } from '@angular/core';
import { Event, Filter, Relay, relayInit, EventTemplate, finishEvent } from 'nostr-tools';
import { BehaviorSubject, Observable } from 'rxjs';
import { Answer, Question, Comment } from '../models/model';
import { KeyManagementService } from './key.service';

@Injectable({
  providedIn: 'root'
})
export class NostrService {
  private relay: Relay;
  private connected = new BehaviorSubject<boolean>(false);

  private static ZAPSTACK_TAG = "zapstack_test";

  constructor(private keyManagementService: KeyManagementService) {
    this.connectRelay('wss://spore.ws')
  }

  isConnected(): Observable<boolean> {
    return this.connected.asObservable();
  }

  async connectRelay(url: string) {
    await this.connect(url)
  }

  private async connect(url: string) {
    if (this.relay) {
      await this.relay.close()
    }

    this.relay = relayInit(url)

    this.relay.on('connect', () => {
      console.log('Connected to relay at', url)
      this.connected.next(true);
    })

    this.relay.on('disconnect', () => {
      console.log('Disconnected from relay at', url)
      this.connected.next(false);
    })

    this.relay.on('error', (reason: any) => {
      console.log('Error connecting to relay at', url)
      console.log(reason)
      this.connected.next(false);
    })

    await this.relay.connect();
  }

  createOrUpdateQuestion(name: string, about: string, picture: string, questionId?: string): Promise<string> {
    const content = {
      name,
      about,
      picture
    }

    const event: EventTemplate = {
      kind: questionId ? 41 : 40,
      created_at: Math.round(Date.now() / 1000),
      tags: [
        ['t', NostrService.ZAPSTACK_TAG],
        ['subject', name]
      ],
      content: JSON.stringify(content)
    }

    if(questionId) {
      event.tags.push(['e', questionId, this.relay.url])
    }

    const signedEvent = finishEvent(event, this.keyManagementService.getPrivKey())

    return this.publishEvent(signedEvent);
  }

  async listQuestions(): Promise<Question[]> {
    const filter: Filter = {
      kinds: [40],
      '#t': [NostrService.ZAPSTACK_TAG]
    };

    const events: Event[] = await this.relay.list([filter]);
    console.log(events);
    
    return events.map((event: Event) => {
      return {
        id: event.id,
        title: JSON.parse(event.content).name,
        message: JSON.parse(event.content).about,
      };
    });
  }

  async createAnswer(topicId: string, message: string): Promise<string> {

    const event: EventTemplate = {
      kind: 42,
      created_at: Math.round(Date.now() / 1000),
      tags: [
        ['t', NostrService.ZAPSTACK_TAG],
        ['e', topicId, this.relay.url, 'root']
      ],
      content: message
    }

    const signedEvent = finishEvent(event, this.keyManagementService.getPrivKey())

    return this.publishEvent(signedEvent);
  }

  async createComment(questionId: string, message: string, parentId: string): Promise<string> {

    const event: EventTemplate = {
      kind: 42,
      created_at: Math.round(Date.now() / 1000),
      tags: [
        ['t', NostrService.ZAPSTACK_TAG],
        ['e', questionId, this.relay.url, 'reply'],
        ['p', parentId]
      ],
      content: message
    }

    const signedEvent = finishEvent(event, this.keyManagementService.getPrivKey())

    return this.publishEvent(signedEvent);
  }

  async vote(answerId: string, answerPubKey: string, type: "up" | "down"): Promise<string> {

    const event: EventTemplate = {
      kind: 7,
      created_at: Math.round(Date.now() / 1000),
      tags: [
        ['t', NostrService.ZAPSTACK_TAG],
        ['e', answerId],
        ['p', answerPubKey]
      ],
      content: type === 'up' ? '+' : '-'
    }

    const signedEvent = finishEvent(event, this.keyManagementService.getPrivKey())

    return this.publishEvent(signedEvent);
  }

  async getVoteResult(answerId: string): Promise<number> {
    const filter: Filter = {
      kinds: [7],
      '#t': [NostrService.ZAPSTACK_TAG],
      '#e': [answerId]
    };

    const events: Event[] = await this.relay.list([filter]);
    console.log(events)

    let result = 0;
    events.forEach(e => {
      if(e.content === '+') result++;
      else if(e.content === '-') result--;
    })
    return result;
  }

  async listAnswers(topicId: string): Promise<Answer[]> {
    const filter: Filter = {
      kinds: [42],
      '#t': [NostrService.ZAPSTACK_TAG],
      '#e': [topicId] //TODO filter by 'root' Tag
    };

    const events: Event[] = await this.relay.list([filter]);
    console.log(events)
    return events.flatMap((event: Event) => {
      let posts: Answer[] = []
      // workaround for not being able to filter by multiple #e tags (topicId + root/reply)
      if(!event.tags.some((subArr) => subArr[0] === 'p')) {
        const post: Answer = {
          ...event,
          message: event.content,
          vote: 0
         }
        posts.push(post);
      }
      return posts;
    });
  }

  async listComments(postId: string): Promise<Comment[]> {
    const filter: Filter = {
      kinds: [42],
      '#t': [NostrService.ZAPSTACK_TAG],
      '#p': [postId]
    };

    const events: Event[] = await this.relay.list([filter]);

    return events.map((event: Event) => {
      const post: Comment = {
        id: event.id,
        message: event.content
      }
      return post;
    });
  }

  async getQuestion(questionId: string): Promise<Question> {
    const filter: Filter = {
      kinds: [40],
      ids: [questionId]
    };

    const event: Event | null = await this.relay.get(filter)

    if (!event) {
      throw new Error(`Question with id ${questionId} not found`);
    }
    console.log(event)

    const question: Question = {
      id: event.id,
      title: JSON.parse(event.content).name,
      message: JSON.parse(event.content).about,
    }
    return question;
  }

  
  async deleteEvents(eventId: string): Promise<void> {
    const event: EventTemplate = {
      kind: 5,
      created_at: Math.round(Date.now() / 1000),
      tags: [
        ['t', NostrService.ZAPSTACK_TAG],
        ['e', eventId]
      ],
      content: ""
    }

    const signedEvent = finishEvent(event, this.keyManagementService.getPrivKey())

    const pub = this.relay.publish(signedEvent)
    pub.on('ok', () => {
      console.log('deletion event sucessfully submitted')
    })
    pub.on('failed', (reason: any) => {
      console.log('deletion event failed')
      console.log(reason)
    })
  }

  async getAnswer(answerId: string): Promise<Answer> {
    const filter: Filter = {
      kinds: [42],
      ids: [answerId]
    };

    const event: Event | null = await this.relay.get(filter)

    if (!event) {
      throw new Error(`Answer with id ${answerId} not found`);
    }

    const answer: Answer = JSON.parse(event.content);
    answer.id = event.id;
    answer.tags = event.tags;
    return answer;
  }

  private publishEvent(signedEvent: Event): Promise<string> {
    return new Promise((resolve, reject) => {
      let pub = this.relay.publish(signedEvent);
      pub.on('ok', () => {
        console.log('event sucessfully published');
        console.log(signedEvent);
        resolve(signedEvent.id);
      });
      pub.on('failed', (reason: any) => {
        console.log('event failed');
        console.log(reason);
        reject(reason);
      });
    });
  }

}
