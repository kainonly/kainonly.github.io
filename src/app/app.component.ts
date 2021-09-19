import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
}
