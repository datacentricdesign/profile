import { Component, OnInit } from '@angular/core';
import { DTOPerson } from '@datacentricdesign/types'
import { Observable, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AppService } from 'app/app.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


import { V0alpha2Api, SelfServiceRegistrationFlow, SelfServiceRecoveryFlow, SelfServiceSettingsFlowState, SelfServiceSettingsFlow } from '@ory/kratos-client'
import { AxiosResponse } from 'axios'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {

  ready = false
  data: any
  kratos: V0alpha2Api
  flowId: string
  csrf: string
  action: string
  message: string
  cookie: string

  model = {
    email: '',
    first: '',
    last: '',
    password: ''
  }

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService) {
      
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.kratos = new V0alpha2Api(undefined, 'http://localhost')
      this.kratos.initializeSelfServiceSettingsFlowForBrowsers('http://localhost/profile', { headers: { 'Accept': 'application/json' } })
        .then((data: AxiosResponse<SelfServiceSettingsFlow>) => {
          console.log(data.data)
          this.flowId = data.data.id;
          if (data.data.ui.nodes.length > 0) {
            this.csrf = data.data.ui.nodes[0].attributes['value'];
            this.model.email = data.data.ui.nodes[1].attributes['value'];
            this.model.first = data.data.ui.nodes[2].attributes['value'];
            this.model.last = data.data.ui.nodes[3].attributes['value'];
          }
          this.ready = true
          this.action = data.data.ui.action
          this.data = data.data
          if (data.data.ui.messages !== undefined && data.data.ui.messages.length > 0) {
            this.message = data.data.ui.messages[0].text
          }
        })
        .catch((error) => {
          console.error(error)
        })
    })
  }

  postUpdateProfile(): void {

    const body = {
      csrf_token: this.csrf,
      method: 'profile',
      traits: {
        email: this.model.email,
        name: {
          first: this.model.first,
          last: this.model.last
        }
      }
    }

    const httpOptions = { credentials: 'include', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}
    this.kratos.submitSelfServiceSettingsFlow(this.flowId, undefined, body, httpOptions)
  }

  postUpdatePassword(): void {

    const body = {
      csrf_token: this.csrf,
      method: 'password',
      password: this.model.password
    }

    const httpOptions = { credentials: 'include', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}
    this.kratos.submitSelfServiceSettingsFlow(this.flowId, undefined, body, httpOptions)
  }


}
