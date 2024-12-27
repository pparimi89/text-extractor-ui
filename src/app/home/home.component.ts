import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { Table, TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import e from 'express';


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
  imports: [RouterModule, CommonModule, TableModule, FileUploadModule, ButtonModule, ProgressBarModule, ConfirmDialogModule, DropdownModule],
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

  loading: boolean = true;

  constructor(private router: Router, private dialogService: ConfirmationService) { }

  ngOnInit(): void {
    let userData = localStorage.getItem("users");
    const storedData = localStorage.getItem('ocr');
    if (storedData) {
      this.tableData = JSON.parse(storedData);
    }
    if (!userData) {
      this.router.navigate(['/singin']);
    }
    console.log("table", this.tableData);

  }

  onCategoryChange(event: any) {
    console.log('Selected value:', event.value);
    this.selectedItem = event.value;
  }

  chooseFiles(): void {
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

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  handleDrop(event: DragEvent): void {
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
          if (this.uploadProgress===100) {
            this.confirm2();
            this.clearFiles();
          }
        } else {
          clearInterval(interval);
          this.isUploading = false;
        }
      }, 500);
    }
  }


  removeFile(file: { file: File; name: string }): void {
    this.files = this.files.filter((f) => f !== file);
  }

  clearFiles(): void {
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
          category: this.selectedItem, 
          fileAmount: Math.floor(Math.random() * 500) + 100, //generating Random fileAmount
        };
        console.log("payload", payload);
        this.tableData.push(payload);
        localStorage.setItem("ocr", JSON.stringify(this.tableData));
        this.selectedItem==null;
      },
      reject: () => {

      }
    });
  }

}