import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { Table, TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { MatToolbarModule } from '@angular/material/toolbar';  // Import MatToolbarModule
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpClient
import { constants } from '../app.config';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from '../confirmation/confirmation.component';


// For dynamic progressbar demo
export interface FilePreview {
  file: File;
  previewUrl: string;
  name: string;
  type: string;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatDialogModule, FormsModule, CommonModule, IconFieldModule, InputIconModule, TableModule, FileUploadModule, ButtonModule, ProgressBarModule, ConfirmDialogModule, DropdownModule, NgClass],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: []

})
export class HomeComponent implements OnInit {
  @Input() isChecked: boolean = false; // Input to set the initial state
  @Output() changed = new EventEmitter<boolean>(); // Emit the toggle state

  files: FilePreview[] = [];
  uploadProgress: number = 0;
  isUploading: boolean = false;

  totalSize: number = 0;
  totalSizePercent: number = 0;

  tableData: any[] = [];
  selectedItem: string = "";
  selectedRows: any[] = []; // This holds the selected rows
  fileAmount?: string;


  loading: boolean = true;
  searchValue: string = '';
  @ViewChild('dt2') dt2!: Table; // Using the @ViewChild decorator to get the reference
  userName: any;
  userId?: number;
  categoryData: any[] = [];

  constructor(private dialog: MatDialog, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    let userData = localStorage.getItem("users");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      this.userName = parsedUserData.name;
      this.userId = parsedUserData.id;

    } else {
      this.router.navigate(['/signin']);
    }

    this.getCategories();
    this.getUserBillData(this.userId);
  }

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement; // Creating EventTarget as HTMLInputElement
    this.isChecked = target.checked; // Safely access the 'checked' property
    this.changed.emit(this.isChecked); // Emitting changes    
  }

  private getUserBillData(userId:any):void{
    const paylaod={
      userId:userId
    };
    this.http.post<any>(`${constants.baseUrl}user-bill-info`,paylaod).subscribe({
      next : res => {
        if (res && res.code==="000") {
          this.tableData = res.data;
          console.log(this.tableData);
          
        }
      },error : err=>{
        console.log(err);
        
      }
    })
  }

  private getCategories(): void {
    this.http.get<any>(`${constants.baseUrl}categories`).subscribe({
      next: res => {
        if (res && res.code === "000") {
          this.categoryData = res.data;
        }
      }, error: err => {
        console.log(err);
      }
    })
  }

  onCategoryChange(event: any) {
    console.log('Selected value:', event.value);
    this.selectedItem = event.value;
  }

  public chooseFiles(): void {
    if (!this.selectedItem) {
      alert("Please select Category");
      return;
    }
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,application/pdf';
    fileInput.multiple = false;

    fileInput.addEventListener('change', (event: any) => {
      this.handleFiles(event.target.files);
    });

    fileInput.click();
  }

  public handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  public handleDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  handleFiles(fileList: FileList): void {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.files.push({
          file: file,
          previewUrl: file.type.startsWith('image') ? (reader.result as string) : '',
          name: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  uploadFiles(): void {
    if (!this.selectedItem) {
      alert("Please select Category");
      return;
    }
    if (this.files.length > 0) {
      this.isUploading = true;
      this.uploadProgress = 0;

      const totalFiles = this.files.length;
      let uploadedCount = 0;

      const interval = setInterval(() => {
        if (uploadedCount < totalFiles) {
          uploadedCount++;
          this.uploadProgress = Math.round((uploadedCount / totalFiles) * 100);
        } else {
          clearInterval(interval);
          this.isUploading = false;
          console.log("uploaded completed");
          this.uploadPayload();
          this.clearFiles();
        }
      }, 500);
    }
  }


  removeFile(file: { file: File; name: string }): void {
    this.files = this.files.filter((f) => f !== file);
  }

  public clearFiles(): void {
    this.files = [];
    this.uploadProgress = 0;
  }



  private uploadPayload(): void {
    const formData = new FormData();
    // Append files to formData
    this.files.forEach((file) => {
      formData.append('file', file.file);
    });
    console.log("payload", formData);
    let apiUrl; 
    if (this.isChecked) {
      apiUrl = "extract-data";
    }else{
      apiUrl = "dummy-data-extract";
    }
    
    // Make POST request
    this.http
      .post<any>(`${constants.baseUrl}${apiUrl}`, formData).subscribe({
        next: res => {
          if (res) {
            console.log("response", res);
            this.fileAmount = res.totalAmount;
            this.openConfirmationDialog();
          } else {
            throw new Error(res.message || 'Unknown error occurred.');
          }
        }, error: err => {
          throw new Error(err.message || 'Unknown error occurred.');
        }
      }
      )
  }

  private openConfirmationDialog():void {
    const payload = {
      userId: this.userId,
      categoryId: this.selectedItem,
      amount: this.fileAmount
    };
    console.log("payload", payload);

    const dialogRef =  this.dialog.open(ConfirmationComponent,{
      data: payload,
      width:'400px',
      disableClose:true,
      position: { top: '0px' }, 
    })
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.getUserBillData(this.userId);
      }
    }
  );
  }

  filterGlobal(event: Event, filterType: string): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchValue = inputElement?.value;
    this.dt2.filterGlobal(this.searchValue, filterType);
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }

  exportTOPdf() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 10;
    const tableStartY = 20; // adjust height b/w table and heading
    const rowHeight = 10; 
    let currentY = tableStartY;
  
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('Expenses', pageWidth / 2, 15, { align: 'center' });
  
    // Table Headers
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const headers = ['User Bill Id', 'User Name', 'Category Name', 'Amount'];
    const columnWidths = [40, 50, 60, 40]; // Width for each column
    let currentX = marginX;
  
    // Draw headers and borders
    headers.forEach((header, index) => {
      // Draw header text centered
      doc.text(header, currentX + columnWidths[index] / 2, currentY + rowHeight / 2 + 3, {
        align: 'center',
      });
  
      // Draw header cell border
      doc.rect(currentX, currentY, columnWidths[index], rowHeight);
  
      currentX += columnWidths[index];
    });
  
    currentY += rowHeight; // Move to the next row for data
  
    // Table Data
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const rowsToExport = this.selectedRows.length > 0 ? this.selectedRows : this.tableData;
  
    rowsToExport.forEach((data) => {
      currentX = marginX;
  
      const row = [
        data.userBillId.toString(),
        this.userName || '', // Use this.userName if available
        data.categoryName,
        data.amount.toString(),
      ];
  
      // Draw data row with borders
      row.forEach((cell, index) => {
        // Draw cell text centered
        doc.text(cell, currentX + columnWidths[index] / 2, currentY + rowHeight / 2 + 3, {
          align: 'center',
        });
  
        // Draw cell border
        doc.rect(currentX, currentY, columnWidths[index], rowHeight);
  
        currentX += columnWidths[index];
      });
  
      currentY += rowHeight; // Move to the next row
  
      // Add new page if necessary
      if (currentY > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        currentY = tableStartY;
      }
    });
  
    doc.save('table-data.pdf');
  }
  

  public logout(): void {
    localStorage.removeItem("users");
    this.router.navigate(['/signin']);
  }

}