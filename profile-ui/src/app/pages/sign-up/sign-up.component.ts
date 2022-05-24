import { Component, OnInit } from '@angular/core';
import { DTOPerson } from '@datacentricdesign/types'
import { Observable, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AppService } from 'app/app.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


import { V0alpha2Api, SelfServiceRegistrationFlow } from '@ory/kratos-client'
import { AxiosResponse } from 'axios'

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html'
})
export class SignUpPageComponent implements OnInit {

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

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService) {
      // this.apiURL = this.appService.settings.apiURL;
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
      this.kratos = new V0alpha2Api(undefined,'http://localhost')
      this.kratos.initializeSelfServiceRegistrationFlowForBrowsers('http://localhost/profile', {headers: {'Accept': 'application/json'}})
          .then( (data: AxiosResponse<SelfServiceRegistrationFlow>) => {
            this.flowId = data.data.id;
            this.csrf = data.data.ui.nodes[0].attributes['value'];
            this.ready = true
            this.action = data.data.ui.action
            this.data = data.data
            this.message = data.data.ui.messages[0].text
            console.log(data)
          })
          .catch( (error) => {
            console.error(error)
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
          first: this.model.name,
          last: this.model.name
        }
      }
    }

    const httpOptions = { credentials: 'include', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}
    this.kratos.submitSelfServiceRegistrationFlow(this.flowId, body, httpOptions)
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
