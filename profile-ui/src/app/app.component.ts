import { Component } from '@angular/core';
import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';


// import { AuthConfig } from 'angular-oauth2-oidc';
 
//   export const authCodeFlowConfig: AuthConfig = {
//     // Url of the Identity Provider
//     issuer: 'http://localhost:8081/',
 
//     // URL of the SPA to redirect the user to after login
//     redirectUri: "http://localhost:4200",
 
//     // The SPA's id. The SPA is registerd with this id at the auth-server
//     // clientId: 'server.code',
//     clientId: 'clients:bucket-app-ui',
 
//     // Just needed if your auth server demands a secret. In general, this
//     // is a sign that the auth server is not configured with SPAs in mind
//     // and it might not enforce further best practices vital for security
//     // such applications.
//     // dummyClientSecret: 'secret',
 
//     responseType: 'code',
 
//     // set the scope for the permissions the client should request
//     // The first four are defined by OIDC.
//     // Important: Request offline_access to get a refresh token
//     // The api scope is a usecase specific one
//     scope: 'openid offline email dcd:things',
 
//     showDebugInformation: true,
 
//     // Not recommented:
//     // disablePKCI: true,
//   };


  @Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
export class AppComponent {

  constructor(/*private oauthService: OAuthService*/) {
    // this.oauthService.configure(authCodeFlowConfig);
    // this.oauthService.loadDiscoveryDocumentAndTryLogin();

    // this.oauthService.initLoginFlow();
  }

}