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
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';


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
  imports: [CommonModule, NgxSpinnerModule, ReactiveFormsModule, IconFieldModule, InputIconModule, TooltipModule, InputTextModule],
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
  loadingSpinner: boolean = false;

  constructor(
    public toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.buildForm();
    this.logoImage = 'https://thirdeyeit.co.za/wp-content/uploads/elementor/thumbs/integration2-qdyy4xxyqnhr265hvn4g8s0sz1pn78o3i2jldhi58g.jpg';
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

  public togglePasswordSignUp(): void {
    this.showPassword = !this.showPassword;
    this.hidePassword = !this.hidePassword;
  }

  public togglePasswordLogin(): void {
    this.showPassword = !this.showPassword;
    this.hidePassword = !this.hidePassword;
  }

  public userLogin(): void {
    if (!this.loginForm.get('phoneOrEmail')?.value) {
      this.toastr.error("Please enter Email or Phone");
      return;
    }
    if (!this.loginForm.get('password')?.value) {
      this.toastr.error("Please enter password");
      return;
    }
    this.loginModel.phoneOrEmail = this.loginForm.get('phoneOrEmail')?.value;
    this.loginModel.password = this.loginForm.get('password')?.value;
    this.loadingSpinner = true;
    this.loadSpinner();
    this.http.post<any>(`${constants.baseUrl}fetch-user`, this.loginModel).subscribe({
      next: response => {
        if (response) {
          this.loadingSpinner=false;
          localStorage.setItem("users", JSON.stringify(response));
          this.router.navigate(['/home']);
        }
      }, error: err => {
        if (err.ok == false) {
          this.loadingSpinner = false;
        }
        this.toastr.error("Something went wrong!");
      }
    })
  }

  public userSignup(): void {
    if (!this.signupForm.get('name')?.value) {
      this.toastr.error("Please enter Name");
      return;
    }
    if (!this.signupForm.get('email')?.value) {
      this.toastr.error("Please enter Email");
      return;
    }if (!this.signupForm.get('mobile')?.value) {
      this.toastr.error("Please enter Phone");
      return;
    }
    if (!this.signupForm.get('password')?.value) {
      this.toastr.error("Please enter password");
      return;
    }
    this.signupModel.name = this.signupForm.get('name')?.value;
    this.signupModel.email = this.signupForm.get('email')?.value;
    this.signupModel.phone = this.signupForm.get('mobile')?.value;
    this.signupModel.password = this.signupForm.get('password')?.value;
    this.loadingSpinner=true;
    this.loadSpinner()
    this.http.post<any>(`${constants.baseUrl}create-user`, this.signupModel).subscribe({
      next: response => {
        if (response && response.code === "000") {
          this.loadingSpinner=false;
          this.toastr.success("User created successfully");
          this.toggleForm();
        } else {
          this.toastr.error("Failed to create User");
        }

      }, error: err => {
        if (err.ok == false) {
          alert("Something went wrong !")
        }
        this.toastr.error("Something went wrong!");
      }
    })

  }

  private loadSpinner(): void {
    if (this.loadingSpinner) {
      this.spinner.show(undefined, {
        type: 'ball-climbing-dot',
        bdColor: 'rgba(51,51,51,0.8)',
        fullScreen: true,
        color: 'fff',
        size: 'medium'
      })
    } else {
      this.loadingSpinner = false
    }

  }

}