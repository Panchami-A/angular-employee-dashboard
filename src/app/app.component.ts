import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Employee } from "./model/employee.model";
import { EmployeeService } from "./services/employee.service";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  @ViewChild("fileInput") fileInput: any;
  @ViewChild("addEmployeeButton") addEmployeeButton: any;
  employees: Employee[];
  employeesToDisplay: Employee[];
  employeeForm: FormGroup;
  actionButton: string;
  editData: Boolean = false;
  empId: number | undefined;
  outdatedEmployeeDetail: Employee;
  imageUrl = "";
  currentPage = 1;
  itemsPerPage = 5;
  setSearching = false;
  today: string | null;
  fallbackImageURL = "../assets/images/blank-image.jpg";

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private datePipe: DatePipe
  ) {
    this.actionButton = "Insert";
    this.employeeForm = fb.group({});
    this.employees = [];
    this.employeesToDisplay = [];
    this.outdatedEmployeeDetail = {
      id: 0,
      firstname: "",
      lastname: "",
      birthdate: "",
      gender: "",
      education: "",
      profile: "",
    };
    this.today = this.datePipe.transform(new Date(), "yyyy-MM-dd");
  }

  educationOptions = [
    "Secondary education",
    "Diploma",
    "Bachelor's degree",
    "Master's degree",
    "Doctorate or higher",
  ];

  ngOnInit(): void {
    this.actionButton = "Insert";
    this.editData = false;
    this.employeeForm = this.fb.group({
      id: [0, Validators.required],
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      birthday: ["1950-01-01", Validators.required],
      gender: ["m", Validators.required],
      education: ["default", Validators.required],
      profile: [""],
    });

    this.employeeService.getEmployees().subscribe((res) => {
      for (let emp of res) {
        this.employees.unshift(emp);
      }
      this.employeesToDisplay = this.employeesDisplay();
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

  updateEmployee() {
    let updatedEmployeeDetail: Employee = {
      id: this.outdatedEmployeeDetail.id,
      firstname: this.FirstName.value,
      lastname: this.LastName.value,
      birthdate: this.BirthDay.value,
      gender: this.Gender.value,
      education: this.educationOptions[parseInt(this.Education.value)],
      profile:
        this.imageUrl.length > 0
          ? this.imageUrl
          : this.outdatedEmployeeDetail.profile,
    };
    this.employeeService
      .putProduct(
        updatedEmployeeDetail,
        updatedEmployeeDetail.id?.toString() ?? "0"
      )
      .subscribe((res) => {
        let index = this.employees.indexOf(this.outdatedEmployeeDetail);
        this.employees[index] = res as Employee;
        this.employeesToDisplay = this.employeesDisplay();
      });
    this.clearForm();
  }

  addEmployee() {
    if (!this.editData) {
      const newEmployeeId = this.Id.value;
      const employeeExists = this.employees.some(
        (employee) => employee.id === newEmployeeId
      );
      if (employeeExists) {
        alert(
          "Employee with this ID already exists. Please use a different ID."
        );
      } else {
        if (this.employeeForm.valid) {
          let employee: Employee = {
            id: this.Id.value,
            firstname: this.FirstName.value,
            lastname: this.LastName.value,
            birthdate: this.BirthDay.value,
            gender: this.Gender.value,
            education: this.educationOptions[parseInt(this.Education.value)],
            profile: this.imageUrl ? this.imageUrl : this.fallbackImageURL,
          };
          this.employeeService.postEmployee(employee).subscribe((res) => {
            this.employees.unshift(res);
            this.employeesToDisplay = this.employeesDisplay();
            this.clearForm();
          });
        } else {
          alert("Please provide all the details");
        }
      }
    } else {
      this.updateEmployee();
    }
  }

  removeEmployee(event: any) {
    this.employees.forEach((val, index) => {
      if (parseInt((val.id ?? "")?.toString()) === parseInt(event)) {
        this.employeeService.deleteEmployee(event).subscribe((res) => {
          this.currentPage = 1;
          this.employees.splice(index, 1);
          this.employeesToDisplay = this.employeesDisplay();
        });
      }
    });
  }

  setForm(emp: Employee) {
    this.actionButton = "Edit";
    console.log(emp);
    this.Id.setValue(emp.id);
    this.FirstName.setValue(emp.firstname);
    this.LastName.setValue(emp.lastname);
    this.BirthDay.setValue(emp.birthdate);
    this.Gender.setValue(emp.gender);

    let educationIndex = 0;
    this.educationOptions.forEach((val, index) => {
      if (val === emp.education) educationIndex = index;
    });
    this.Education.setValue(educationIndex);
    this.fileInput.nativeElement.value = "";
    this.imageUrl = "";
  }

  editEmployee(event: any) {
    console.log("click confirmed", event);
    this.employees.forEach((val, index) => {
      console.log(
        "click confirmed",
        parseInt(event),
        parseInt((val.id ?? "")?.toString())
      );
      if (parseInt((val.id ?? "")?.toString()) === parseInt(event)) {
        this.setForm(val);
        this.outdatedEmployeeDetail = val;
      }
    });
    this.addEmployeeButton.nativeElement.click();
    this.editData = true;
  }

  clearForm() {
    this.actionButton = "Insert";
    this.editData = false;
    this.Id.setValue(0);
    this.FirstName.setValue("");
    this.LastName.setValue("");
    this.BirthDay.setValue("1950-01-01");
    this.Gender.setValue("m");
    this.Education.setValue("");
    this.fileInput.nativeElement.value = "";
    this.setSearching = false;
  }

  searchEmployees(event: any) {
    let filteredEmployees: Employee[] = [];
    if (event === "") {
      this.employeesToDisplay = this.employeesDisplay();
    } else {
      this.setSearching = true;
      filteredEmployees = this.employees.filter((val, index) => {
        let targetKey =
          val.firstname.toLowerCase() + " " + val.lastname.toLocaleLowerCase();
        let searchKey = event.toLowerCase();
        return targetKey.includes(searchKey);
      });
      this.employeesToDisplay = filteredEmployees;
    }
  }

  changePage(newPage: any): void {
    this.currentPage = newPage;
    this.employeesToDisplay = this.employeesDisplay();
  }

  employeesDisplay() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.employees.slice(startIndex, endIndex);
  }

  filteredEmployeesDisplay(filteredEmployees: Employee[]) {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }

  downloadEmployeesPdf() {
    this.employeeService.generatePDFData(this.employees);
  }

  downloadEmployeesExcel() {
    this.employeeService.generateExcelData(this.employees);
  }

  get totalPages(): number {
    return Math.ceil(this.employees.length / this.itemsPerPage);
  }

  public get Id(): FormControl {
    return this.employeeForm.get("id") as FormControl;
  }
  public get FirstName(): FormControl {
    return this.employeeForm.get("firstname") as FormControl;
  }
  public get LastName(): FormControl {
    return this.employeeForm.get("lastname") as FormControl;
  }
  public get BirthDay(): FormControl {
    return this.employeeForm.get("birthday") as FormControl;
  }
  public get Gender(): FormControl {
    return this.employeeForm.get("gender") as FormControl;
  }
  public get Education(): FormControl {
    return this.employeeForm.get("education") as FormControl;
  }
}
