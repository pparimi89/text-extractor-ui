import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { Table, TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { MatToolbarModule } from '@angular/material/toolbar';  // Import MatToolbarModule
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpClient
import { error } from 'console';


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
  imports: [RouterModule, MatToolbarModule, FormsModule, CommonModule, IconFieldModule, InputIconModule, TableModule, FileUploadModule, ButtonModule, ProgressBarModule, ConfirmDialogModule, DropdownModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [ConfirmationService,]

})
export class HomeComponent implements OnInit {
  files: FilePreview[] = [];
  uploadProgress: number = 0;
  isUploading: boolean = false;

  totalSize: number = 0;
  totalSizePercent: number = 0;

  categoryList: any[] = [
    { name: 'Petrol Bill', code: 'petrolBill' },
    { name: 'Grocery Bill', code: 'GroceryBill' },
    { name: 'Ration Bill', code: 'rationBill' },
  ];

  tableData: any[] = [];
  selectedItem: string = "";
  selectedRows: any[] = []; // This holds the selected rows


  loading: boolean = true;
  searchValue: string = '';
  @ViewChild('dt2') dt2!: Table; // Using the @ViewChild decorator to get the reference
  userName: any;

  constructor(private router: Router, private dialogService: ConfirmationService,private http:HttpClient) { }

  ngOnInit(): void {
    let userData = localStorage.getItem("users");
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      if (Array.isArray(parsedUserData) && parsedUserData.length > 0) {
        this.userName = parsedUserData[0].name;
      }
    } else {
      this.router.navigate(['/signin']);
    }

    const storedOCRData = localStorage.getItem('ocr');
    if (storedOCRData) {
      this.tableData = JSON.parse(storedOCRData);
    }
    console.log("table", this.tableData);

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
    fileInput.multiple = true;

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
          this.confirm2();
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

  private confirm2() {
    this.dialogService.confirm({
      message: 'Do you want to Add this record ?',
      header: 'Save Confirmation',
      acceptButtonStyleClass: "p-button-sm ",
      rejectButtonStyleClass: "p-button-text mr-2",

      accept: () => {
        const payload = {
          id: Math.floor(Math.random() * 1000) + 1, // generating Random ID
          name: this.userName,
          category: this.selectedItem,
          fileAmount: Math.floor(Math.random() * 500) + 100, //generating Random fileAmount
        };
        console.log("payload", payload);
        this.tableData.push(payload);
        localStorage.setItem("ocr", JSON.stringify(this.tableData));
        this.selectedItem == null;
      },
      reject: () => {

      }
    });
  }

  private uploadPayload(): void {
    const formData = new FormData();
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    // Append files to formData
    this.files.forEach((file) => {
      formData.append('files', file.file);
    });

    // Add selected category and other data
    formData.append('category', this.selectedItem);
    formData.append('userName', this.userName);    
    // Make POST request
    this.http
      .post<any>('https://dummy-api.com/upload', formData,).subscribe({
        next : res => {
          if (res) {
            console.log("response",res);
            
          } else {
            throw new Error(res.message || 'Unknown error occurred.');
          }
        },error : err => {
          throw new Error(err.message || 'Unknown error occurred.');
        }
      }
    )
  }

  filterGlobal(event: Event, filterType: string): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchValue = inputElement?.value || '';
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
    let currentY = 20;

    // Title
    doc.setFontSize(16);
    doc.text('Table Data Export', pageWidth / 2, 10, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Code', marginX, currentY);
    doc.text('User Name', marginX + 30, currentY);
    doc.text('Category', marginX + 80, currentY);
    doc.text('Amount', marginX + 130, currentY);
    currentY += 10;

    doc.setFontSize(10);
    const rowsToExport = this.selectedRows.length > 0 ? this.selectedRows : this.tableData;

    rowsToExport.forEach((data) => {
      doc.text(data.id.toString(), marginX, currentY);
      data.name ? doc.text(data.name, marginX + 30, currentY) : '';
      doc.text(data.category, marginX + 80, currentY);
      doc.text(data.fileAmount.toString(), marginX + 130, currentY);
      currentY += 10;

      // Add new page if necessary
      if (currentY > doc.internal.pageSize.getHeight() - 10) {
        doc.addPage();
        currentY = 20;
      }
    });
    doc.save('table-data.pdf');

  }

  public logout(): void {
    this.router.navigate(['/signin']);
  }

}