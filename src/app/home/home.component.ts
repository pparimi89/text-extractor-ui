import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { PrimeNGConfig } from 'primeng/api';
import { DropdownFilterOptions, DropdownModule } from 'primeng/dropdown';

// For dynamic progressbar demo
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, FileUploadModule, ButtonModule, ProgressBarModule,DropdownModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  files: { file: File; url: string; name: string; progress?: number }[] = [];

  totalSize: number = 0;
  totalSizePercent: number = 0;

  data:any[] = [
    { name: 'Petrol Bill', code: 'petrolBill' },
    { name: 'Grocery Bill', code: 'GroceryBill' },
    { name: 'Ration Bill', code: 'rationBill' },
    
  ];

  constructor(private router: Router, private config: PrimeNGConfig) { }

  ngOnInit(): void {
    let userData = localStorage.getItem("users");
    if (!userData) {
      this.router.navigate(['/singin']);
    }
  }

  choose(event: any, callback: any) {
    callback();
  }

  onRemoveTemplatingFile(event: any, file: File, removeFileCallback: any, index: any) {
    removeFileCallback(event, index);
    this.totalSize -= parseInt(this.formatSize(file.size));
    this.totalSizePercent = this.totalSize / 10;
  }

  onClearTemplatingUpload(clear: any) {
    clear();
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  onSelectedFiles(event: any) {
    this.files = event.currentFiles;
    this.files.forEach((file) => {
      this.totalSize += parseInt(this.formatSize(file.file.size));
    });
    this.totalSizePercent = this.totalSize / 10;
  }

  uploadEvent(callback: any) {
    callback();
  }

  formatSize(bytes: any) {
    const k = 1024;
    const dm = 3;
    const sizes: any = this.config.translation.fileSizeTypes;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
  }

}