import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../model/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  baseUrl = 'http://localhost:3000/api/posts';
  constructor(private http: HttpClient) {
  }

  getEmployees() {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  postEmployee(employee: Employee) {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  deleteEmployee(id: string) {
    return this.http.delete(this.baseUrl + '/' + id);
  }

  putProduct(employee: Employee, id: string) {
    return this.http.put(this.baseUrl + '/' + id, employee);
  }
}
