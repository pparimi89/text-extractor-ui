import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes} from '../app/app-routing.module';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideHttpClient(), provideAnimations(),provideAnimations(),provideToastr()]
};

export class constants {
  public static baseUrl = "https://text-extractor-446311.de.r.appspot.com/api/extract-data";
}