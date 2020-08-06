import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { SignOutPageComponent } from './pages/sign-out-page/sign-out-page.component';
import { ConsentPageComponent } from './pages/consent-page/consent-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

export const AppRoutes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'signin', component: SignInPageComponent },
  { path: 'signup', component: SignUpPageComponent },
  { path: 'signout', component: SignOutPageComponent },
  { path: 'consent', component: ConsentPageComponent },
  { path: 'error', component: ErrorPageComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate:[],
    children: [
        {
      path: '',
      loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
      }]
  },
]
