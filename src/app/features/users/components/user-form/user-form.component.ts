import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { User, UserRole, UserStatus } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { finalize } from 'rxjs/operators';

export interface UserFormData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  roles: {value: string, label: string}[] = [];
  statuses: {value: string, label: string}[] = [];
  passwordHidden = true;
  showPasswordHint = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.pattern('^[0-9+\-\s()]*$'), Validators.maxLength(20)]],
      role: ['', [Validators.required]],
      status: ['', [Validators.required]],
      password: ['', this.data.mode === 'create' ? [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
      ] : []],
      confirmPassword: ['', this.data.mode === 'create' ? [Validators.required] : []]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  private loadFormData(): void {
    // Load roles and statuses
    this.userService.getRoles().subscribe(roles => this.roles = roles);
    this.userService.getStatuses().subscribe(statuses => this.statuses = statuses);

    // If in edit mode, patch form with user data
    if (this.data.mode === 'edit' && this.data.user) {
      const user = this.data.user;
      this.userForm.patchValue({
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: '',
        role: user.roles[0] || 'USER',
        status: user.status
      });

      // Disable email field in edit mode
      this.userForm.get('email')?.disable();
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.userForm.getRawValue();
    
    // Prepare user data
    const userData: Partial<User> = {
      name: `${formValue.firstName} ${formValue.lastName}`.trim(),
      email: formValue.email,
      roles: [formValue.role],
      status: formValue.status
    };

    // Add password only in create mode or if changed
    if (formValue.password) {
      (userData as any).password = formValue.password;
    }

    const request$ = this.data.mode === 'create'
      ? this.userService.createUser(userData)
      : this.userService.updateUser(this.data.user!._id || this.data.user!.id || '', userData);

    request$
      .pipe(
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving user:', error);
          // Handle specific errors (e.g., duplicate email)
          if (error.status === 409) {
            this.userForm.get('email')?.setErrors({ duplicate: true });
          } else {
            // Show error message
            // In a real app, you might want to show a more specific error message
            this.dialogRef.close(false);
          }
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Custom validator for password match
  private passwordMatchValidator(g: FormGroup): { [key: string]: any } | null {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  // Getter for easy access to form fields
  get f() {
    return this.userForm.controls;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.passwordHidden = !this.passwordHidden;
  }

  // Show password hint
  showPasswordRequirements(): void {
    this.showPasswordHint = true;
  }

  // Hide password hint
  hidePasswordRequirements(): void {
    this.showPasswordHint = false;
  }

  // Get error message for form field
  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.hasError('maxlength')) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    }

    if (control.hasError('pattern')) {
      if (controlName === 'password') {
        return 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character';
      }
      if (controlName === 'phone') {
        return 'Please enter a valid phone number';
      }
      return 'Invalid format';
    }

    if (control.hasError('duplicate')) {
      return 'This email is already in use';
    }

    if (control.hasError('mismatch')) {
      return 'Passwords do not match';
    }

    return 'Invalid field';
  }
}
