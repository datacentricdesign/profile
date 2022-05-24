import { Routes } from '@angular/router';

import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignInPageComponent } from './pages/sign-in/sign-in.component';
import { SignUpPageComponent } from './pages/sign-up/sign-up.component';
import { SignOutPageComponent } from './pages/sign-out-page/sign-out-page.component';
import { ConsentPageComponent } from './pages/consent-page/consent-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'about',
    pathMatch: 'full'
  },
  {
    path: 'about',
    component: LandingPageComponent
  },
  { path: 'signin', component: SignInPageComponent },
  { path: 'signup', component: SignUpPageComponent },
  { path: 'signout', component: SignOutPageComponent },
  { path: 'consent', component: ConsentPageComponent },
  { path: 'error', component: ErrorPageComponent },
  {
    path: 'persons',
    loadChildren: () =>
      import('./profile/profile.module').then(
        mod => mod.ProfileModule
      )
  }
]
