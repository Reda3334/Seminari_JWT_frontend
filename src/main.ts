import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { jwtInterceptor } from './app/services/auth.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ]
}).catch((err) => console.error(err));