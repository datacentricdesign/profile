import { Component, OnInit } from '@angular/core';
import { DTOPerson } from '@datacentricdesign/types'
import { Observable, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AppService } from 'app/app.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


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
  apiURL: string
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService) {
      this.apiURL = this.appService.settings.apiURL;
  }

  model: any = {
    email: '',
    password: '',
    name: '',
    username: '',
    confirmPassword: ''
  }

  fieldTextPasswordType: boolean;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params)
      this.login_challenge = params["login_challenge"]
      this.auth$ = this.http.get<any>(this.apiURL + "/auth/signup?login_challenge=" + params["login_challenge"]).pipe(
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
    const url = this.apiURL + "/auth/signup?login_challenge=" + this.login_challenge + "&_csrf=" + this.csrf
    const body = {
      email: this.model.email,
      password: this.model.password,
      name: this.model.name,
      id: 'dcd:persons:' + this.model.username,
      _csrf: this.csrf,
      challenge: this.login_challenge
    }
    this.http.post(url, body).subscribe((data: any) => {
      console.log(data)
      if (data.error) {
        this.toast(data.error._hint, 'danger')
      } else if (data.redirect_to) {
        window.location = data.redirect_to
      }
    });
  }

  toast(message:string, type:string, icon:string = 'nc-alert-circle-i') {
    this.toastr.info(
      '<span data-notify="icon" class="nc-icon '+icon+'"></span><span data-notify="message">'+message+'</span>',
        "",
        {
          timeOut: 4000,
          closeButton: true,
          enableHtml: true,
          toastClass: "alert alert-"+type+" alert-with-icon",
          positionClass: "toast-top-center"
        }
      );
  }

  toggleFieldTextPasswordType() {
    this.fieldTextPasswordType = !this.fieldTextPasswordType;
  }

}
