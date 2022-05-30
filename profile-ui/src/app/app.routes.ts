import { Routes } from '@angular/router';

import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { SignOutComponent } from './pages/sign-out/sign-out.component';
import { ConsentComponent } from './pages/consent-page/consent.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { VerificationComponent } from './pages/verification/verification.component';
import { RecoveryComponent } from './pages/recovery/recovery.component';
import { SettingsComponent } from './pages/settings/settings.component';

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
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'signout', component: SignOutComponent },
  { path: 'consent', component: ConsentComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'recovery', component: RecoveryComponent },
  { path: 'settings', component: SettingsComponent },
  {
    path: 'persons',
    loadChildren: () =>
      import('./profile/profile.module').then(
        mod => mod.ProfileModule
      )
  }
]
