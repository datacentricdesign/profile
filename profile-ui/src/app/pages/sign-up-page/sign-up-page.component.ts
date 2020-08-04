import { Component, OnInit } from '@angular/core';
import { DTOPerson } from '@datacentricdesign/types'
import { Observable, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';


@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.css']
})
export class SignUpPageComponent implements OnInit {

  auth$: Observable<any>;

  id: string;
  name: string
  login_challenge:string
  csrf:string
  client:any
  error:any

  constructor(private route: ActivatedRoute,
    private _router: Router,
    private http: HttpClient) {
  }

  model: DTOPerson = {
    email: '',
    password: '',
    name: ""
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params)
      this.login_challenge = params["login_challenge"]
      this.auth$ = this.http.get<any>(this._router.url + "/profile/api/auth/signup?login_challenge=" + params["login_challenge"]).pipe(
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

  postSignUp(): void {
    this.http.post(this._router.url + "/profile/api/auth/signup?login_challenge=" + this.login_challenge + "&_csrf=" + this.csrf, {
      email: this.model.email,
      password: this.model.password,
      name: this.model.name,
      _csrf: this.csrf,
      challenge: this.login_challenge
    }).subscribe((data: any) => {
      console.log(data)
      if (data.error) {
        this.error = data.error
        console.log(this.error)
      }
    });
  }


}
