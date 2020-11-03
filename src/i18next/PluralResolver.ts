/**
 * Extracted from https://github.com/i18next/i18next/blob/master/src/PluralResolver.js
 */
import { LanguageUtil } from './LanguageUtils';

type Rule = { numbers: number[]; plurals: (n: any) => number; noAbs?: boolean };
type RuleSet = Record<string, Rule>;
interface PluralResolverOptions {
  simplifyPluralSuffix?: boolean;
  prepend?: string;
  compatibilityJSON?: 'v1' | 'v2';
}

const defaultOptions = {
  prepend: '_',
  simplifyPluralSuffix: true,
};

// definition http://translate.sourceforge.net/wiki/l10n/pluralforms
/* eslint-disable */
const sets = [
  {
    lngs: [
      'ach',
      'ak',
      'am',
      'arn',
      'br',
      'fil',
      'gun',
      'ln',
      'mfe',
      'mg',
      'mi',
      'oc',
      'pt',
      'pt-BR',
      'tg',
      'ti',
      'tr',
      'uz',
      'wa',
    ],
    nr: [1, 2],
    fc: 1,
  },

  {
    lngs: [
      'af',
      'an',
      'ast',
      'az',
      'bg',
      'bn',
      'ca',
      'da',
      'de',
      'dev',
      'el',
      'en',
      'eo',
      'es',
      'et',
      'eu',
      'fi',
      'fo',
      'fur',
      'fy',
      'gl',
      'gu',
      'ha',
      'hi',
      'hu',
      'hy',
      'ia',
      'it',
      'kn',
      'ku',
      'lb',
      'mai',
      'ml',
      'mn',
      'mr',
      'nah',
      'nap',
      'nb',
      'ne',
      'nl',
      'nn',
      'no',
      'nso',
      'pa',
      'pap',
      'pms',
      'ps',
      'pt-PT',
      'rm',
      'sco',
      'se',
      'si',
      'so',
      'son',
      'sq',
      'sv',
      'sw',
      'ta',
      'te',
      'tk',
      'ur',
      'yo',
    ],
    nr: [1, 2],
    fc: 2,
  },

  {
    lngs: [
      'ay',
      'bo',
      'cgg',
      'fa',
      'id',
      'ja',
      'jbo',
      'ka',
      'kk',
      'km',
      'ko',
      'ky',
      'lo',
      'ms',
      'sah',
      'su',
      'th',
      'tt',
      'ug',
      'vi',
      'wo',
      'zh',
    ],
    nr: [1],
    fc: 3,
  },

  { lngs: ['be', 'bs', 'dz', 'hr', 'ru', 'sr', 'uk'], nr: [1, 2, 5], fc: 4 },

  { lngs: ['ar'], nr: [0, 1, 2, 3, 11, 100], fc: 5 },
  { lngs: ['cs', 'sk'], nr: [1, 2, 5], fc: 6 },
  { lngs: ['csb', 'pl'], nr: [1, 2, 5], fc: 7 },
  { lngs: ['cy'], nr: [1, 2, 3, 8], fc: 8 },
  { lngs: ['fr'], nr: [1, 2], fc: 9 },
  { lngs: ['ga'], nr: [1, 2, 3, 7, 11], fc: 10 },
  { lngs: ['gd'], nr: [1, 2, 3, 20], fc: 11 },
  { lngs: ['is'], nr: [1, 2], fc: 12 },
  { lngs: ['jv'], nr: [0, 1], fc: 13 },
  { lngs: ['kw'], nr: [1, 2, 3, 4], fc: 14 },
  { lngs: ['lt'], nr: [1, 2, 10], fc: 15 },
  { lngs: ['lv'], nr: [1, 2, 0], fc: 16 },
  { lngs: ['mk'], nr: [1, 2], fc: 17 },
  { lngs: ['mnk'], nr: [0, 1, 2], fc: 18 },
  { lngs: ['mt'], nr: [1, 2, 11, 20], fc: 19 },
  { lngs: ['or'], nr: [2, 1], fc: 2 },
  { lngs: ['ro'], nr: [1, 2, 20], fc: 20 },
  { lngs: ['sl'], nr: [5, 1, 2, 3], fc: 21 },
  { lngs: ['he'], nr: [1, 2, 20, 21], fc: 22 },
];

