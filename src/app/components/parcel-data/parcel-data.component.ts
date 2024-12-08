import { Component, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParserService } from '../../services/parser.service';

@Component({
  selector: 'app-parcel-data',
  imports: [CommonModule],
  templateUrl: './parcel-data.component.html',
})
export class ParcelDataComponent {
  private parserService = inject(ParserService);

  parcelData$ = this.parserService.parcelData$;

  get isShow() {
    return this.parserService.isShowParcelDataDrawer;
  }

  showDrawer(isShow: boolean) {
    this.parserService.showParcelDataDrawer(isShow);
  }

  copy(btnRef: HTMLSpanElement, textareaRef: HTMLTextAreaElement) {
    textareaRef.select()

    textareaRef.setSelectionRange(0, 99999) // For mobile
    navigator.clipboard.writeText(textareaRef.value)
      .then(() => {
        btnRef.innerText = 'Copied!';
        setTimeout(() => {
          btnRef.innerText = 'Copy';
        }, 3000)
      })
  }
}
