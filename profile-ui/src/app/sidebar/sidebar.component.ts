import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

const dashboardRoute = { path: 'dashboard', title: 'Dashboard', icon: 'nc-layout-11', class: '' }
const sessionsRoute = { path: 'sessions', title: 'Current Apps', icon: 'nc-book-bookmark', class: '' }

export const ROUTES: RouteInfo[] = [dashboardRoute, sessionsRoute];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];

    constructor(private http: HttpClient) { }


    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
