import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-demon-resists',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table *ngIf="resistHeaders.length">
      <thead>
        <tr><th [attr.colspan]="resistHeaders.length + ailmentHeaders.length">Resistances</th></tr>
        <tr>
          <th [attr.colSpan]="resistHeaders.length">Element</th>
          <th *ngIf="ailmentHeaders.length" [attr.colSpan]="ailmentHeaders.length">Ailment</th>
        </tr>
        <tr>
          <th *ngFor="let element of resistHeaders"
            [style.width.%]="(ailmentHeaders.length ? 50 : 100) / resistHeaders.length">
            <div class="element-icon {{ element }}">{{ element }}</div>
          </th>
          <th *ngFor="let ailment of ailmentHeaders"
            [style.width.%]="50 / ailmentHeaders.length">
            <div>{{ ailment }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td *ngFor="let resist of resists" class="resists {{ resist | reslvlToString }}">
            {{ resist | reslvlToString }}
          </td>
          <td *ngFor="let resist of ailments" class="resists {{ resist | reslvlToString }}">
            {{ resist | reslvlToString }}
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class DemonResistsComponent {
  @Input() resistHeaders: string[] = [];
  @Input() resists: number[] = [];
  @Input() ailmentHeaders: string[] = [];
  @Input() ailments: number[] = [];
}
