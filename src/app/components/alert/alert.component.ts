import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  imports: [
    CommonModule,
  ],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  @Input({ required: true }) isShow = false;
  @Input({ required: true }) message = '';

  @Output() isShowChange = new EventEmitter<boolean>()

  confirm() {
    this.isShowChange.emit(false);
  }
}
