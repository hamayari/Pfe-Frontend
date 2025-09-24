import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import { CreateUserRequest, UpdateUserRequest } from '../../../models/user.model';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  roles = [
    { value: 'ROLE_ADMIN', label: 'Administrateur' },
    { value: 'ROLE_COMMERCIAL', label: 'Commercial' },
    { value: 'ROLE_PROJECT_MANAGER', label: 'Chef de Projet' },
    { value: 'ROLE_DECISION_MAKER', label: 'Décideur' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { user?: any }
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      roles: ['', Validators.required]
    });
    // Pré-remplir si édition
    if (data && data.user) {
      this.userForm.patchValue({
        username: data.user.username,
        email: data.user.email,
        roles: data.user.roles && data.user.roles.length ? data.user.roles[0] : ''
      });
    }
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      if (this.data && this.data.user) {
        // Edition
        const updateData: UpdateUserRequest = {
          id: this.data.user.id,
          username: this.userForm.value.username,
          email: this.userForm.value.email,
          roles: [this.userForm.value.roles]
        };
        this.userService.updateUser(this.data.user.id, updateData).subscribe({
          next: (response) => {
            if (response.success) {
              this.dialogRef.close(response.data);
            }
          },
          error: (error) => {
            // Gérer l'erreur
          }
        });
      } else {
        // Création
        const createData: CreateUserRequest = {
          username: this.userForm.value.username,
          email: this.userForm.value.email,
          password: this.userForm.value.password,
          roles: [this.userForm.value.roles]
        };
        this.userService.createUser(createData).subscribe({
          next: (response) => {
            if (response.success) {
              this.dialogRef.close(response.data);
            }
          },
          error: (error) => {
            // Gérer l'erreur
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
