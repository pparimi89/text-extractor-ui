import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { constants } from '../app.config';
import {MatDividerModule} from '@angular/material/divider';


@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, CommonModule,MatDividerModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',

})
export class ConfirmationComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ConfirmationComponent>, private http: HttpClient) { }

  payload: any;

  ngOnInit(): void {
    console.log("data", this.data);
    this.payload = this.data;
  }

  onConfirmClick(): void {
    if (this.payload != null) {
      this.http.post<any>(`${constants.baseUrl}create-bill`, this.payload).subscribe({
        next: res => {
          if (res && res.code==="000") {
            this.dialogRef.close(true);
          }
        }, error: err => {
          console.log("error", err);
        }
      },
      )
    }
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }

}
