import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs/operators';
import { AppService } from './app.service';

  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
export class AppComponent {

  constructor(private oauthService: OAuthService, private appService: AppService) {
    this.configureCodeFlow();

    // Automatically load user profile
    this.oauthService.events
      .pipe(filter(e => e.type === 'token_received'))
      .subscribe(_ => {
        console.debug('state', this.oauthService.state);
        this.oauthService.loadUserProfile();
        window.location.href = './persons/dashboard'
      });

    // Display all events
    this.oauthService.events.subscribe(e => {
      console.debug('oauth/oidc event', e);
    });
  }

  private configureCodeFlow() {
    this.oauthService.configure(this.appService.settings.authCodeFlow);
    this.oauthService.requestAccessToken = true;

    console.log("app component")
    if (
      this.oauthService.hasValidAccessToken() &&
      this.oauthService.hasValidIdToken()
    ) {
      console.log("=> yes")
    } else {
      console.log("=> no")
    }


    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }  

}