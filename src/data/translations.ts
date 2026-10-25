export interface QuranTranslationEdition {
  id: string; // e.g. 'none', 'en.sahih', 'fr.hamidullah', etc.
  languageCode: string; // 'en', 'fr', 'ur', etc.
  languageNameAr: string; // 'الإنجليزية', 'الفرنسية', 'الأردية', etc.
  languageNameNative: string; // 'English', 'Français', 'اردو', etc.
  translatorName: string; // 'صحيح انترناشونال (Saheeh International)', etc.
  direction: 'ltr' | 'rtl';
  flag: string;
}

export const QURAN_TRANSLATIONS: QuranTranslationEdition[] = [
  {
    id: 'none',
    languageCode: 'ar',
    languageNameAr: 'بدون ترجمة',
    languageNameNative: 'العربية فقط',
    translatorName: 'النص القرآني والتفسير فقط',
    direction: 'rtl',
    flag: '📖',
  },
  {
    id: 'en.sahih',
    languageCode: 'en',
    languageNameAr: 'الإنجليزية',
    languageNameNative: 'English',
    translatorName: 'Saheeh International (صحيح انترناشونال)',
    direction: 'ltr',
    flag: '🇬🇧',
  },
  {
    id: 'fr.hamidullah',
    languageCode: 'fr',
    languageNameAr: 'الفرنسية',
    languageNameNative: 'Français',
    translatorName: 'Muhammad Hamidullah (محمد حميد الله)',
    direction: 'ltr',
    flag: '🇫🇷',
  },
  {
    id: 'ur.jalandhry',
    languageCode: 'ur',
    languageNameAr: 'الأردية',
    languageNameNative: 'اردو',
    translatorName: 'فاتح محمد جالندھری (Fateh Jalandhry)',
    direction: 'rtl',
    flag: '🇵🇰',
  },
  {
    id: 'id.indonesian',
    languageCode: 'id',
    languageNameAr: 'الإندونيسية',
    languageNameNative: 'Bahasa Indonesia',
    translatorName: 'Kemenag (وزارة الشؤون الدينية)',
    direction: 'ltr',
    flag: '🇮🇩',
  },
  {
    id: 'tr.ates',
    languageCode: 'tr',
    languageNameAr: 'التركية',
    languageNameNative: 'Türkçe',
    translatorName: 'Süleyman Ateş (سليمان أتيش)',
    direction: 'ltr',
    flag: '🇹🇷',
  },
  {
    id: 'es.cortes',
    languageCode: 'es',
    languageNameAr: 'الإسبانية',
    languageNameNative: 'Español',
    translatorName: 'Julio Cortes (خوليو كورتيس)',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  {
    id: 'de.bubenheim',
    languageCode: 'de',
    languageNameAr: 'الألمانية',
    languageNameNative: 'Deutsch',
    translatorName: 'Bubenheim & Elyas (بوبنهايم وإلياس)',
    direction: 'ltr',
    flag: '🇩🇪',
  },
  {
    id: 'ru.kuliev',
    languageCode: 'ru',
    languageNameAr: 'الروسية',
    languageNameNative: 'Русский',
    translatorName: 'Elmir Kuliev (إلمير كولييف)',
    direction: 'ltr',
    flag: '🇷🇺',
  },
];

export function getTranslationEdition(id?: string): QuranTranslationEdition {
  if (!id) return QURAN_TRANSLATIONS[0];
  const found = QURAN_TRANSLATIONS.find((t) => t.id === id);
  return found || QURAN_TRANSLATIONS[0];
}

// Offline fallback for Surah 1 Al-Fatiha in English (Saheeh International)
export const BUNDLED_TRANSLATIONS: Record<string, Record<number, Record<number, string>>> = {
  'en.sahih': {
    1: {
      1: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      2: '[All] praise is [due] to Allah, Lord of the worlds -',
      3: 'The Entirely Merciful, the Especially Merciful,',
      4: 'Sovereign of the Day of Recompense.',
      5: 'It is You we worship and You we ask for help.',
      6: 'Guide us to the straight path -',
      7: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
    },
    112: {
      1: 'Say, "He is Allah, [who is] One,',
      2: 'Allah, the Eternal Refuge.',
      3: 'He neither begets nor is born,',
      4: 'Nor is there to Him any equivalent."',
    },
    113: {
      1: 'Say, "I seek refuge in the Lord of daybreak',
      2: 'From the evil of that which He created',
      3: 'And from the evil of darkness when it settles',
      4: 'And from the evil of the blowers in knots',
      5: 'And from the evil of an envier when he envies."',
    },
    114: {
      1: 'Say, "I seek refuge in the Lord of mankind,',
      2: 'The Sovereign of mankind,',
      3: 'The God of mankind,',
      4: 'From the evil of the retreating whisperer -',
      5: 'Who whispers [evil] into the breasts of mankind -',
      6: 'From among the jinn and mankind."',
    },
  },
};
