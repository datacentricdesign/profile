import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppService } from 'app/app.service';

import { ToastrService } from 'ngx-toastr';


import { V0alpha2Api, SelfServiceRegistrationFlow, Session } from '@ory/kratos-client'
import { AxiosResponse } from 'axios'
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html'
})
export class SignUpComponent implements OnInit {

  auth$: Observable<any>;

  // id: string;
  // name: string
  // login_challenge:string
  // csrf:string
  // client:any
  // error:any
  // apiURL: string


  ready = false
  data: any
  kratos: V0alpha2Api
  flowId: string
  csrf: string
  action: string
  message: string
  cookie: string
  error: any

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService) {
    // this.apiURL = this.appService.settings.apiURL;
  }

  model: any = {
    email: '',
    password: '',
    first: '',
    last: '',
    username: '',
    confirmPassword: ''
  }

  fieldTextPasswordType: boolean;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // this.login_challenge = params["login_challenge"]
      // this.auth$ = this.http.get<any>(this.apiURL + "/auth/signup?login_challenge=" + params["login_challenge"]).pipe(
      //   map((data: any) => {
      //     this.csrf = data.csrfToken
      //     this.client = data.client
      //     return data;
      //   }), catchError(error => {
      //     return throwError(error);
      //   })
      // )
      this.kratos = new V0alpha2Api(undefined, 'http://localhost')
      this.kratos.initializeSelfServiceRegistrationFlowForBrowsers('http://localhost/profile', { headers: { 'Accept': 'application/json' } })
        .then((data: AxiosResponse<SelfServiceRegistrationFlow>) => {
          this.flowId = data.data.id;
          if (data.data.ui.nodes.length > 0) {
            this.csrf = data.data.ui.nodes[0].attributes['value'];
          }
          this.ready = true
          this.action = data.data.ui.action
          this.data = data.data
          if (data.data.ui.messages !== undefined && data.data.ui.messages.length > 0) {
            this.message = data.data.ui.messages[0].text
          }
        })
        .catch((error) => {
          if (error.response.data.error.id === "session_already_available") {
            window.location = "./settings" as any
          } else {
            console.log(error.response)
          }
        })
    });
  }

  postSignUp(): void {
    // const url = this.apiURL + "/auth/signup?login_challenge=" + this.login_challenge + "&_csrf=" + this.csrf
    // const body = {
    //   email: this.model.email,
    //   password: this.model.password,
    //   name: this.model.name,
    //   id: 'dcd:persons:' + this.model.username,
    //   _csrf: this.csrf,
    //   challenge: this.login_challenge
    // }
    // this.http.post(url, body).subscribe((data: any) => {
    //   if (data.error) {
    //     this.toast(data.error._hint, 'danger')
    //   } else if (data.redirect_to) {
    //     window.location = data.redirect_to
    //   }
    // });

    const body = {
      csrf_token: this.csrf,
      password: this.model.password,
      method: 'password',
      traits: {
        email: this.model.email,
        name: {
          first: this.model.first,
          last: this.model.last
        }
      }
    }

    const httpOptions = { credentials: 'include', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }
    this.kratos.submitSelfServiceRegistrationFlow(this.flowId, body, httpOptions)
      .then(() => {
        window.location = "./settings" as any
      })
      .catch((error) => {
        this.error = error
      })
  }

  toast(message: string, type: string, icon: string = 'nc-alert-circle-i') {
    this.toastr.info(
      '<span data-notify="icon" class="nc-icon ' + icon + '"></span><span data-notify="message">' + message + '</span>',
      "",
      {
        timeOut: 4000,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-" + type + " alert-with-icon",
        positionClass: "toast-top-center"
      }
    );
  }

  toggleFieldTextPasswordType() {
    this.fieldTextPasswordType = !this.fieldTextPasswordType;
  }

}
