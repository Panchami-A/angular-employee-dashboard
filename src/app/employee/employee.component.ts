import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Employee } from '../model/employee.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit {
  @Input() employeesToDisplay: Employee[];
  @Output() onRemoveEmployee = new EventEmitter<number>();
  @Output() onEditEmployee = new EventEmitter<number>();
  constructor() {
    this.employeesToDisplay = [];
  }
  ngOnInit(): void {
    
  }
  deleteEmployeeClicked(employee: Employee) {
    this.onRemoveEmployee.emit(employee.id);
  }
  editEmployeeClicked(employee: Employee) {
    this.onEditEmployee.emit(employee.id);
  }
}
