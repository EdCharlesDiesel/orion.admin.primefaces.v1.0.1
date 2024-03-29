// import {Component, OnInit} from '@angular/core';
// import {FormBuilder, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
// import {Router} from '@angular/router';
// import {UserPrincipalService} from "../../../services/user-principal.service";
// import {FormValidationService} from "../../../services/form-validation.service";
//
// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
//
//   form: FormGroup;
//
//   constructor(private formBuilder: FormBuilder,
//               private formValidationService: FormValidationService,
//               private userPrincipalService: UserPrincipalService,
//               private router: Router) {
//   }
//
//   ngOnInit(): void {
//     this.form = this.formBuilder.group({
//       nick: ['', [Validators.required]],
//     });
//   }
//
//   getError(key: string, form: FormGroupDirective): string {
//     const control = this.form.controls[key];
//     if (!(form.submitted || control.dirty || control.touched)) {
//       return null;
//     }
//     return this.formValidationService.getValidationMessage(control);
//   }
//
//   markAllAsDirty(formGroup: FormGroup) {
//     const controls = formGroup.controls;
//     for (const key in controls) {
//       if (controls.hasOwnProperty(key)) {
//         controls[key].markAsDirty();
//       }
//     }
//   }
//
//   onSubmit() {
//     if (!this.form.valid) {
//       this.markAllAsDirty(this.form);
//       return;
//     }
//     this.userPrincipalService.setNick(this.form.value.nick);
//     this.router.navigate(['/']);
//   }
//
// }
