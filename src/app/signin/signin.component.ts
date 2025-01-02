import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { constants } from '../app.config';


interface loginModel {
  phoneOrEmail?: string,
  password?: string
}

interface signupModel {
  name?: string,
  email?: string,
  phone?: string,
  password?: string
}

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconFieldModule, InputIconModule, TooltipModule, InputTextModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnInit {

  public loginForm: FormGroup = new FormGroup({});
  public signupForm: FormGroup = new FormGroup({});
  loading = false;
  isLoginForm: boolean = true;
  logoImage: any;

  hidePassword: boolean = true;
  passwordText: any = 'show'
  showButton: boolean = true;
  showPassword: boolean = false;
  loginModel: loginModel = {}
  signupModel: signupModel = {};

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.buildForm();
    this.logoImage = './assets/bg-logo.svg';
    let userData = localStorage.getItem("users");
    if (userData) {
      this.router.navigate(['/home']);
    }
  }

  private buildForm(): void {
    this.loginForm = this.formBuilder.group({
      phoneOrEmail: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[6-9][0-9]{9}$')
      ]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      mobile: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[6-9][0-9]{9}$')
      ]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  public toggleForm(): void {
    this.isLoginForm = !this.isLoginForm;
  }

  public togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  public togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  public userLogin(): void {
    this.loginModel.phoneOrEmail = this.loginForm.get('phoneOrEmail')?.value;
    this.loginModel.password = this.loginForm.get('password')?.value;

    this.http.post<any>(`${constants.baseUrl}fetch-user`, this.loginModel).subscribe({
      next: response => {
        if (response) {
          localStorage.setItem("users", JSON.stringify(response));
          alert('Login successful!');
          this.router.navigate(['/home']);
        }
      }, error: err => {
        console.log("err", err.ok);
        if (err.ok == false) {
          alert('User login failed !');
        }
      }
    })
  }

  public userSignup(): void {

    this.signupModel.name = this.signupForm.get('name')?.value;
    this.signupModel.email = this.signupForm.get('email')?.value;
    this.signupModel.phone = this.signupForm.get('mobile')?.value;
    this.signupModel.password = this.signupForm.get('password')?.value;

    this.http.post<any>(`${constants.baseUrl}create-user`, this.signupModel).subscribe({
      next: response => {
        if (response && response.code === "000") {
          alert('Signup successful! Please login to continue.');
          this.toggleForm();
        } else {
          alert("Failed to create User");
        }

      }, error: err => {
        if (err.ok == false) {
          alert("Something went wrong !")
        }
      }
    })

  }


}