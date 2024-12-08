import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Subject, takeUntil, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface IParcel {
  parcelIds: number[];
  mailboxId: string;
  connectionName: string;
  userName: string;
}

export interface GetParcelDataRequest {
  parcelUrl: string;
  sessionId: string;
  parcelIds: number[]
}

export interface GetParcelDataResponse {
  FileInfo: {
    ParcelID: number;
    FileName: string;
    FileDate: string;
    Bytes: number;
    Standard: string;
    ContentBase64String: string;
    routerArchive: boolean;
  };
  contentDecoded: string;
}

export interface ParseError {
  error: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParserService {
  private _http = inject(HttpClient)

  private _parcelInfoList = new BehaviorSubject<IParcel[]>([]);
  private _parcelData = new BehaviorSubject<GetParcelDataResponse | undefined>(undefined);
  private _isShowParcelDataDrawer = false;
  loading = false
  parseError?: ParseError;

  private _destroy$ = new Subject<void>();
  parcelInfoList$ = this._parcelInfoList.asObservable();
  parcelData$ = this._parcelData.asObservable();

  get isShowParcelDataDrawer() {
    return this._isShowParcelDataDrawer;
  }

  showParcelDataDrawer(isShow: boolean) {
    this._isShowParcelDataDrawer = isShow;
    this.disableBodyScroll(isShow)
  }

  updateParcelInfoList(list: IParcel[]) {
    this._parcelInfoList.next(structuredClone(list));
  }

  loadParcelInfoList() {
    console.log(this._parcelInfoList.value)
  }

  setParseError(errorMsg: string | undefined | null) {
    this.parseError = errorMsg ? {
      error: errorMsg,
    } : undefined;
  }

  getParcelData(data: GetParcelDataRequest) {
    this.loading = true;
    const url = 'https://ei-parser-api.netlify.app/.netlify/functions/api'

    return this._http.post<GetParcelDataResponse[]>(url, data)
      .pipe(
        takeUntil(this._destroy$),
        tap((parcels) => {
          if (!parcels.length) {
            throw new Error("Parcels not found.");
          }

          this._parcelData.next(parcels[0])
          this.loading = false;
          this.showParcelDataDrawer(true)

          return parcels
        }),
        catchError((err) => {
          this.loading = false;
          return throwError(() => err)
        })
      )
  }

  disableBodyScroll(isDisable: boolean) {
    if (isDisable) {
      document.body.style.cssText = 'overflow-y: hidden;';
    } else {
      document.body.style.cssText = '';
    }
  }

  cancelGetParcelData() {
    this._destroy$.next()
    this.loading = false;
  }
}
