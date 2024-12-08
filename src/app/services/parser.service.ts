import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, Subject, takeUntil, tap, throwError } from 'rxjs';
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

const PARCEL_URL = 'https://ei-parser-api.netlify.app/.netlify/functions/api'

@Injectable({
  providedIn: 'root'
})
export class ParserService {
  private _http = inject(HttpClient)

  private _parcelInfoList = new BehaviorSubject<IParcel[]>([]);
  private _parcelData = new BehaviorSubject<GetParcelDataResponse | undefined>(undefined);
  private _isShowParcelDataDrawer = false;
  private _parcelList: GetParcelDataResponse[] = []
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

  loadParcelInfoListInBackground(data: GetParcelDataRequest) {
    data.parcelIds = this._parcelInfoList.value.reduce((acc: number[], cur) => {
      return [...acc, ...cur.parcelIds];
    }, [])
    return this._http.post<GetParcelDataResponse[]>(PARCEL_URL, data)
      .pipe(
        tap((parcels) => {
          this._parcelList = parcels;
          console.log('this._parcelList', this._parcelList)
          return parcels
        }),
        catchError((err) => {
          return throwError(() => err)
        })
      )
  }

  setParseError(errorMsg: string | undefined | null) {
    this.parseError = errorMsg ? {
      error: errorMsg,
    } : undefined;
  }

  getParcelData(data: GetParcelDataRequest) {
    const parcelExisting = this._parcelList.find(parcel => parcel.FileInfo.ParcelID === data.parcelIds[0])
    console.log('parcelExisting', parcelExisting)
    if (parcelExisting) {
      this._parcelData.next(parcelExisting)
      this.showParcelDataDrawer(true)
      return of([parcelExisting]);
    }

    this.loading = true;
    return this._http.post<GetParcelDataResponse[]>(PARCEL_URL, data)
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
