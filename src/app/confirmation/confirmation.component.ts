import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { constants } from '../app.config';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [MatDialogContent, NgxSpinnerModule, MatDialogActions, CommonModule, MatDividerModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',

})
export class ConfirmationComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ConfirmationComponent>, public spinner: NgxSpinnerService, private http: HttpClient, public toastr: ToastrService,) { }

  payload: any;
  loadingSpinner: boolean = false;


  ngOnInit(): void {
    console.log("data", this.data);
    this.payload = this.data;
  }

  onConfirmClick(): void {
    this.loadingSpinner = true;
    this.spinner.show(undefined, {
      type: 'ball-climbing-dot',
      bdColor: 'rgba(51,51,51,0.8)',
      fullScreen: true,
      color: '#fff',
      size: 'medium',
    });

    if (this.payload != null) {
      this.http.post<any>(`${constants.baseUrl}create-bill`, this.payload).subscribe({
        next: (res) => {

          if (res && res.code === "000") {
            this.spinner.hide();
            this.loadingSpinner = false;
            this.dialogRef.close(true);
            this.toastr.success("Bill Added Successfully");
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.loadingSpinner = false;
          this.toastr.error("Something went wrong!");
        },
      });
    }
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }

}
