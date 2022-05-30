import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DCDError } from '@datacentricdesign/types';
import { SelfServiceLogoutUrl, V0alpha2Api } from '@ory/kratos-client';
import { AppService } from 'app/app.service';
import { ToastrService } from 'ngx-toastr';

import { AxiosResponse } from 'axios'

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html'
})
export class SignOutComponent implements OnInit {

  public csrfToken: string;
  public challenge: string;

  public error: DCDError;


  ready = false
  kratos: V0alpha2Api
  logOutToken: string
  returnTo = './signin'


  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.kratos = new V0alpha2Api(undefined, 'http://localhost')
      this.kratos.createSelfServiceLogoutFlowUrlForBrowsers()
        .then((data: AxiosResponse<SelfServiceLogoutUrl>) => {
          this.logOutToken = data.data.logout_token
          this.ready = true
        })
        .catch((error) => {
          this.error = error;
        })
    });
  }

  public logout() {
    const httpOptions = { credentials: 'include', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }
    this.kratos.submitSelfServiceLogoutFlow(this.logOutToken, undefined, httpOptions)
      .then( () => {
        window.location = this.returnTo as any;
      })
  }

  public cancel() {
    window.location = this.returnTo as any;
  }
 
}
