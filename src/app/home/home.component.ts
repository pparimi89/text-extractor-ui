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
  imageLogo: string = "";

  constructor(private dialog: MatDialog, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.imageLogo = "../assets/logo.jpeg";
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

  private getUserBillData(userId: any): void {
    const paylaod = {
      userId: userId
    };
    this.http.post<any>(`${constants.baseUrl}user-bill-info`, paylaod).subscribe({
      next: res => {
        if (res && res.code === "000") {
          this.tableData = res.data;
          console.log(this.tableData);

        }
      }, error: err => {
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
    } else {
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

  private openConfirmationDialog(): void {
    const payload = {
      userId: this.userId,
      categoryId: this.selectedItem,
      amount: this.fileAmount
    };
    console.log("payload", payload);

    const dialogRef = this.dialog.open(ConfirmationComponent, {
      data: payload,
      width: '400px',
      disableClose: true,
      position: { top: '0px' },
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 10;
    const marginY = 10;
    const rowHeight = 10;
    let imageTopSpace = 0; // using this space should be removed


    const firstTableWidths = [115, 70];
    const secondTableWidths = [55, 130];
    const columnWidths = [15,45, 35, 50, 40]; // Column widths for the third table

    let currentY = marginY;

    // Add Image at the top (Centered)
    const imageUrl = this.imageLogo; // Replace with your image URL or base64 string
    const imageWidth = 30;
    const imageHeight = 30;
    const imageX = (pageWidth - imageWidth) / 2;
    doc.addImage(imageUrl, 'JPEG', imageX, imageTopSpace, imageWidth, imageHeight);

    currentY += imageHeight + 2; // Move Y position after the image

    // Add Headings
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", pageWidth / 2, currentY, { align: "center" });

    currentY += 10;
    doc.setFontSize(14);
    doc.text("ThirdEye IT Consulting Services (Pty) Ltd", pageWidth / 2, currentY, { align: "center" });

    currentY += 15;

    // First Table
    const firstTable = [
      ["Reg No : 2018/589295/07", "Date: 10th June 2024"],
      ["VAT REG NO : 4840286589", "Invoice No: TECSNCSK03"],
      ["Address : Fleetwood Estate,", " "],
      ["                 Turley Road, Lone hill Four ways,", " "],
      ["                 Johannesburg , Gauteng", " "],
      ["Tel :         +27 746603186", "TECSNCSK03"],
      ["Fax: ", " "]
    ];

    currentY = this.addTable(doc, firstTable, firstTableWidths, currentY, marginX, rowHeight, pageHeight);
    currentY += 30;

    // Add Customer label
    if (currentY + rowHeight > pageHeight) {
      doc.addPage();
      currentY = marginY;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Customer : ", marginX, currentY);

    // Second Table
    const secondTable = [
      [" Name: ", "NTIYISO CONSULTING"],
      [" Address:", "BLD 3 AND 4 STANFORD OFFICE PARK"],
      ["            ", "12 BAUHINIA STREET"],
      [" City :", "HIGHVELD TECHNOPARK CENTURION GAUTENG "],
      [" Zip Code :", "0157"],
      [" Phone :", "012 940 5435"],
      [" Company Reg No :", "2018/560868/07"],
      [" Vat No :", "4450218435"]
    ];

    currentY += 5;
    currentY = this.addTable(doc, secondTable, secondTableWidths, currentY, marginX, rowHeight, pageHeight);

    currentY += this.addFooter(doc, pageWidth, pageHeight);
    currentY += 25;
    

    // Third Table (Headers)
    const headers = ['S. No', 'Category', 'Price', 'Quantity', 'Amount'];
    if (currentY + rowHeight > pageHeight) {
      doc.addPage();
      currentY = marginY;
    }
    this.drawRow(doc, headers, columnWidths, currentY, marginX, rowHeight, true);
    currentY += rowHeight;

    // Third Table (Data)
    const rowsToExport = this.selectedRows.length > 0 ? this.selectedRows : this.tableData;
    let totalAmount = 0;
    rowsToExport.forEach((data, index) => {
      const rowAmount = parseFloat(data.amount) * parseFloat(data.quantity || "1") || 0; // Calculate the row amount
    totalAmount += rowAmount; // Add to the total

      const row = [
        (index + 1),
        data.categoryName || '',       
        "R"+data.amount || "N/A",
        data.quantity || "1",
        "R"+(1 * data.amount).toFixed(2) || "N/A"
      ];

      if (currentY + rowHeight > pageHeight) {
        doc.addPage();
        currentY = marginY;
      }
      this.drawRow(doc, row, columnWidths, currentY, marginX, rowHeight, false);
      currentY += rowHeight;
    });
    if (currentY + rowHeight > pageHeight) {
      doc.addPage();
      currentY = marginY;
    }
    const totalRow = [
      '', // S. No
      '', // Category
      '', // Price
      'Total', // Quantity (used as the label)
      'R'+totalAmount.toFixed(2) // Total Amount
    ];
    this.drawRow(doc, totalRow, columnWidths, currentY, marginX, rowHeight, true);  

    // Add the Payment Details table
    currentY = this.addPaymentDetailsTable(doc, currentY + 20, marginX, pageWidth, pageHeight);
  
    this.addFooter(doc, pageWidth, pageHeight);

    // Save the PDF (single download for all pages)
    doc.save("invoice.pdf");
  }

  addPaymentDetailsTable(doc: any, currentY: number, marginX: number, pageWidth: number, pageHeight: number) {
    const rowHeight = 10;
    const columnWidths = [50, pageWidth - 50 - marginX * 2]; // Adjust widths to match the table layout
  
    // Check for page break before drawing the table
    if (currentY + rowHeight * 5 > pageHeight) {
      doc.addPage();
      currentY = 10;
    }
  
    // Add table title
    const title = "Payment Details";
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, currentY + rowHeight / 2, { align: "center" });
    currentY += rowHeight;
  
    // Table Data
    const tableData = [
      ["Bank:", "FNB"],
      ["A/C Name:", "THIRDEYE IT CONSULTING SERVICES"],
      ["A/C No.", "62797746876"],
      ["A/C Type", "Business Account"],
    ];
  
    // Draw the rows
    tableData.forEach((row) => {
      let currentX = marginX;
  
      row.forEach((cell, index) => {
        doc.setFont("helvetica", index === 0 ? "bold" : "normal");
        doc.text(cell, currentX + 2, currentY + rowHeight / 2 + 3, { align: "left" }); // Add padding and alignment
        doc.rect(currentX, currentY, columnWidths[index], rowHeight); // Draw cell borders
        currentX += columnWidths[index];
      });
  
      currentY += rowHeight;
    });
  
    return currentY; // Return the updated Y position
  }
  
  // Helper function to add a table
  addTable(doc: any, tableData: any, columnWidths: any, currentY: any, marginX: any, rowHeight: any, pageHeight: any) {
    tableData.forEach((row: any) => {
      if (currentY + rowHeight > pageHeight) {
        doc.addPage();
        currentY = marginX;
      }
      this.drawRow(doc, row, columnWidths, currentY, marginX, rowHeight, false);
      currentY += rowHeight;
    });
    return currentY;
  }

  // Helper function to draw a row
  drawRow(doc: any, row: any, columnWidths: any, currentY: any, marginX: any, rowHeight: any, isHeader: any) {
    let currentX = marginX;

    row.forEach((cell: any, index: any) => {
      const cellText = cell !== null && cell !== undefined ? String(cell) : '';

      doc.setFont("helvetica", isHeader ? "bold" : "normal");
      doc.text(
        cellText,
        currentX + 2, // Adding a small padding of 2 units from the left
        currentY + rowHeight / 2 + 3,
        { align: 'left' } // Align text to the left
      ); doc.rect(currentX, currentY, columnWidths[index], rowHeight);
      currentX += columnWidths[index];
    });
  }

  addFooter(doc: any, pageWidth: number, pageHeight: number) {
    const footerY = pageHeight - 20; // Position the footer 20 units from the bottom
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100); // Gray text color
  
    // Footer content
    const footerText = [
      "ThirdEye IT Consulting Services (Pty) Ltd",
      "Reg. No.: 2018/589295/07, 51 Turley Road, Lonehill, Sandton 2191.",
      "Contact Tel: +27 110837910,    Email: za.hr@thirdeyeitconsulting.com",
      "Website: https://thirdeyeit.co.za"
    ];
  
    // Draw footer lines
    footerText.forEach((line, index) => {
      doc.text(line, pageWidth / 2, footerY + index * 5, { align: "center" });
    });
    doc.setTextColor(0); // Default color: black
    return footerY;
  }

  public logout(): void {
    localStorage.removeItem("users");
    this.router.navigate(['/signin']);
  }

}