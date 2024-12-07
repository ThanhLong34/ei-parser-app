import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from './components/tabs/tabs.component';
import { ConfigsService } from './services/configs.service';

@Component({
  selector: 'app-root',
  imports: [TabsComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private configsService = inject(ConfigsService);

  ngOnInit() {
    this.configsService.loadConfigs();
  }
}
