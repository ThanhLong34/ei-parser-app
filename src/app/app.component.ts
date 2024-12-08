import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from './components/tabs/tabs.component';
import { ConfigsService } from './services/configs.service';
import { ParserComponent } from './components/parser/parser.component';
import { ParcelDataComponent } from './components/parcel-data/parcel-data.component';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [LoadingComponent, TabsComponent, ParserComponent, ParcelDataComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private configsService = inject(ConfigsService);

  ngOnInit() {
    this.configsService.loadConfigs();
  }
}
