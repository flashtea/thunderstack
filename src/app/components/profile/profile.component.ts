import { Component, OnInit } from '@angular/core';
import { Profile } from '../../models/model';
import { KeyManagementService } from '../../services/key.service';
import { NostrService } from '../../services/nostr.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: Profile = new Profile();

  constructor(private nostrService: NostrService,
    private keyManagementService: KeyManagementService) {}

  ngOnInit() {
    this.nostrService.isConnected().subscribe(connected => {
      if(connected) {
        this.nostrService.getProfile(this.keyManagementService.getPubKey()).then(res => this.profile = res)
      }
    })
  }

  onSave() {
    this.nostrService.updateProfile(this.profile)
  }
}
