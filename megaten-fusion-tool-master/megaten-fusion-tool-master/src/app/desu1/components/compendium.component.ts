import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'app-desu1-compendium',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-demon-compendium [ngClass]="'desu1'" [hasSettings]="false"></app-demon-compendium>
  `,
  styleUrls: [ './compendium.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class CompendiumComponent { }
