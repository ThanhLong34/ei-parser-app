import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigsService, IConfigs } from '../../services/configs.service';

export type Tab = 'json' | 'url' | 'configs'

@Component({
  selector: 'app-tabs',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './tabs.component.html',
})
export class TabsComponent implements OnInit {
  private fb = inject(FormBuilder)
  private configsService = inject(ConfigsService)

  configsFg = this.fb.group({
    parcelUrl: ['', Validators.required],
    sessionId: ['', Validators.required],
  })

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
}
