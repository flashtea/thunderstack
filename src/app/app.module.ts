import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginSignupComponent } from './components/login-signup/login-signup.component';
import { ErrorHandlingComponent } from './error-handling/error-handling.component';
import { QuestionComponent } from './components/question/question.component';
import { CreateQuestionComponent } from './components/create-question/create-question.component';
import { MarkdownModule } from 'ngx-markdown';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginSignupComponent,
    ErrorHandlingComponent,
    QuestionComponent,
    CreateQuestionComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FontAwesomeModule,
    MarkdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
