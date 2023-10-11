import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Employee } from './model/employee.model';
import { EmployeeService } from './services/employee.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('fileInput') fileInput: any;
  @ViewChild('addEmployeeButton') addEmployeeButton: any;
  public sidebarShow: boolean = false;
  employees: Employee[];
  employeesToDisplay: Employee[];
  employeeForm: FormGroup;
  actionButton: string;
  editData: Boolean = false;
  empId: number | undefined;
  outdatedEmployeeDetail: Employee;
  imageUrl = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {
    this.actionButton = 'Insert';
    this.employeeForm = fb.group({});
    this.employees = [];
    this.employeesToDisplay = [];
    this.outdatedEmployeeDetail = {
      firstname: '',
      lastname: '',
      birthdate: '',
      gender: '',
      education: '',
      profile: '',
    };
  }

  educationOptions = [
    '10th pass',
    'diploma',
    'graduate',
    'post graduate',
    'PhD',
  ];

  ngOnInit(): void {
    this.actionButton = 'Insert';
    this.editData = false;
    this.employeeForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthday: ['', Validators.required],
      gender: ['m', Validators.required],
      education: ['default', Validators.required],
      profile: ['', Validators.required],
    });

    this.employeeService.getEmployees().subscribe((res) => {
      for (let emp of res) {
        this.employees.unshift(emp);
      }
      this.employeesToDisplay = this.employees;
    });
  }

  closeModal() {
    this.clearForm();
  }

  onselectFile(e: any) {
    if (e.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.imageUrl = event.target.result;
      };
    }
  }

  updateProduct() {
    let updatedEmployeeDetail: Employee = {
      firstname: this.FirstName.value,
      lastname: this.LastName.value,
      birthdate: this.BirthDay.value,
      gender: this.Gender.value,
      education: this.educationOptions[parseInt(this.Education.value)],
      profile: this.imageUrl,
      id: this.outdatedEmployeeDetail.id,
    };
    if (this.employeeForm.valid) {
      this.employeeService
        .putProduct(
          updatedEmployeeDetail,
          this.outdatedEmployeeDetail.id?.toString() ?? '0'
        )
        .subscribe((res) => {
          let index = this.employees.indexOf(this.outdatedEmployeeDetail);
          this.employees[index] = res as Employee;
        });
    }
    this.clearForm();
  }

  addEmployee() {
    if (!this.editData) {
      if (this.employeeForm.valid) {
        let employee: Employee = {
          firstname: this.FirstName.value,
          lastname: this.LastName.value,
          birthdate: this.BirthDay.value,
          gender: this.Gender.value,
          education: this.educationOptions[parseInt(this.Education.value)],
          profile: this.imageUrl,
        };
        this.employeeService.postEmployee(employee).subscribe((res) => {
          this.employees.unshift(res);
          this.clearForm();
        });
      }
      this.sidebarShow = false;
    } else {
      this.updateProduct();
    }
  }

  removeEmployee(event: any) {
    this.employees.forEach((val, index) => {
      if (val.id === parseInt(event)) {
        this.employeeService.deleteEmployee(event).subscribe((res) => {
          this.employees.splice(index, 1);
        });
      }
    });
  }

  setForm(emp: Employee) {
    this.actionButton = 'Edit';
    this.FirstName.setValue(emp.firstname);
    this.LastName.setValue(emp.lastname);
    this.BirthDay.setValue(emp.birthdate);
    this.Gender.setValue(emp.gender);

    let educationIndex = 0;
    this.educationOptions.forEach((val, index) => {
      if (val === emp.education) educationIndex = index;
    });
    this.Education.setValue(educationIndex);
    this.fileInput.nativeElement.value = '';
  }

  editEmployee(event: any) {
    this.employees.forEach((val, index) => {
      if (val.id === parseInt(event)) {
        this.setForm(val);
        this.outdatedEmployeeDetail = val;
      }
    });
    this.addEmployeeButton.nativeElement.click();
    this.editData = true;
  }

  clearForm() {
    this.actionButton = 'Insert';
    this.FirstName.setValue('');
    this.LastName.setValue('');
    this.BirthDay.setValue('');
    this.Gender.setValue('');
    this.Education.setValue('');
    this.fileInput.nativeElement.value = '';
  }

  searchEmployees(event: any) {
    let filteredEmployees: Employee[] = [];
    if (event === '') {
      this.employeesToDisplay = this.employees;
    } else {
      filteredEmployees = this.employees.filter((val, index) => {
        let targetKey =
          val.firstname.toLowerCase() + '' + val.lastname.toLocaleLowerCase();
        let searchKey = event.toLowerCase();
        return targetKey.includes(searchKey);
      });
      this.employeesToDisplay = filteredEmployees;
    }
  }

  public get FirstName(): FormControl {
    return this.employeeForm.get('firstname') as FormControl;
  }
  public get LastName(): FormControl {
    return this.employeeForm.get('lastname') as FormControl;
  }
  public get BirthDay(): FormControl {
    return this.employeeForm.get('birthday') as FormControl;
  }
  public get Gender(): FormControl {
    return this.employeeForm.get('gender') as FormControl;
  }
  public get Education(): FormControl {
    return this.employeeForm.get('education') as FormControl;
  }
}
