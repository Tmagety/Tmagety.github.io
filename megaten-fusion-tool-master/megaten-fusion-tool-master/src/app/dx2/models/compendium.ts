import { Races, SkillElementOrder, ResistCodes } from '../constants';
import { Demon, Skill } from '../models';
import { Compendium as ICompendium, NamePair } from '../../compendium/models';

import DEMON_DATA_JSON from '../data/demon-data.json';
import SKILL_DATA_JSON from '../data/skill-data.json';
import SPECIAL_RECIPES_JSON from '../data/special-recipes.json';

export class Compendium implements ICompendium {
  private demons: { [name: string]: Demon };
  private skills: { [name: string]: Skill };
  private specialRecipes: { [name: string]: string[] } = {};
  private invertedDemons: { [race: string]: { [lvl: number]: string } };
  private invertedSpecials: { [name: string]: { result: string, recipe: string }[] };

  private allIngredients: { [race: string]: number[] };
  private allResults: { [race: string]: number[] };
  private _allDemons: Demon[];
  private _allSkills: Skill[];

  dlcDemons: { [name: string]: boolean } = {};

  constructor() {
    this.initImportedData();
    this.updateDerivedData();
  }

  initImportedData() {
    const demons: { [name: string]: Demon } = {};
    const skills: { [name: string]: Skill } = {};
    const specialRecipes: { [name: string]: string[] } = {};
    const inversions: { [race: string]: { [lvl: number]: string } } = {};
    const invSpecs: { [name: string]: { result: string, recipe: string }[] } = {};

    for (const [name, json] of Object.entries(DEMON_DATA_JSON)) {
      const stars = Math.floor(json.grade / 20) + 1;

      demons[name] = {
        name,
        race:    json.race,
        lvl:     json.grade,
        ai:      json.ai,
        fusion:  'normal',
        reikos:  {},
        price:   Math.pow(json.grade, 3),
        stats:   [stars].concat(json.stats),
        resists: json.resists.split('').map(char => ResistCodes[char]),
        skills:  json.base.reduce((acc, skill, i) => { acc[skill] = i - 3; return acc; }, {}),
        learned: json.arch.reduce((acc, skill, i) => { acc[skill] = 110 + i; return acc; }, {}),
        gacha:   (json.gach || []).reduce((acc, skill, i) => { acc[skill] = 115 + i; return acc; }, {})
      };

      delete demons[name].learned['-'];
    }

    for (const [name, json] of Object.entries(SKILL_DATA_JSON)) {
      const powerUnit = json.elem === 'recovery' ? ' Rec ' : ' Dmg ';

      skills[name] = {
        name,
        element: json.elem,
        power:   json.power || 0,
        cost:    json.cost + 1000 || 0,
        rank:    json.points || 99,
        effect:  (json.power ? json.power.toString() + powerUnit : ' ') + (json.effect || ''),
        target:  json.target,
        level:   0,
        learnedBy: [],
        transfer: []
      };
    }

    for (const [name, json] of Object.entries(SPECIAL_RECIPES_JSON)) {
      if (json.length > 1) {
        specialRecipes[name] = json;
        demons[name].fusion = 'special';
      } else if (json.length === 1) {
        demons[name].fusion = 'recruit';
        demons[name].prereq = json[0];
      } else {
        specialRecipes[name] = json;
        demons[name].fusion = 'accident';
        demons[name].prereq = 'Gacha only';
      }
    }

    for (const race of Races) {
      inversions[race] = {};
    }

    for (const [name, demon] of Object.entries(demons)) {
      inversions[demon.race][demon.lvl] = name;

      for (const [skill, lvl] of Object.entries(demon.skills)) {
        if (lvl === -3) {
          skills[skill].transfer.push({ demon: name, level: lvl });
        } else {
          skills[skill].learnedBy.push({ demon: name, level: lvl });
        }
      }

      for (const [skill, lvl] of Object.entries(demon.learned)) {
        skills[skill].learnedBy.push({ demon: name, level: lvl });
      }

      for (const [skill, lvl] of Object.entries(demon.gacha)) {
        skills[skill].transfer.push({ demon: name, level: lvl });
      }
    }

    this.demons = demons;
    this.skills = skills;
    this.specialRecipes = specialRecipes;
    this.invertedDemons = inversions;
    this.invertedSpecials = invSpecs;
  }

  updateDerivedData() {
    const demonEntries = Object.assign({}, this.demons);
    const skills = Object.keys(this.skills).map(name => this.skills[name]);
    const ingredients: { [race: string]: number[] } = {};
    const results: { [race: string]: number[] } = {};

    for (const race of Races) {
      ingredients[race] = [];
      results[race] = [];
    }

    for (const [name, demon] of Object.entries(this.demons)) {
      ingredients[demon.race].push(demon.lvl);

      if (demon.fusion === 'normal') {
        results[demon.race].push(demon.lvl);
      }
    }

    for (const race of Races) {
      ingredients[race].sort((a, b) => a - b);
      results[race].sort((a, b) => a - b);
    }

    this._allDemons = Object.keys(demonEntries).map(name => demonEntries[name]);
    this._allSkills = skills;
    this.allIngredients = ingredients;
    this.allResults = results;
  }

  get allDemons(): Demon[] {
    return this._allDemons;
  }

  get allSkills(): Skill[] {
    return this._allSkills;
  }

  get specialDemons(): Demon[] {
    return Object.keys(this.specialRecipes).map(name => this.demons[name]);
  }

  getDemon(name: string): Demon {
    return this.demons[name];
  }

  getSkill(name: string): Skill {
    return this.skills[name];
  }

  getSkills(names: string[]): Skill[] {
    const skills = names.map(name => this.skills[name]);
    skills.sort((d1, d2) => (SkillElementOrder[d1.element] - SkillElementOrder[d2.element]) * 10000 + d1.rank - d2.rank);
    return skills;
  }

  getIngredientDemonLvls(race: string): number[] {
    return this.allIngredients[race] || [];
  }

  getResultDemonLvls(race: string): number[] {
    return this.allResults[race] || [];
  }

  getSpecialNameEntries(name: string): string[] {
    return this.specialRecipes[name] || [];
  }

  getSpecialNamePairs(name: string): NamePair[] {
    return [];
  }

  reverseLookupDemon(race: string, lvl: number): string {
    return this.invertedDemons[race][lvl];
  }

  reverseLookupSpecial(ingredient: string): { result: string, recipe: string }[] {
    return this.invertedSpecials[ingredient] ? this.invertedSpecials[ingredient] : [];
  }

  isElementDemon(name: string) {
    return false;
  }
}
