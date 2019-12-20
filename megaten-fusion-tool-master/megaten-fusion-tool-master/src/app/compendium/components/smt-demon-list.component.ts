import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { Title } from '@angular/platform-browser';

import { PositionEdgesService } from '../../shared/position-edges.service';
import { Demon } from '../models';
import { DemonListComponent } from '../bases/demon-list.component';

@Component({
  selector: 'tr.app-smt-demon-list-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <td [ngClass]="['align', data.align ? data.align : 'none']">{{ data.race }}</td>
    <td>{{ data.lvl | lvlToNumber }}</td>
    <td><a routerLink="{{ data.name }}">{{ data.name }}</a></td>
    <td *ngIf="hasInherits"><div class="element-icon {{ data.inherit }}">{{ data.inherit }}</div></td>
    <td *ngFor="let stat of data.stats">{{ stat }}</td>
    <td *ngFor="let resist of data.resists" class="resists {{ resist | reslvlToString }}">
      {{ resist | reslvlToString }}
    </td>
    <ng-container *ngIf="hasAffinity">
      <td *ngFor="let affinity of data.affinities" class="affinity{{ affinity }}">
        {{ affinity | affinityToString }}
      </td>
    </ng-container>
    <td *ngIf="isEnemy">{{ data.drop }}</td>
    <td *ngIf="isEnemy">{{ data.area }}</td>
  `
})
export class SmtDemonListRowComponent {
  @Input() isEnemy = false;
  @Input() hasInherits = false;
  @Input() hasAffinity = false;
  @Input() data: Demon;
}

@Component({
  selector: 'app-smt-demon-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PositionEdgesService ],
  template: `
    <table appPositionSticky>
      <tfoot #stickyHeader appColumnWidths
        class="app-demon-list-header sticky-header"
        [isPersona]="isPersona"
        [isEnemy]="isEnemy"
        [hasInherits]="inheritOrder"
        [statHeaders]="statHeaders"
        [resistHeaders]="resistHeaders"
        [affinityHeaders]="affinityHeaders"
        [sortFunIndex]="sortFunIndex"
        (sortFunIndexChanged)="sortFunIndex = $event">
      </tfoot>
    </table>
    <table>
      <tfoot #hiddenHeader appColumnWidths
        class="app-demon-list-header"
        [isPersona]="isPersona"
        [isEnemy]="isEnemy"
        [hasInherits]="inheritOrder"
        [statHeaders]="statHeaders"
        [resistHeaders]="resistHeaders"
        [affinityHeaders]="affinityHeaders"
        [style.visibility]="'collapse'">
      </tfoot>
      <tbody>
        <tr *ngFor="let data of rowData"
          class="app-smt-demon-list-row"
          [isEnemy]="isEnemy"
          [hasInherits]="inheritOrder"
          [hasAffinity]="affinityHeaders"
          [ngClass]="{
            special: data.fusion === 'special',
            exception: data.fusion !== 'special' && data.fusion !== 'normal'
          }"
          [data]="data">
        </tr>
      </tbody>
    </table>
  `
})
export class SmtDemonListComponent extends DemonListComponent<Demon> {
  @Input() isPersona = false;
  @Input() isEnemy = false;
}
