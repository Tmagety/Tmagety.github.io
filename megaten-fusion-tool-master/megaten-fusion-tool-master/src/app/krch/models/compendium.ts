import { Demon, Skill, CompendiumConfig } from '../models';
import { Compendium as ICompendium, NamePair } from '../../compendium/models';

export class Compendium implements ICompendium {
  private demons: { [name: string]: Demon };
  private skills: { [name: string]: Skill };
  private pairRecipes: { [name: string]: NamePair[] } = {};
  private invertedDemons: { [race: string]: { [lvl: number]: string } };

  private allIngredients: { [race: string]: number[] };
  private allResults: { [race: string]: number[] };
  private _allDemons: Demon[];
  private _allSkills: Skill[];

  dlcDemons: { [name: string]: boolean } = {};
  compConfig: CompendiumConfig;

  constructor(compConfig: CompendiumConfig) {
    this.compConfig = compConfig;
    this.initImportedData();
    this.updateDerivedData();
  }

  initImportedData() {
    const demons: { [name: string]: Demon } = {};
    const skills: { [name: string]: Skill } = {};
    const pairRecipes: { [name: string]: NamePair[] } = {};
    const inversions: { [race: string]: { [lvl: number]: string } } = {};

    for (const [name, json] of Object.entries(this.compConfig.demonData)) {
      demons[name] = {
        name: name,
        race: json['race'],
        lvl: json['lvl'],
        price: 100 * (Math.floor(Math.pow(json['stats'].slice(3).reduce((acc, stat) => stat + acc, 0), 2) / 20) + json['lvl']),
        stats: json['stats'],
        resists: json['nresists'] || json['resists'],
        skills: json['nskills'] || json['skills'],
        person: json['person'] || '',
        fusion: 'normal'
      };
    }

    for (const [name, json] of Object.entries(this.compConfig.skillData)) {
      skills[name] = {
        name: name,
        rank: json['cost'] ? json['cost'] / 100 : 0,
        cost: json['cost'] || 0,
        effect: json['effect'] || '',
        target: json['target'] || 'Self',
        element: json['elem'],
        learnedBy: [],
        level: 0
      };
    }

    for (const race of this.compConfig.races) {
      inversions[race] = {};
    }

    for (const [name, demon] of Object.entries(demons)) {
      inversions[demon.race][demon.lvl] = name;

      for (const [skill, lvl] of Object.entries(demon.skills)) {
        skills[skill].learnedBy.push({ demon: name, level: lvl });
      }
    }

    for (const [name, recipe] of Object.entries(this.compConfig.specialRecipes)) {
      const entry = demons[name];
      entry.fusion = recipe['prereq'] === 'accident' ? 'accident' : 'special';
      entry.prereq = recipe['prereq'];

      if (entry.fusion === 'accident') {
        entry.prereq = 'Fusion accident only';
      }

      if (recipe['pairs']) {
        pairRecipes[name] = recipe['pairs'].map(pair => {
          const [name1, name2] = pair.split(' x ');
          return { name1, name2 };
        });
      } else {
        pairRecipes[name] = [];
      }
    }

    this.demons = demons;
    this.skills = skills;
    this.pairRecipes = pairRecipes;
    this.invertedDemons = inversions;
  }

  updateDerivedData() {
    const demonEntries = Object.assign({}, this.demons);
    const skills = Object.keys(this.skills).map(name => this.skills[name]);
    const ingredients: { [race: string]: number[] } = {};
    const results: { [race: string]: number[] } = {};

    for (const race of this.compConfig.races) {
      ingredients[race] = [];
      results[race] = [];
    }

    for (const [name, demon] of Object.entries(this.demons)) {
      if (!this.isElementDemon(name)) {
        ingredients[demon.race].push(demon.lvl);
      }

      if (!this.pairRecipes.hasOwnProperty(name)) {
        results[demon.race].push(demon.lvl);
      }
    }

    for (const race of this.compConfig.races) {
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
    return [];
  }

  getDemon(name: string): Demon {
    return this.demons[name];
  }

  getSkill(name: string): Skill {
    return this.skills[name];
  }

  getSkills(names: string[]): Skill[] {
    const skills = names.map(name => this.skills[name]);
    skills.sort((d1, d2) => (
      this.compConfig.elemOrder[d1.element] -
      this.compConfig.elemOrder[d2.element]) * 10000 + d1.rank - d2.rank
    );
    return skills;
  }

  getIngredientDemonLvls(race: string): number[] {
    return this.allIngredients[race] || [];
  }

  getResultDemonLvls(race: string): number[] {
    return this.allResults[race] || [];
  }

  getSpecialNameEntries(name: string): string[] {
    return [];
  }

  getSpecialNamePairs(name: string): NamePair[] {
    return this.pairRecipes[name] || [];
  }

  reverseLookupDemon(race: string, lvl: number): string {
    return this.invertedDemons[race][lvl];
  }

  reverseLookupSpecial(ingredient: string): { result: string, recipe: string }[] {
    return [];
  }

  isElementDemon(name: string): boolean {
    return this.compConfig.elementTable.elems.indexOf(name) !== -1;
  }
}
