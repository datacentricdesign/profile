import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './auth-code-flow.config';
import { filter } from 'rxjs/operators';

  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
export class AppComponent {

  constructor(private oauthService: OAuthService) {
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
    this.oauthService.configure(authCodeFlowConfig);
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