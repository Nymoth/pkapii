export const DEFAULT_LOCALE = 'en_GB';

export function localeToLangId(rawLocale = DEFAULT_LOCALE) {
  const locale = rawLocale.toLowerCase();
  switch (locale) {
    case 'ja_jp': return 1;
    case 'ja_ro': return 2;
    case 'ko_kr': return 3;
    case 'zh_cn': return 4;
    case 'fr_fr': return 5;
    case 'de_de': return 6;
    case 'es_es': return 7;
    case 'it_it': return 8;
    case 'en_gb': return 9;
    case 'cs_cz': return 10;
    default: return DEFAULT_LANG_ID;
  }
}
