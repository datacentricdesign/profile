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
  selector: 'app-verification',
  templateUrl: './verification.component.html'
})
export class VerificationComponent implements OnInit {

  auth$: Observable<any>;

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appService: AppService,
    private toastr: ToastrService) {
      // this.apiURL = this.appService.settings.apiURL;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
    })
  }


}
