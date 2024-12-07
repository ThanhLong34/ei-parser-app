import { Injectable } from '@angular/core';

export interface IConfigs {
  parcelUrl: string;
  sessionId: string;
}

const configInitial = {
  parcelUrl: '',
  sessionId: '',
}

@Injectable({
  providedIn: 'root'
})
export class ConfigsService {
  private _configs: IConfigs = { ...configInitial }

  get configs() {
    return this._configs;
  }

  loadConfigs() {
    const configsFromLocal = localStorage.getItem('configs');
    this._configs = configsFromLocal ? JSON.parse(configsFromLocal) : { ...configInitial };
  }

  saveConfigs(configs: IConfigs) {
    this._configs = configs;
    localStorage.setItem('configs', JSON.stringify(configs));
  }
}
