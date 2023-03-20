import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatSelectModule } from '@angular/material/select'
import { MatSortModule } from '@angular/material/sort'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'

@NgModule({
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}}
  ],
  declarations: [],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatIconModule,
    MatInputModule
  ],
  exports: [
    MatSnackBarModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatIconModule,
    MatInputModule
  ]
})
export class MaterialDesignModule { }
