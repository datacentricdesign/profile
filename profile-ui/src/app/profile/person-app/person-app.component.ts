import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { PersonService } from '../services/person.service';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'app/app.service';
import { Observable, throwError } from 'rxjs';
import { catchError,map } from 'rxjs/operators';


declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'app-person-app',
  templateUrl: './person-app.component.html',
  styleUrls: ['./person-app.component.css']
})
export class PersonAppComponent implements OnInit {


  private apiURL: string

  public tableData1: TableData;
  public tableData2: TableData;

  apps$: Observable<any>
  apps: any

  personId: string
  clients: any = []

  constructor(
    private oauthService: OAuthService, private personService: PersonService, private _Activatedroute: ActivatedRoute, private appService: AppService,
    private http: HttpClient) {
    this.apiURL = appService.settings.apiURL
  }

  ngOnInit(): void {
    this._Activatedroute.paramMap.subscribe(params => {
      if (this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken()) {
        console.log('## valid token')
        const claim: any = this.oauthService.getIdentityClaims()
        this.personId = claim.sub
        let headers = new HttpHeaders().set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + this.oauthService.getAccessToken());
        const url = this.apiURL + "/persons/" + claim.sub + '/apps'
        console.log(url)
        this.apps$ = this.http.get<any>(url, { headers }).pipe(
          map((data: any) => {
            console.log(data)
            this.apps = data
            const clients:object = {}
            for (let i=0;i<this.apps.length;i++) {
              console.log(this.apps[i])
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

  revoke(clientId:string) {
    this.personService.revoke(this.personId, clientId)
  }

}
