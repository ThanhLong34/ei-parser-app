import { Component, inject } from '@angular/core';
import { ParserService } from '../../services/parser.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.component.html',
})
export class LoadingComponent {
  private parserService = inject(ParserService);

  get loading() {
    return this.parserService.loading;
  }

  cancelRequest() {
    this.parserService.cancelGetParcelData()
  }
}
