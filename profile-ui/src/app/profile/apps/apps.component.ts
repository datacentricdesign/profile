import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { App, PersonService } from '../services/person.service';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'app/app.service';
import { Observable, throwError } from 'rxjs';
import { catchError,map } from 'rxjs/operators';


declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {


  private apiURL: string

  public tableData1: TableData;
  public tableData2: TableData;

  apps$: Observable<any>
  apps: any

  personId: string
  clients: any = []

  model: App = {
    name: 'My Test App',
    description: 'An App to test!',
    uri: '',
    personId: undefined
  }

  constructor(
    private oauthService: OAuthService, private personService: PersonService, private _Activatedroute: ActivatedRoute, private appService: AppService,
    private http: HttpClient) {
    this.apiURL = appService.settings.apiURL
  }

  ngOnInit(): void {
    this._Activatedroute.paramMap.subscribe(params => {
      if (this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken()) {
        const claim: any = this.oauthService.getIdentityClaims()
        this.personId = claim.sub
        let headers = new HttpHeaders().set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
        const url = this.apiURL + "/persons/" + claim.sub + '/apps'
        this.apps$ = this.http.get<any>(url, { headers }).pipe(
          map((data: any) => {
            this.apps = data
            const clients:object = {}
            for (let i=0;i<this.apps.length;i++) {
              const clientId = this.apps[i].consent_request.client.client_id
              if (clients[clientId]===undefined) {
                clients[clientId] = this.apps[i].consent_request.client
                clients[clientId].requested_scope = this.apps[i].consent_request.requested_scope
              }
            }
            for (let i in clients) {
              this.clients.push(clients[i])
            }
            return data;
          }), catchError(error => {
            return throwError('Person\'s apps not found!');
          })
        )
      }
    });
  }

  onSubmit() {
    this.model.personId = this.personId;
    this.personService.createAnApp(this.model)
      .then((data: App) => {
        window.location.href = './apps/' + data.id;
      })
      .catch((error) => {
        this.personService.toast(error)
      })
  }

  revoke(clientId:string) {
    this.personService.revoke(this.personId, clientId)
  }

}
