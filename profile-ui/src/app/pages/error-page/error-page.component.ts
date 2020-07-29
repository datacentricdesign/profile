import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit {

  public type: string
  public debug: string
  public description: string
  public hint: string

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.type = params["error"]
      this.debug = params["error_debug"]
      this.description = params["error_description"]
      this.hint = params["error_hint"]
    })
  }

}
