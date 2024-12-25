import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';


interface loginModel {
  email?: string,
  password?: string
}

interface signupModel{
  name?:string,
  email?: string,
  phone?:string,
  password?: string
}

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,IconFieldModule,InputIconModule,TooltipModule,InputTextModule],
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
  signupModel:signupModel={};

  constructor(
    private formBuilder: FormBuilder,
    private router: Router) {}

  ngOnInit(): void {
    this.buildForm();
    this.logoImage = './assets/bg-logo.svg';

  }

  private buildForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[6-9][0-9]{9}$')
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      mobile: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[6-9][0-9]{9}$')
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    this.loginModel.email = this.loginForm.get('email')?.value;
    this.loginModel.password = this.loginForm.get('password')?.value;
  
    // Fetch stored users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  
    // Check if user exists with matching email and password
    const user = storedUsers.find((u: any) => u.email === this.loginModel.email && u.password === this.loginModel.password);

    console.log('user',user);
    
    if (user) {
      // Successful login
      alert('Login successful!');
      this.router.navigate(['/home']);
    } else {
      alert('Invalid email or password!');
    }
  }
  
  public userSignup(): void {
  
    // Get the form data
    const { email, name, mobile, password } = this.signupForm.value;
  
    // Fetch stored users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  
    // Check if the email or mobile already exists
    const existingUser = storedUsers.find(
      (u: any) => u.email === email || u.mobile === mobile
    );
  
    if (existingUser) {
      alert('User with this email or mobile number already exists!');
      return;
    }
  
    // Add the new user to the stored users
    const newUser = { email, name, mobile, password };
    storedUsers.push(newUser);
  
    // Save back to localStorage
    localStorage.setItem('users', JSON.stringify(storedUsers));
  
    alert('Signup successful! Please login to continue.');
    this.toggleForm(); // Switch to login form
  }
  

}