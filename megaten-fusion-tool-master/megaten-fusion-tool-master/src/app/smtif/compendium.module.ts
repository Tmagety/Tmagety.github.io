import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { CompendiumRoutingModule } from '../smt1/compendium-routing.module';
import { FusionDataService } from '../smt1/fusion-data.service';

import { COMPENDIUM_CONFIG, FUSION_DATA_SERVICE, FUSION_TRIO_SERVICE } from '../compendium/constants';
import { SmtSnesCompendiumModule } from '../smt1/smt-snes-compendium.module';
import { CompendiumConfig } from '../smt1/models';

import COMP_CONFIG_JSON from './data/comp-config.json';
import DEMON_DATA_JSON from './data/demon-data.json';
import SKILL_DATA_JSON from './data/skill-data.json';
import ALIGNMENT_JSON from '../smt2/data/alignments.json';
import FUSION_CHART_JSON from '../smt2/data/fusion-chart.json';
import TRIPLE_CHART_JSON from '../smt2/data/triple-chart.json';
import ELEMENT_CHART_JSON from '../smt2/data/element-chart.json';
import SPECIAL_RECIPES_JSON from './data/special-recipes.json';

function getEnumOrder(target: string[]): { [key: string]: number } {
  const result = {};
  for (let i = 0; i < target.length; i++) {
    result[target[i]] = i;
  }
  return result;
}

const resistElems = COMP_CONFIG_JSON['resistElems'];
const skillElems = resistElems.concat(COMP_CONFIG_JSON['skillElems']);
const races = [].concat.apply([], COMP_CONFIG_JSON['species']);
const speciesLookup = {};
const species = {};

for (const rs of COMP_CONFIG_JSON['species']) {
  species[rs[0]] = rs.slice(1);

  for (const race of rs.slice(1)) {
    speciesLookup[race] = rs[0];
  }
}

export const SMT_COMP_CONFIG: CompendiumConfig = {
  appTitle: 'Shin Megami Tensei If...',
  appCssClasses: ['smtnes', 'smtif'],
  races,
  resistElems,
  skillElems,
  baseStats: COMP_CONFIG_JSON['baseStats'],
  baseAtks: COMP_CONFIG_JSON['baseAtks'],

  speciesLookup,
  species,
  resistCodes: COMP_CONFIG_JSON['resistCodes'],
  raceOrder: getEnumOrder(races),
  elemOrder: getEnumOrder(skillElems),
  specialRecipes: SPECIAL_RECIPES_JSON,
  useSpeciesFusion: true,

  demonData: DEMON_DATA_JSON,
  skillData: SKILL_DATA_JSON,
  alignData: ALIGNMENT_JSON,
  tripleTable: TRIPLE_CHART_JSON,
  elementTable: ELEMENT_CHART_JSON,
  mitamaTable: ELEMENT_CHART_JSON['pairs'],
  darknessRecipes: FUSION_CHART_JSON['darks'],
  normalTable: {
    races: FUSION_CHART_JSON['races'].slice(0, FUSION_CHART_JSON['races'].length - 1),
    table: FUSION_CHART_JSON['table'].slice(0, FUSION_CHART_JSON['table'].length - 1)
  }
};

export const fusionDataFactory = () => {
  return new FusionDataService(SMT_COMP_CONFIG);
};

@NgModule({
  imports: [
    CommonModule,
    SmtSnesCompendiumModule,
    CompendiumRoutingModule
  ],
  providers: [
    Title,
    FusionDataService,
    { provide: FUSION_DATA_SERVICE, useExisting: FusionDataService },
    { provide: FUSION_TRIO_SERVICE, useExisting: FusionDataService },
    { provide: COMPENDIUM_CONFIG, useValue: SMT_COMP_CONFIG }
  ]
})
export class CompendiumModule { }