const _rulesPluralsTypes: Record<number, (n: any) => number> = {
  1: function (n: any) {
    return Number(n > 1);
  },
  2: function (n: any) {
    return Number(n != 1);
  },
  3: function (_n: any) {
    return 0;
  },
  4: function (n: any) {
    return Number(
      n % 10 == 1 && n % 100 != 11
        ? 0
        : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
        ? 1
        : 2
    );
  },
  5: function (n: any) {
    return Number(
      n === 0
        ? 0
        : n == 1
        ? 1
        : n == 2
        ? 2
        : n % 100 >= 3 && n % 100 <= 10
        ? 3
        : n % 100 >= 11
        ? 4
        : 5
    );
  },
  6: function (n: any) {
    return Number(n == 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2);
  },
  7: function (n: any) {
    return Number(
      n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2
    );
  },
  8: function (n: any) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n != 8 && n != 11 ? 2 : 3);
  },
  9: function (n: any) {
    return Number(n >= 2);
  },
  10: function (n: any) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4);
  },
  11: function (n: any) {
    return Number(n == 1 || n == 11 ? 0 : n == 2 || n == 12 ? 1 : n > 2 && n < 20 ? 2 : 3);
  },
  12: function (n: any) {
    return Number(n % 10 != 1 || n % 100 == 11);
  },
  13: function (n: any) {
    return Number(n !== 0);
  },
  14: function (n: any) {
    return Number(n == 1 ? 0 : n == 2 ? 1 : n == 3 ? 2 : 3);
  },
  15: function (n: any) {
    return Number(
      n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2
    );
  },
  16: function (n: any) {
    return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n !== 0 ? 1 : 2);
  },
  17: function (n: any) {
    return Number(n == 1 || n % 10 == 1 ? 0 : 1);
  },
  18: function (n: any) {
    return Number(n == 0 ? 0 : n == 1 ? 1 : 2);
  },
  19: function (n: any) {
    return Number(
      n == 1
        ? 0
        : n === 0 || (n % 100 > 1 && n % 100 < 11)
        ? 1
        : n % 100 > 10 && n % 100 < 20
        ? 2
        : 3
    );
  },
  20: function (n: any) {
    return Number(n == 1 ? 0 : n === 0 || (n % 100 > 0 && n % 100 < 20) ? 1 : 2);
  },
  21: function (n: any) {
    return Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);
  },
  22: function (n: any) {
    return Number(n === 1 ? 0 : n === 2 ? 1 : (n < 0 || n > 10) && n % 10 == 0 ? 2 : 3);
  },
};
/* eslint-enable */

function createRules(): RuleSet {
  return sets.reduce((rules, set) => {
    set.lngs.forEach((l) => {
      rules[l] = {
        numbers: set.nr,
        plurals: _rulesPluralsTypes[set.fc],
      };
    });

    return rules;
  }, {} as RuleSet);
}

export class PluralResolver {
  private readonly rules: RuleSet;
  private options: PluralResolverOptions;

  constructor(private languageUtils: LanguageUtil, options: PluralResolverOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.rules = createRules();
  }

  addRule(lng: string, obj: Rule) {
    this.rules[lng] = obj;
  }

  getRule(code: string) {
    return this.rules[code] || this.rules[this.languageUtils.getLanguagePartFromCode(code)];
  }

  needsPlural(code: string) {
    const rule = this.getRule(code);

    return rule && rule.numbers.length > 1;
  }

  getSingularFormOfKey(key: string, code: string): string {
    const suffixes = this.getPluralFormsOfKey('', code).filter(Boolean);

    const suffix = suffixes.find((suffix) => key.endsWith(suffix));
    if (!suffix) {
      return key;
    }

    return key.substring(0, key.length - suffix.length);
  }

  getPluralFormsOfKey(key: string, code: string): string[] {
    const rule = this.getRule(code);

    if (!rule) return [];

    return rule.numbers.map((n) => {
      const suffix = this.getSuffix(code, n);
      return `${key}${suffix}`;
    });
  }

  getSuffix(code: string, count: number) {
    const rule = this.getRule(code);

    if (rule) {
      // if (rule.numbers.length === 1) return ''; // only singular

      const idx = rule.noAbs ? rule.plurals(count) : rule.plurals(Math.abs(count));
      let suffix: number | number[] | string = rule.numbers[idx];

      // special treatment for lngs only having singular and plural
      if (this.options.simplifyPluralSuffix && rule.numbers.length === 2 && rule.numbers[0] === 1) {
        if (suffix === 2) {
          suffix = 'plural';
        } else if (suffix === 1) {
          suffix = '';
        }
      }

      const returnSuffix = () =>
        this.options.prepend && suffix.toString()
          ? this.options.prepend + suffix.toString()
          : suffix.toString();

      // COMPATIBILITY JSON
      // v1
      if (this.options.compatibilityJSON === 'v1') {
        if (suffix === 1) return '';
        if (typeof suffix === 'number') return `_plural_${suffix.toString()}`;
        return returnSuffix();
      } else if (/* v2 */ this.options.compatibilityJSON === 'v2') {
        return returnSuffix();
      } else if (
        /* v3 - gettext index */ this.options.simplifyPluralSuffix &&
        rule.numbers.length === 2 &&
        rule.numbers[0] === 1
      ) {
        return returnSuffix();
      }
      return this.options.prepend && idx.toString()
        ? this.options.prepend + idx.toString()
        : idx.toString();
    }

    return '';
  }
}
