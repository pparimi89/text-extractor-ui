import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router, RouterModule } from '@angular/router';
  
@Component({
  selector: 'app-root',
  standalone: true,
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
  imports: [
    RouterModule,CommonModule
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ocr-app';
  isLoading: boolean = true;

  constructor(private router: Router,private cdRef:ChangeDetectorRef,){}


  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationError) {
        setTimeout(() => {
          this.isLoading = false;
        }, 1500); 
        this.cdRef.detectChanges();
      }
    });
  }
}
