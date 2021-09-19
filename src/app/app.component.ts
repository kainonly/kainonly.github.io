import { Component, OnInit } from '@angular/core';
import { NzIconService } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  projects = [
    {
      name: 'ngx-bit',
      url: 'https://github.com/kainonly/ngx-bit'
    },
    {
      name: 'go-bit',
      url: 'https://github.com/kainonly/go-bit'
    }
  ];

  constructor(private icon: NzIconService) {}

  ngOnInit(): void {
    this.icon.changeAssetsSource('https://cdn.kainonly.com');
  }
}
