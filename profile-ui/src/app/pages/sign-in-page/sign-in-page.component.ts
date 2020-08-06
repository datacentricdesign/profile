import { Component, OnInit } from '@angular/core';
import { DTOPerson } from '@datacentricdesign/types'
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppService } from 'app/app.service';

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.css']
})
export class SignInPageComponent implements OnInit {

  auth$: Observable<any>;

  id: string;
  description: string
  name: string
  login_challenge:string
  csrf:string
  client: any
  error: any
  apiURL: string

  constructor(private route: ActivatedRoute,
    private _router: Router,
    private http: HttpClient,
    private appService: AppService) {
      this.apiURL = this.appService.settings.apiURL;
  }

  model: DTOPerson = {
    email: '',
    password: ''
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params)
      this.login_challenge = params["login_challenge"]
      this.auth$ = this.http.get<any>(this.apiURL + "/auth/signin?login_challenge=" + this.login_challenge).pipe(
        map((data: any) => {
          console.log(data)
          this.csrf = data.csrfToken
          this.client = data.client
          return data;
        }), catchError(error => {
          return throwError(error);
        })
      )
    });

  }

  postSignIn(): void {
    this.http.post(this.apiURL + "/auth/signin?login_challenge=" + this.login_challenge + "&_csrf=" + this.csrf, {
      email: this.model.email,
      password: this.model.password,
      _csrf: this.csrf,
      challenge: this.login_challenge
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
