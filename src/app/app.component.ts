import { Component, OnInit } from '@angular/core';

import { NzIconService } from 'ng-zorro-antd/icon';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private icon: NzIconService) {}

  ngOnInit(): void {
    this.icon.changeAssetsSource(environment.cdn);
  }
}
