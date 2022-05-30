import { Component, OnInit } from '@angular/core';
import { DTOPerson } from '@datacentricdesign/types'
import { Observable, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AppService } from 'app/app.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


import { V0alpha2Api, SelfServiceRegistrationFlow, SelfServiceRecoveryFlow } from '@ory/kratos-client'
import { AxiosResponse } from 'axios'

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html'
})
export class RecoveryComponent implements OnInit {

  ready = false
  data: any
  kratos: V0alpha2Api
  flowId: string
  csrf: string
  action: string
  message: string
  cookie: string

  model = {
    email: ''
  }

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService) {
      
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.kratos = new V0alpha2Api(undefined, 'http://localhost')
      this.kratos.initializeSelfServiceRecoveryFlowForBrowsers('http://localhost/profile', { headers: { 'Accept': 'application/json' } })
        .then((data: AxiosResponse<SelfServiceRecoveryFlow>) => {
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
          console.error(error)
        })
    })
  }

  postRecovery(): void {

    const body = {
      email: this.model.email,
      csrf_token: this.csrf,
      method: 'link'
    }

    const httpOptions = { credentials: 'include', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}
    this.kratos.submitSelfServiceRecoveryFlow(this.flowId, undefined, body, httpOptions)
  }

}
