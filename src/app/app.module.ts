import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// App Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Shared Components
import { LayoutComponent } from './shared/components/layout/layout.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { SharedModule } from './shared/shared.module';

// Services
import { AuthService } from './core/services/auth.service';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { SuccessInterceptor } from './core/interceptors/success.interceptor';
import { ThemeService } from './core/services/theme.service';
import { UserFormDialogComponent } from './dialogs/user-form-dialog/user-form-dialog.component';
import { StructureFormDialogComponent } from './dialogs/structure-form-dialog/structure-form-dialog.component';
import { NomenclatureFormDialogComponent } from './dialogs/nomenclature-form-dialog/nomenclature-form-dialog.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    
    // Material Modules
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    
    // Shared Module
    SharedModule,
    
    // App Routing
    AppRoutingModule,
    
    // Standalone Components
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    SidenavComponent,
    UserFormDialogComponent,
    StructureFormDialogComponent,
    NomenclatureFormDialogComponent
  ],
  providers: [
    AuthService,
    ThemeService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SuccessInterceptor, multi: true }
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ]
})
export class AppModule { }
