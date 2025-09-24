import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor() { }

  getUsers(): Observable<User[]> {
    // Mock data for now
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN' as any,
        status: 'ACTIVE' as any,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return of(mockUsers);
  }

  getUser(id: string): Observable<User> {
    // Mock implementation
    return of({} as User);
  }

  createUser(user: Partial<User>): Observable<User> {
    // Mock implementation
    return of({} as User);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    // Mock implementation
    return of({} as User);
  }

  deleteUser(id: string): Observable<void> {
    // Mock implementation
    return of(void 0);
  }
}