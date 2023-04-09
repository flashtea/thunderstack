import { Component } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faMoon, faSitemap, faSun } from '@fortawesome/free-solid-svg-icons';
import { Profile } from './models/model';
import { NostrService } from './services/nostr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  faMoon = faMoon;
  faSun = faSun;
  faGithub = faGithub;
  faSitemap = faSitemap;
  title = 'Thunderstack';

  currentYear = new Date().getFullYear();

  isDarkMode: boolean = true;

  loggedInUser?: Profile;

  constructor(private nostrService: NostrService) {}

  ngOnInit() {
    const storedDarkMode = localStorage.getItem('darkMode')
    this.isDarkMode = storedDarkMode ? storedDarkMode === 'true' : true;
    this.setDarkMode(this.isDarkMode);

    this.nostrService.getLoggedInUser().subscribe(res => {
      this.loggedInUser = res;
    })


  }

  setDarkMode(isDarkMode: boolean) {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.setDarkMode(this.isDarkMode);
  }
}
