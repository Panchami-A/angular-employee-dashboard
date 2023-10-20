import { AbstractControl, ValidationErrors } from "@angular/forms";
import { Employee } from "./model/employee.model";

export class CustomValidators {
  static containsNumberOrSpecialChars(
    control: AbstractControl
  ): ValidationErrors | null {
    const name = control.value;
    const pattern = /[0-9\s!@#$%^&*()_+[\]{};:'"|<>,./?\\\-]/;
    if (pattern.test(name)) {
      return { containsNumberOrSpecialChars: true };
    }
    return null;
  }

  static nameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (name && name.length < 2) {
      return { invalidName: true };
    }
    return null;
  }

  static lastNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (name && name.length < 1) {
      return { invalidName: true };
    }
    return null;
  }

  static birthdateValidator(control: AbstractControl): ValidationErrors | null {
    const birthdate = control.value;
    if (birthdate && !CustomValidators.isValidBirthdate(birthdate)) {
      return { invalidBirthdate: true };
    }
    return null;
  }

  static isValidBirthdate(birthdate: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      return false;
    }
    const birthdateDate = new Date(birthdate);
    const minDate = new Date(1950, 0, 1); // Adjust this as needed
    const maxDate = new Date(2010, 11, 31);
    return birthdateDate >= minDate && birthdateDate <= maxDate;
  }

  static educationValidator(control: AbstractControl): ValidationErrors | null {
    const selectedEducation = control.value;
    if (selectedEducation === "default") {
      return { invalidEducation: true };
    }
    return null;
  }

  static fileExtension(allowedExtensions: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      if (file) {
        const extension = control.value.split(".").pop() ?? "";
        if (!allowedExtensions.includes(extension)) {
          return { invalidExtension: true };
        }
      }
      return null;
    };
  }

  static idValidator(employees: Employee[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const id = control.value;
      const pattern = /^[0-9]+$/;
      const employeeExists = employees.some((employee) => employee.id === id);
      if (id && (id == 0 || !pattern.test(id))) {
        return { invalidId: true };
      } else if (id && employeeExists) {
        return { exists: true };
      }

      return null;
    };
  }
}
