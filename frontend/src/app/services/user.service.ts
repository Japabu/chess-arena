import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private apiService: ApiService, private http: HttpClient) {}

  getUsers(): Observable<{ users: User[] }> {
    return this.apiService.get<{ users: User[] }>('admin/users');
  }

  getUserById(id: number): Observable<User> {
    return this.apiService.get<User>(`users/${id}`);
  }

  createUser(userData: Partial<User>): Observable<User> {
    return this.apiService.post<User>('users', userData);
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, {
      username,
      password,
    });
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.apiService.put<User>(`users/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.apiService.delete<any>(`admin/users/${id}`);
  }

  bulkDeleteUsers(userIds: number[]): Observable<any> {
    return this.apiService.post<any>('admin/users/bulk-delete', { userIds });
  }
}
