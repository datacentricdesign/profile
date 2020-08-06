import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { AppService } from 'app/app.service';

@Component({
  selector: 'app-consent-page',
  templateUrl: './consent-page.component.html',
  styleUrls: ['./consent-page.component.css']
})
export class ConsentPageComponent implements OnInit {

  auth$: Observable<any>;

  id: string;
  description: string
  name: string
  consent_challenge:string
  csrf:string
  client: any
  error: any
  user:any
  requested_scope: any
  scopes: string
  apiURL: string

  model: any = {
    remember: false
  }

  constructor(private route: ActivatedRoute,
    private _router: Router,
    private http: HttpClient,
    private appService: AppService) {
      this.apiURL = this.appService.settings.apiURL;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.consent_challenge = params["consent_challenge"]
      this.auth$ = this.http.get<any>(this.apiURL + "/auth/consent?consent_challenge=" + this.consent_challenge).pipe(
        map((data: any) => {
          console.log(data)
          this.csrf = data.csrfToken
          this.client = data.client
          this.user = data.user
          this.requested_scope = data.requested_scope
          this.scopes = data.scopes
          return data;
        }), catchError(error => {
          return throwError(error);
        })
      )
    });
  }

  postConsent(value:string): void {
    this.http.post(this.apiURL + "/auth/consent?consent_challenge=" + this.consent_challenge + "&_csrf=" + this.csrf, {
      _csrf: this.csrf,
      challenge: this.consent_challenge,
      scopes: this.scopes,
      submit: value,
      user: this.user,
      remember: this.model.remember
    }).subscribe((data: any) => {
      console.log(data)
      if (data.error) {
        this.error = data.error
        console.log(this.error)
      } else if (data.redirect_to) {
          window.location = data.redirect_to
      }
    });
  }

}
