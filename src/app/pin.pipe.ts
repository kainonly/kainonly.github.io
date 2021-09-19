import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'Pin'
})
export class PinPipe implements PipeTransform {
  transform(name: string): string {
    return `https://github-readme-stats.vercel.app/api/pin/?username=kainonly&repo=${name}&hide_border=true`;
  }
}
