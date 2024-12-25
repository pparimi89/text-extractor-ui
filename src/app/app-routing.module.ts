import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { HomeComponent } from './home/home.component';


export const routes: Routes = [
  {
    path:'',redirectTo:'signin', pathMatch:'full'
  },
  {
    path:'signin',component:SigninComponent
  },
  {
    path:'home',component:HomeComponent
  },
  {
    path:"**",redirectTo:'signin'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
