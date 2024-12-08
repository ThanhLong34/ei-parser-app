import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { GetParcelDataRequest, IParcel, ParserService } from '../../services/parser.service';
import { CommonModule } from '@angular/common';
import JSONFormatter from 'json-formatter-js';
import { ConfigsService } from '../../services/configs.service';
import { AlertComponent } from '../alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-parser',
  imports: [CommonModule, AlertComponent],
  templateUrl: './parser.component.html',
})
export class ParserComponent implements OnInit {
  private configsService = inject(ConfigsService);
  private parserService = inject(ParserService);
  private changeDetector = inject(ChangeDetectorRef);

  parcelInfoList$ = this.parserService.parcelInfoList$
  isShow = false;
  isShowAlert = false;
  alertMessage = '';
  parcelIdElements: Element[] = []

  @ViewChild('jsonViewer') jsonViewer!: ElementRef<HTMLDivElement>;

  get parseError() {
    return this.parserService.parseError;
  }

  ngOnInit(): void {
    this.parcelInfoList$.subscribe(list => {
      if (!list.length) {
        return
      }

      this.isShow = true;
      this.changeDetector.detectChanges();

      this.renderJsonViewer(list);
    })
  }

  renderJsonViewer(data: IParcel[]) {
    this.removeEvents()

    const formatter = new JSONFormatter(data, 5);
    const viewer: HTMLDivElement = this.jsonViewer?.nativeElement;
    if (viewer) {
      viewer.innerHTML = '';
      viewer?.append(formatter.render());
    }

    this.initEvents()
  }

  selectParcel(parcelElement: Element) {
    if (!parcelElement.textContent) {
      this.showAlert('Missing select parcel ID')
      return
    }

    const data: GetParcelDataRequest = {
      parcelUrl: this.configsService.configs.parcelUrl,
      sessionId: this.configsService.configs.sessionId,
      parcelIds: [+(parcelElement.textContent.trim())],
    }
    this.parserService.getParcelData(data)
      .subscribe({
        next: (parcels) => {},
        error: (err: HttpErrorResponse) => {
          this.showAlert(err?.error ?? 'Parcel not found' + '. Please change Parcel URL in Configs.')
        }
      })
  }

  initEvents() {
    const numberElements = this.jsonViewer.nativeElement.querySelectorAll('.json-formatter-children .json-formatter-number');
    this.parcelIdElements = [...numberElements].filter(ele =>
      !ele.nextSibling && (<HTMLSpanElement>ele.previousSibling)?.className === 'json-formatter-key')

    this.parcelIdElements.forEach((parcelEle) => {
      parcelEle.addEventListener('click', () => this.selectParcel(parcelEle))
    })
  }

  removeEvents() {
    this.parcelIdElements.forEach((parcelEle) => {
      parcelEle.removeEventListener('click', () => this.selectParcel(parcelEle))
    })
  }

  showAlert(msg: string) {
    this.isShowAlert = true;
    this.alertMessage = msg;
  }
}
