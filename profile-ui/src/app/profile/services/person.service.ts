import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppService } from 'app/app.service';
import { DTOPerson } from '@datacentricdesign/types';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private apiURL: string
  private userProfile = undefined

  constructor(
    private oauthService: OAuthService,
    private http: HttpClient,
    private appService: AppService
  ) {
    console.log('constructor thing service')
    this.apiURL = appService.settings.apiURL;
  }

  getUserProfile() {
    if (this.userProfile === undefined) {
      if (this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken()) {
        const claim: any = this.oauthService.getIdentityClaims()
        this.userProfile = {
          id: claim.sub,
          name: claim.name,
          email: claim.email
        }
      }
    }
    return this.userProfile
  }

  // private headers() {
  //   return new HttpHeaders().set('Accept', 'application/json')
  //   .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
  // }

  edit(personId: string, fields: any): void {
    let url = this.apiURL + '/persons/' + personId;

    const body: any = {}
    if (fields.name !== undefined && fields.name !== '') {
      body.name = fields.name;
    }
    if (fields.email !== undefined && fields.email !== '') {
      body.email = fields.email;
    }
    console.log(body)
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    this.http.patch(url, body, { headers })
      .subscribe(
        result => {
          window.location.reload();
        },
        err => {
          console.warn('status', err.status);
        }
      );
  }

  delete(personId: string) {
    let url = this.apiURL + '/persons/' + personId;

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    this.http.delete(url, { headers: headers })
      .subscribe(
        result => {
          this.logout()
        },
        err => {
          console.warn('status', err.status);
        }
      );
  }

  revoke(personId: string, clientId: string) {
    let url = this.apiURL + '/persons/' + personId + '/sessions/' + clientId;

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    this.http.delete(url, { headers: headers })
      .subscribe(
        result => {
          window.location.reload()
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

  listGroups() {
    const url = this.apiURL + '/groups';
    
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    console.log("list group")
    console.log(headers)
    return this.http.get<any>(url, { headers }).pipe(
      map((data: any) => {
        return data;
      }), catchError(error => {
        return throwError('Groups not found!');
      })
    )
  }

  checkIfGroupIdExists(groupId: string) {
    const url = this.apiURL + '/groups/' + groupId + '/check';

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.get(url, { headers: headers }).toPromise();
  }

  createAGroup(groupId: string, members: string[]) {
    const url = this.apiURL + '/groups';
    const body = { id: groupId, members: members }
    console.log(body)

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.post(url, body, { headers: headers }).toPromise();
  }

  deleteAGroup(groupId: string) {
    const url = this.apiURL + '/groups/' + groupId;

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.delete(url, { headers: headers }).toPromise()
  }

  listMembersOfAGroup(groupId: string) {
    const url = this.apiURL + '/groups/' + groupId + '/members';
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.get(url, { headers: headers }).toPromise()
  }

  addMembersToAGroup(groupId: string, newMemberIds: string[]) {
    const url = this.apiURL + '/groups/' + groupId + '/members';
    const body = { members: newMemberIds }
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    console.log('hello')
    console.log(headers)
    console.log(this.oauthService.getAccessToken())
    return this.http.post(url, body, { headers: headers }).toPromise()
  }

  removeAMemberFromAGroup(groupId: string, personId: string) {
    const url = this.apiURL + '/groups/' + groupId + '/members/' + personId;
    console.log(url)
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.delete(url, { headers: headers }).toPromise()
  }
}
