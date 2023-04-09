import { Injectable } from '@angular/core';
import { Relay } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class RelayService {
  private relays: string[] = [
    'wss://relay.damus.io'
  ];

  constructor() {
    const storedRelays = localStorage.getItem('relays');
    if (storedRelays) {
      this.relays = JSON.parse(storedRelays);
    } else {
      localStorage.setItem('relays', JSON.stringify(this.relays));
    }
  }

  getRelays(): string[] {
    return this.relays;
  }

  getMainRelay(): string {
    return this.relays[0];
  }

  getRelay(): string[] {
    return this.relays;
  }

  addRelay(relay: string): void {
    this.relays.push(relay);
    localStorage.setItem('relays', JSON.stringify(this.relays));
  }

  deleteRelay(relay: string): void {
    this.relays = this.relays.filter(r => r !== relay);
    localStorage.setItem('relays', JSON.stringify(this.relays));
  }
}
