import { Component, OnInit } from '@angular/core';
import { DCDError } from '@datacentricdesign/types';

@Component({
  selector: 'app-sign-out-page',
  templateUrl: './sign-out-page.component.html',
  styleUrls: ['./sign-out-page.component.css']
})
export class SignOutPageComponent implements OnInit {

  public csrfToken: string;
  public challenge: string;

  public error: DCDError;

  constructor() { }

  ngOnInit(): void {
  }

  public onSubmit() { }

}
