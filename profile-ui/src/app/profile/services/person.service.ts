import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppService } from 'app/app.service';
import { DTOPerson, Person } from '@datacentricdesign/types';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';



export interface App {
  id?: string;
  name: string;
  description: string;
  uri: string;
  personId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private apiURL: string
  private userProfile = undefined

  constructor(
    private oauthService: OAuthService,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService
  ) {
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
    return this.http.get<any>(url, { headers }).pipe(
      map((data: any) => {
        return data;
      }), catchError(error => {
        return throwError('Groups not found!');
      })
    )
  }

  async checkIfGroupIdExists(groupId: string): Promise<any> {
    const url = this.apiURL + '/groups/' + groupId + '/check';

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.get(url, { headers: headers }).toPromise();
  }

  async createAGroup(groupId: string, members: string[]): Promise<any> {
    const url = this.apiURL + '/groups';
    const body = { id: groupId, members: members }

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.post(url, body, { headers: headers }).toPromise();
  }

  async deleteAGroup(groupId: string): Promise<any> {
    const url = this.apiURL + '/groups/' + groupId;

    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.delete(url, { headers: headers }).toPromise()
  }

  async listMembersOfAGroup(groupId: string): Promise<any> {
    const url = this.apiURL + '/groups/' + groupId + '/members';
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.get(url, { headers: headers }).toPromise()
  }

  async addMembersToAGroup(groupId: string, newMemberIds: string[]): Promise<any> {
    const url = this.apiURL + '/groups/' + groupId + '/members';
    const body = { members: newMemberIds }
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.post(url, body, { headers: headers }).toPromise()
  }

  async removeAMemberFromAGroup(groupId: string, personId: string): Promise<any> {
    const url = this.apiURL + '/groups/' + groupId + '/members/' + personId;
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.delete(url, { headers: headers }).toPromise()
  }

  async createAnApp(app: App): Promise<any> {
    const url = `${this.apiURL}/persons/${app.personId}/apps`;
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.post(url, app, { headers: headers }).toPromise()
  }

  async UpdateAnApp(app: App): Promise<any> {
    const url = `${this.apiURL}/persons/${app.personId}/apps/${app.id}`;
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.post(url, app, { headers: headers }).toPromise()
  }

  async deleteAnApp(app: App): Promise<any> {
    const url = `${this.apiURL}/persons/${app.personId}/apps/${app.id}`;
    const headers = new HttpHeaders().set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
    return this.http.delete(url, { headers: headers }).toPromise()
  }

  toast(payload: any, type: string = 'danger', icon: string = 'nc-alert-circle-i') {
    let message = ''
    if (typeof (payload) === 'string') {
      message = payload
    } else if (payload.error !== undefined && typeof (payload.error) !== 'string') {
      message = payload.error.name + ' -- ' + payload.error.message
      if (payload.error.requirement) {
        message += '<br>Requirement: ' + payload.error.requirement
      }
      if (payload.error.hint) {
        message += '<br>Hint: ' + payload.error.hint
      }
    } else {
      message = 'Bucket service unavailable.'
    }

    this.toastr.info(
      '<span data-notify="icon" class="nc-icon ' + icon + '"></span><span data-notify="message">' + message + '</span>',
      '',
      {
        timeOut: 4000,
        closeButton: true,
        enableHtml: true,
        toastClass: 'alert alert-' + type + ' alert-with-icon',
        positionClass: 'toast-top-center'
      }
    );
  }
}
