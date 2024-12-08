import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigsService, IConfigs } from '../../services/configs.service';
import { ParserService } from '../../services/parser.service';
import { debounceTime, distinctUntilChanged, of } from 'rxjs';

export type Tab = 'json' | 'url' | 'configs'

@Component({
  selector: 'app-tabs',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './tabs.component.html',
})
export class TabsComponent implements OnInit {
  private fb = inject(FormBuilder)
  private configsService = inject(ConfigsService)
  private parserService = inject(ParserService)

  configsFg = this.fb.group({
    parcelUrl: ['', Validators.required],
    sessionId: ['', Validators.required],
  })
  jsonFg = this.fb.group({
    jsonString: ['', Validators.required],
  })

  urlInput = ''

  tabActive: Tab = 'json';

  get parcelUrlField() {
    return this.configsFg.get('parcelUrl');
  }


  get sessionIdField() {
    return this.configsFg.get('sessionId');
  }

  ngOnInit() {
    const configs = this.configsService.configs;
    this.configsFg.setValue({ ...configs });

    this.jsonFg.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    )
      .subscribe(v => {
        if (!v['jsonString']) {
          return
        }

        const jsonValue = v['jsonString'].trim()
        this.generate(jsonValue);
      })
  }

  setTabActive(tab: Tab) {
    this.tabActive = tab;
  }

  saveConfigs() {
    if (this.configsFg.invalid) {
      return;
    }

    this.configsService.saveConfigs(this.configsFg.value as IConfigs)
  }

  generate(jsonValue: string) {
    try {
      const json = JSON.parse(jsonValue);

      if (!json || !json['parcelInfoList']) {
        alert('Not found Parcel Info List')
        return
      }

      this.parserService.updateParcelInfoList(json['parcelInfoList']);
      this.parserService.loadParcelInfoList();
      this.parserService.setParseError(null)
    } catch (err: any) {
      console.error('err', err);
      if (err) {
        this.parserService.setParseError((err as Error).message);
      }
    }
  }
}
