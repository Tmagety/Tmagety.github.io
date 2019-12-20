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
import FUSION_CHART_JSON from './data/fusion-chart.json';
import TRIPLE_CHART_JSON from './data/triple-chart.json';
import ELEMENT_CHART_JSON from './data/element-chart.json';
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

const races = [];
const raceAligns = {};
const species = {};
const speciesLookup = {};

for (const rs of COMP_CONFIG_JSON['species']) {
  const spec = rs[0];
  species[spec] = [];

  for (const pair of rs.slice(1)) {
    const [race, align] = pair.split('|');
    races.push(race);
    raceAligns[race] = align;
    species[spec].push(race);
    speciesLookup[race] = spec;
  }
}

for (const [name, demon] of Object.entries(DEMON_DATA_JSON)) {
  demon['resists'] = demon['resists'].slice(2);
}

for (const [name, recipe] of Object.entries(SPECIAL_RECIPES_JSON)) {
  SPECIAL_RECIPES_JSON[name] = { special: recipe };
}

export const SMT_COMP_CONFIG: CompendiumConfig = {
  appTitle: 'Shin Megami Tensei IMAGINE',
  appCssClasses: ['smtnes', 'smtim'],
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
  useSpeciesFusion: true,
  specialRecipes: SPECIAL_RECIPES_JSON,

  demonData: DEMON_DATA_JSON,
  skillData: SKILL_DATA_JSON,
  alignData: { races: raceAligns },
  normalTable: FUSION_CHART_JSON,
  tripleTable: TRIPLE_CHART_JSON,
  elementTable: ELEMENT_CHART_JSON,
  mitamaTable: ELEMENT_CHART_JSON['pairs']
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
