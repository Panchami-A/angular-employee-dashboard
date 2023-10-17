import { Injectable, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Employee } from "../model/employee.model";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import * as ExcelJS from "exceljs";
import * as fs from "file-saver";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  baseUrl = "https://localhost:3000/api/posts";
  logoImage: string = "";
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.loadLogoImage();
  }

  getEmployees() {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  postEmployee(employee: Employee) {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  deleteEmployee(id: string) {
    return this.http.delete(this.baseUrl + "/" + id);
  }

  putProduct(employee: Employee, id: string) {
    return this.http.put(this.baseUrl + "/" + id, employee);
  }

  loadLogoImage() {
    fetch("assets/images/sde.png") // Update the path to your image
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.logoImage = reader.result as string;
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        console.error("Error loading logo image:", error);
      });
  }

  toTitleCase(text: string): string {
    return text
      .toLowerCase() // Convert the entire string to lowercase
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" ");
  }

  generatePDFData(employees: Employee[]): void {
    const documentDefinition: TDocumentDefinitions = {
      content: [
        { image: this.logoImage, alignment: "center", fit: [50, 50] },
        { text: "SDE Groups", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*", "*"],
            body: [
              [
                { text: "First Name", alignment: "center" },
                { text: "Last Name", alignment: "center" },
                { text: "Birthdate", alignment: "center" },
                { text: "Gender", alignment: "center" },
                { text: "Education", alignment: "center" },
                { text: "Profile", alignment: "center" },
              ],
              ...employees.map((employee) => [
                { text: employee.firstname, alignment: "center" },
                { text: employee.lastname, alignment: "center" },
                { text: employee.birthdate, alignment: "center" },
                {
                  text: employee.gender === "m" ? "Male" : "Female",
                  alignment: "center",
                },
                {
                  text: this.toTitleCase(employee.education),
                  alignment: "center",
                },
                {
                  image: employee.profile,
                  width: 50,
                  height: 50,
                  alignment: "center",
                },
              ]),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 15,
          bold: true,
          margin: [0, 0, 0, 20],
          alignment: "center",
        },
      },
    };

    pdfMake.createPdf(documentDefinition).download("employees.pdf");
  }

  generateExcelData(employees: Employee[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");
    // Define headers
    worksheet.addRow([
      "First Name",
      "Last Name",
      "Birthdate",
      "Gender",
      "Education",
      "Profile Image",
    ]);

    // Add employee data to the worksheet
    employees.forEach((employee) => {
      const row = worksheet.addRow([
        employee.firstname,
        employee.lastname,
        employee.birthdate,
        employee.gender === "m" ? "Male" : "Female",
        this.toTitleCase(employee.education),
      ]);
      row.height = 50;
      row.alignment = {
        vertical: "middle",
      };
      // Insert the profile image
      const lastRow = worksheet.lastRow;
      if (employee.profile) {
        const imageId = workbook.addImage({
          base64: employee.profile,
          extension: "png", // Change the file extension to match the image type
        });

        worksheet.addImage(imageId, {
          tl: { col: 5, row: lastRow ? lastRow.number - 1 : 0 }, // Specify the cell where the image should be inserted
          ext: { width: 50, height: 100 }, // Adjust the width and height as needed
        });
      }
    });

    // Save the workbook to a file
    workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fs.saveAs(blob, "employees.xlsx");

      console.log("Excel file generated successfully.");
    });
  }
}
