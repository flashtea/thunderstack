import { Component, OnInit } from '@angular/core';
import { Relay } from '../../models/model';
import { RelayService } from '../../services/relay.service';

@Component({
  selector: 'app-relays',
  templateUrl: './relays.component.html',
  styleUrls: ['./relays.component.scss']
})
export class RelaysComponent implements OnInit {
  relays: string[];
  newRelay = '';

  constructor(private relayService: RelayService) { }

  ngOnInit(): void {
    this.loadRelays()
  }

  onAdd(): void {
    this.relayService.addRelay(this.newRelay);
    this.newRelay = '';
    this.loadRelays();
  }

  onDelete(relay: string): void {
    this.relayService.deleteRelay(relay);
    this.loadRelays();
  }

  loadRelays() {
    this.relays = this.relayService.getRelays();
  }
}





