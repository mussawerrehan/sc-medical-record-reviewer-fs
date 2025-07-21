import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from './button/button.component';
import { InputComponent } from './input/input.component';
import { 
  CardComponent, 
  CardHeaderComponent, 
  CardTitleComponent, 
  CardDescriptionComponent, 
  CardContentComponent,
  CardFooterComponent 
} from './card/card.component';
import { SelectComponent } from './select/select.component';
import { BadgeComponent } from './badge/badge.component';

@NgModule({
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    SelectComponent,
    BadgeComponent
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    SelectComponent,
    BadgeComponent
  ]
})
export class UiModule { } 