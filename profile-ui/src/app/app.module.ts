import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ToastrModule } from "ngx-toastr"

import { SidebarModule } from './sidebar/sidebar.module'
import { FooterModule } from './shared/footer/footer.module'
import { NavbarModule} from './shared/navbar/navbar.module'
import { FixedPluginModule} from './shared/fixedplugin/fixedplugin.module'

import { AppComponent } from './app.component'
import { AppRoutes } from './app.routing'

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component'

import { HttpClientModule } from '@angular/common/http'
import { OAuthModule } from 'angular-oauth2-oidc';
import { MatDialogModule } from "@angular/material/dialog"

import { FormsModule }   from '@angular/forms';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { SignOutPageComponent } from './pages/sign-out-page/sign-out-page.component';
import { ConsentPageComponent } from './pages/consent-page/consent-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LandingPageComponent,
    SignInPageComponent,
    SignUpPageComponent,
    SignOutPageComponent,
    ConsentPageComponent,
    ErrorPageComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutes),
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    OAuthModule.forRoot(),
    FooterModule,
    FixedPluginModule,
    HttpClientModule,
    MatDialogModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule { }
