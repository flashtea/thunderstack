import { Component, OnInit } from '@angular/core';
import { faBolt, faCheckCircle, faEnvelope, faHeart, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Event, Profile } from '../../models/model';
import { KeyManagementService } from '../../services/key.service';
import { LightningService } from '../../services/lightning.service';
import { NostrService } from '../../services/nostr.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userProfile: Profile = new Profile();

  faBolt = faBolt;
  faHeart = faHeart;
  faUserPlus = faUserPlus;
  faCheckCircle = faCheckCircle;

  latestPosts: Event[] = [];

  constructor(private nostrService: NostrService,
    private keyManagementService: KeyManagementService,
    private lightningService: LightningService) {}

  ngOnInit() {
    this.nostrService.isConnected().subscribe(connected => {
      if(connected) {
        this.nostrService.getProfile(this.keyManagementService.getPubKey()).then(res => this.userProfile = res)
      }
    })
  }

  onSave() {
    this.nostrService.updateProfile(this.userProfile)
  }

  getLightningLink(profile: Profile) {
    return this.lightningService.getSanitizedLightningLink(profile)
  }
}
