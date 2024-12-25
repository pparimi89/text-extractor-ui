import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
  
@Component({
  selector: 'app-root',
  standalone: true,
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
  imports: [
    RouterModule
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ocr-app';
}
