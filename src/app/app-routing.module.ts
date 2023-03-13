import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginSignupComponent } from './components/login-signup/login-signup.component';
import { ErrorHandlingComponent } from './error-handling/error-handling.component';
import { LoginGuard } from './components/login-signup/login.guard';
import { CreateQuestionComponent } from './components/create-question/create-question.component';
import { QuestionComponent } from './components/question/question.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [LoginGuard] },
  { path: 'create-question', component: CreateQuestionComponent, canActivate: [LoginGuard] },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [LoginGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [LoginGuard] },
  { path: 'question/:id', component: QuestionComponent, canActivate: [LoginGuard] },
  { path: 'login', component: LoginSignupComponent },
  { path: 'error', component: ErrorHandlingComponent },
  { path: '**', redirectTo: 'error' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }