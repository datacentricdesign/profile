import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppService } from 'app/app.service';
import { DTOPerson } from '@datacentricdesign/types';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private apiURL: string

  constructor(
    private oauthService: OAuthService,
    private http: HttpClient,
    private appService: AppService
  ) {
    console.log('constructor thing service')
    this.apiURL = appService.settings.apiURL;
  }

  edit(personId: string, fields: any): void {
    let url = this.apiURL + '/persons/' + personId;
    let headers = new HttpHeaders().set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());

    const body: any = {}
    if (fields.name !== undefined && fields.name !== '') {
      body.name = fields.name;
    }
    if (fields.email !== undefined && fields.email !== '') {
      body.email = fields.email;
    }
    console.log(body)
    this.http.patch(url, body, { headers })
      .subscribe(
        result => {
          window.location.reload(true);
        },
        err => {
          console.warn('status', err.status);
        }
      );
  }

  delete(personId: string) {
    let url = this.apiURL + '/persons/' + personId;
    let headers = new HttpHeaders().set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());

    this.http.delete(url, { headers })
      .subscribe(
        result => {
          this.logout()
        },
        err => {
          console.warn('status', err.status);
        }
      );
  }

  revoke(personId:string, clientId: string) {
    let url = this.apiURL + '/persons/' + personId + '/sessions/' + clientId;
    let headers = new HttpHeaders().set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());

    this.http.delete(url, { headers })
      .subscribe(
        result => {
          window.location.reload(true)
        },
        err => {
          console.warn('status', err.status);
        }
      );
  }

  logout() {
    this.oauthService.logOut();
    this.oauthService.revokeTokenAndLogout();
  }


}
