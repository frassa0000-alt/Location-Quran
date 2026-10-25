export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahCount: number;
  juz: number;
  page: number;
}

export interface Ayah {
  number: number; // in surah (1-indexed)
  numberInQuran: number;
  text: string;
  tafsir?: string;
  audio?: string;
  juz?: number;
  page?: number;
  translation?: string;
}

export const SURAHS_LIST: SurahMeta[] = [
  { number: 1, name: "الفَاتِحَة", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", revelationType: "Meccan", ayahCount: 7, juz: 1, page: 1 },
  { number: 2, name: "البَقَرَة", englishName: "Al-Baqara", englishNameTranslation: "The Cow", revelationType: "Medinan", ayahCount: 286, juz: 1, page: 2 },
  { number: 3, name: "آل عِمْرَان", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", revelationType: "Medinan", ayahCount: 200, juz: 3, page: 50 },
  { number: 4, name: "النِّسَاء", englishName: "An-Nisaa", englishNameTranslation: "The Women", revelationType: "Medinan", ayahCount: 176, juz: 4, page: 77 },
  { number: 5, name: "المَائِدَة", englishName: "Al-Maaida", englishNameTranslation: "The Table", revelationType: "Medinan", ayahCount: 120, juz: 6, page: 106 },
  { number: 6, name: "الأَنْعَام", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", revelationType: "Meccan", ayahCount: 165, juz: 7, page: 128 },
  { number: 7, name: "الأَعْرَاف", englishName: "Al-A'raaf", englishNameTranslation: "The Heights", revelationType: "Meccan", ayahCount: 206, juz: 8, page: 151 },
  { number: 8, name: "الأَنْفَال", englishName: "Al-Anfaal", englishNameTranslation: "The Spoils of War", revelationType: "Medinan", ayahCount: 75, juz: 9, page: 177 },
  { number: 9, name: "التَّوْبَة", englishName: "At-Tawba", englishNameTranslation: "The Repentance", revelationType: "Medinan", ayahCount: 129, juz: 10, page: 187 },
  { number: 10, name: "يُونُس", englishName: "Yunus", englishNameTranslation: "Jonah", revelationType: "Meccan", ayahCount: 109, juz: 11, page: 208 },
  { number: 11, name: "هُود", englishName: "Hud", englishNameTranslation: "Hud", revelationType: "Meccan", ayahCount: 123, juz: 11, page: 221 },
  { number: 12, name: "يُوسُف", englishName: "Yusuf", englishNameTranslation: "Joseph", revelationType: "Meccan", ayahCount: 111, juz: 12, page: 235 },
  { number: 13, name: "الرَّعْد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", revelationType: "Medinan", ayahCount: 43, juz: 13, page: 249 },
  { number: 14, name: "إِبْرَاهِيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", revelationType: "Meccan", ayahCount: 52, juz: 13, page: 255 },
  { number: 15, name: "الحِجْر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", revelationType: "Meccan", ayahCount: 99, juz: 14, page: 262 },
  { number: 16, name: "النَّحْل", englishName: "An-Nahl", englishNameTranslation: "The Bee", revelationType: "Meccan", ayahCount: 128, juz: 14, page: 267 },
  { number: 17, name: "الإِسْرَاء", englishName: "Al-Israa", englishNameTranslation: "The Night Journey", revelationType: "Meccan", ayahCount: 111, juz: 15, page: 282 },
  { number: 18, name: "الكَهْف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", revelationType: "Meccan", ayahCount: 110, juz: 15, page: 293 },
  { number: 19, name: "مَرْيَم", englishName: "Maryam", englishNameTranslation: "Mary", revelationType: "Meccan", ayahCount: 98, juz: 16, page: 305 },
  { number: 20, name: "طه", englishName: "Taa-Haa", englishNameTranslation: "Taa-Haa", revelationType: "Meccan", ayahCount: 135, juz: 16, page: 312 },
  { number: 21, name: "الأَنْبِيَاء", englishName: "Al-Anbiyaa", englishNameTranslation: "The Prophets", revelationType: "Meccan", ayahCount: 112, juz: 17, page: 322 },
  { number: 22, name: "الحَجّ", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", revelationType: "Medinan", ayahCount: 78, juz: 17, page: 332 },
  { number: 23, name: "المُؤْمِنُون", englishName: "Al-Mu'minoon", englishNameTranslation: "The Believers", revelationType: "Meccan", ayahCount: 118, juz: 18, page: 342 },
  { number: 24, name: "النُّور", englishName: "An-Noor", englishNameTranslation: "The Light", revelationType: "Medinan", ayahCount: 64, juz: 18, page: 350 },
  { number: 25, name: "الفُرْقَان", englishName: "Al-Furqaan", englishNameTranslation: "The Criterion", revelationType: "Meccan", ayahCount: 77, juz: 18, page: 359 },
  { number: 26, name: "الشُّعَرَاء", englishName: "Ash-Shu'araa", englishNameTranslation: "The Poets", revelationType: "Meccan", ayahCount: 227, juz: 19, page: 367 },
  { number: 27, name: "النَّمْل", englishName: "An-Naml", englishNameTranslation: "The Ant", revelationType: "Meccan", ayahCount: 93, juz: 19, page: 377 },
  { number: 28, name: "القَصَص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", revelationType: "Meccan", ayahCount: 88, juz: 20, page: 385 },
  { number: 29, name: "العَنْكَبُوت", englishName: "Al-Ankaboot", englishNameTranslation: "The Spider", revelationType: "Meccan", ayahCount: 69, juz: 20, page: 396 },
  { number: 30, name: "الرُّوم", englishName: "Ar-Room", englishNameTranslation: "The Romans", revelationType: "Meccan", ayahCount: 60, juz: 21, page: 404 },
  { number: 31, name: "لُقْمَان", englishName: "Luqman", englishNameTranslation: "Luqman", revelationType: "Meccan", ayahCount: 34, juz: 21, page: 411 },
  { number: 32, name: "السَّجْدَة", englishName: "As-Sajda", englishNameTranslation: "The Prostration", revelationType: "Meccan", ayahCount: 30, juz: 21, page: 415 },
  { number: 33, name: "الأَحْزَاب", englishName: "Al-Ahzaab", englishNameTranslation: "The Combined Forces", revelationType: "Medinan", ayahCount: 73, juz: 21, page: 418 },
  { number: 34, name: "سَبَأ", englishName: "Saba", englishNameTranslation: "Sheba", revelationType: "Meccan", ayahCount: 54, juz: 22, page: 428 },
  { number: 35, name: "فَاطِر", englishName: "Faatir", englishNameTranslation: "The Originator", revelationType: "Meccan", ayahCount: 45, juz: 22, page: 434 },
  { number: 36, name: "يس", englishName: "Yaseen", englishNameTranslation: "Yaseen", revelationType: "Meccan", ayahCount: 83, juz: 22, page: 440 },
  { number: 37, name: "الصَّافَّات", englishName: "As-Saaffaat", englishNameTranslation: "Those who set the Ranks", revelationType: "Meccan", ayahCount: 182, juz: 23, page: 446 },
  { number: 38, name: "ص", englishName: "Saad", englishNameTranslation: "Saad", revelationType: "Meccan", ayahCount: 88, juz: 23, page: 453 },
  { number: 39, name: "الزُّمَر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", revelationType: "Meccan", ayahCount: 75, juz: 23, page: 458 },
  { number: 40, name: "غَافِر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", revelationType: "Meccan", ayahCount: 85, juz: 24, page: 467 },
  { number: 41, name: "فُصِّلَت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", revelationType: "Meccan", ayahCount: 54, juz: 24, page: 477 },
  { number: 42, name: "الشُّورَى", englishName: "Ash-Shoora", englishNameTranslation: "The Consultation", revelationType: "Meccan", ayahCount: 53, juz: 25, page: 483 },
  { number: 43, name: "الزُّخْرُف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", revelationType: "Meccan", ayahCount: 89, juz: 25, page: 489 },
  { number: 44, name: "الدُّخَان", englishName: "Ad-Dukhaan", englishNameTranslation: "The Smoke", revelationType: "Meccan", ayahCount: 59, juz: 25, page: 496 },
  { number: 45, name: "الجَاثِيَة", englishName: "Al-Jaathiya", englishNameTranslation: "The Crouching", revelationType: "Meccan", ayahCount: 37, juz: 25, page: 499 },
  { number: 46, name: "الأَحْقَاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", revelationType: "Meccan", ayahCount: 35, juz: 26, page: 502 },
  { number: 47, name: "مُحَمَّد", englishName: "Muhammad", englishNameTranslation: "Muhammad", revelationType: "Medinan", ayahCount: 38, juz: 26, page: 507 },
  { number: 48, name: "الفَتْح", englishName: "Al-Fath", englishNameTranslation: "The Victory", revelationType: "Medinan", ayahCount: 29, juz: 26, page: 511 },
  { number: 49, name: "الحُجُرَات", englishName: "Al-Hujuraat", englishNameTranslation: "The Rooms", revelationType: "Medinan", ayahCount: 18, juz: 26, page: 515 },
  { number: 50, name: "ق", englishName: "Qaaf", englishNameTranslation: "Qaaf", revelationType: "Meccan", ayahCount: 45, juz: 26, page: 518 },
  { number: 51, name: "الذَّارِيَات", englishName: "Adh-Dhaariyat", englishNameTranslation: "The Winnowing Winds", revelationType: "Meccan", ayahCount: 60, juz: 26, page: 520 },
  { number: 52, name: "الطُّور", englishName: "At-Toor", englishNameTranslation: "The Mount", revelationType: "Meccan", ayahCount: 49, juz: 27, page: 523 },
  { number: 53, name: "النَّجْم", englishName: "An-Najm", englishNameTranslation: "The Star", revelationType: "Meccan", ayahCount: 62, juz: 27, page: 526 },
  { number: 54, name: "القَمَر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", revelationType: "Meccan", ayahCount: 55, juz: 27, page: 528 },
  { number: 55, name: "الرَّحْمَن", englishName: "Ar-Rahmaan", englishNameTranslation: "The Beneficent", revelationType: "Medinan", ayahCount: 78, juz: 27, page: 531 },
  { number: 56, name: "الوَاقِعَة", englishName: "Al-Waaqia", englishNameTranslation: "The Inevitable", revelationType: "Meccan", ayahCount: 96, juz: 27, page: 534 },
  { number: 57, name: "الحَدِيد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", revelationType: "Medinan", ayahCount: 29, juz: 27, page: 537 },
  { number: 58, name: "المُجَادَلَة", englishName: "Al-Mujaadila", englishNameTranslation: "The Pleading Woman", revelationType: "Medinan", ayahCount: 22, juz: 28, page: 542 },
  { number: 59, name: "الحَشْر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", revelationType: "Medinan", ayahCount: 24, juz: 28, page: 545 },
  { number: 60, name: "المُمْتَحَنَة", englishName: "Al-Mumtahana", englishNameTranslation: "She that is to be examined", revelationType: "Medinan", ayahCount: 13, juz: 28, page: 549 },
  { number: 61, name: "الصَّفّ", englishName: "As-Saff", englishNameTranslation: "The Ranks", revelationType: "Medinan", ayahCount: 14, juz: 28, page: 551 },
  { number: 62, name: "الجُمُعَة", englishName: "Al-Jumu'a", englishNameTranslation: "Friday", revelationType: "Medinan", ayahCount: 11, juz: 28, page: 553 },
  { number: 63, name: "المُنَافِقُون", englishName: "Al-Munaafiqoon", englishNameTranslation: "The Hypocrites", revelationType: "Medinan", ayahCount: 11, juz: 28, page: 554 },
  { number: 64, name: "التَّغَابُن", englishName: "At-Taghaabun", englishNameTranslation: "Mutual Disillusion", revelationType: "Medinan", ayahCount: 18, juz: 28, page: 556 },
  { number: 65, name: "الطَّلَاق", englishName: "At-Talaaq", englishNameTranslation: "Divorce", revelationType: "Medinan", ayahCount: 12, juz: 28, page: 558 },
  { number: 66, name: "التَّحْرِيم", englishName: "At-Tahreem", englishNameTranslation: "The Prohibition", revelationType: "Medinan", ayahCount: 12, juz: 28, page: 560 },
  { number: 67, name: "المُلْك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", revelationType: "Meccan", ayahCount: 30, juz: 29, page: 562 },
  { number: 68, name: "القَلَم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", revelationType: "Meccan", ayahCount: 52, juz: 29, page: 564 },
  { number: 69, name: "الحَاقَّة", englishName: "Al-Haaqqa", englishNameTranslation: "The Reality", revelationType: "Meccan", ayahCount: 52, juz: 29, page: 566 },
  { number: 70, name: "المَعَارِج", englishName: "Al-Ma'aarij", englishNameTranslation: "The Ascending Stairways", revelationType: "Meccan", ayahCount: 44, juz: 29, page: 568 },
  { number: 71, name: "نُوح", englishName: "Nooh", englishNameTranslation: "Noah", revelationType: "Meccan", ayahCount: 28, juz: 29, page: 570 },
  { number: 72, name: "الجِنّ", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", revelationType: "Meccan", ayahCount: 28, juz: 29, page: 572 },
  { number: 73, name: "المُزَّمِّل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", revelationType: "Meccan", ayahCount: 20, juz: 29, page: 574 },
  { number: 74, name: "المُدَّثِّر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", revelationType: "Meccan", ayahCount: 56, juz: 29, page: 575 },
  { number: 75, name: "القِيَامَة", englishName: "Al-Qiyaama", englishNameTranslation: "The Resurrection", revelationType: "Meccan", ayahCount: 40, juz: 29, page: 577 },
  { number: 76, name: "الإِنْسَان", englishName: "Al-Insaan", englishNameTranslation: "Man", revelationType: "Medinan", ayahCount: 31, juz: 29, page: 578 },
  { number: 77, name: "المُرْسَلَات", englishName: "Al-Mursalaat", englishNameTranslation: "The Emissaries", revelationType: "Meccan", ayahCount: 50, juz: 29, page: 580 },
  { number: 78, name: "النَّبَأ", englishName: "An-Naba", englishNameTranslation: "The Tidings", revelationType: "Meccan", ayahCount: 40, juz: 30, page: 582 },
  { number: 79, name: "النَّازِعَات", englishName: "An-Naazi'aat", englishNameTranslation: "Those who drag forth", revelationType: "Meccan", ayahCount: 46, juz: 30, page: 583 },
  { number: 80, name: "عَبَسَ", englishName: "Abasa", englishNameTranslation: "He frowned", revelationType: "Meccan", ayahCount: 42, juz: 30, page: 585 },
  { number: 81, name: "التَّكْوِير", englishName: "At-Takweer", englishNameTranslation: "The Overthrowing", revelationType: "Meccan", ayahCount: 29, juz: 30, page: 586 },
  { number: 82, name: "الانْفِطَار", englishName: "Al-Infitaar", englishNameTranslation: "The Cleaving", revelationType: "Meccan", ayahCount: 19, juz: 30, page: 587 },
  { number: 83, name: "المُطَفِّفِين", englishName: "Al-Mutaffifeen", englishNameTranslation: "Defrauding", revelationType: "Meccan", ayahCount: 36, juz: 30, page: 587 },
  { number: 84, name: "الانْشِقَاق", englishName: "Al-Inshiqaaq", englishNameTranslation: "The Splitting Open", revelationType: "Meccan", ayahCount: 25, juz: 30, page: 589 },
  { number: 85, name: "البُرُوج", englishName: "Al-Burooj", englishNameTranslation: "The Mansions of the Stars", revelationType: "Meccan", ayahCount: 22, juz: 30, page: 590 },
  { number: 86, name: "الطَّارِق", englishName: "At-Taariq", englishNameTranslation: "The Morning Star", revelationType: "Meccan", ayahCount: 17, juz: 30, page: 591 },
  { number: 87, name: "الأَعْلَى", englishName: "Al-A'laa", englishNameTranslation: "The Most High", revelationType: "Meccan", ayahCount: 19, juz: 30, page: 591 },
  { number: 88, name: "الغَاشِيَة", englishName: "Al-Ghaashiya", englishNameTranslation: "The Overwhelming", revelationType: "Meccan", ayahCount: 26, juz: 30, page: 592 },
  { number: 89, name: "الفَجْر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", revelationType: "Meccan", ayahCount: 30, juz: 30, page: 593 },
  { number: 90, name: "البَلَد", englishName: "Al-Balad", englishNameTranslation: "The City", revelationType: "Meccan", ayahCount: 20, juz: 30, page: 594 },
  { number: 91, name: "الشَّمْس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", revelationType: "Meccan", ayahCount: 15, juz: 30, page: 595 },
  { number: 92, name: "اللَّيْل", englishName: "Al-Layl", englishNameTranslation: "The Night", revelationType: "Meccan", ayahCount: 21, juz: 30, page: 595 },
  { number: 93, name: "الضُّحَى", englishName: "Ad-Duhaa", englishNameTranslation: "The Morning Hours", revelationType: "Meccan", ayahCount: 11, juz: 30, page: 596 },
  { number: 94, name: "الشَّرْح", englishName: "Ash-Sharh", englishNameTranslation: "The Solace", revelationType: "Meccan", ayahCount: 8, juz: 30, page: 596 },
  { number: 95, name: "التِّين", englishName: "At-Teen", englishNameTranslation: "The Fig", revelationType: "Meccan", ayahCount: 8, juz: 30, page: 597 },
  { number: 96, name: "العَلَق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", revelationType: "Meccan", ayahCount: 19, juz: 30, page: 597 },
  { number: 97, name: "القَدْر", englishName: "Al-Qadr", englishNameTranslation: "The Power, Fate", revelationType: "Meccan", ayahCount: 5, juz: 30, page: 598 },
  { number: 98, name: "البَيِّنَة", englishName: "Al-Bayyina", englishNameTranslation: "The Clear Proof", revelationType: "Medinan", ayahCount: 8, juz: 30, page: 598 },
  { number: 99, name: "الزَّلْزَلَة", englishName: "Az-Zalzala", englishNameTranslation: "The Earthquake", revelationType: "Medinan", ayahCount: 8, juz: 30, page: 599 },
  { number: 100, name: "العَادِيَات", englishName: "Al-Aadiyaat", englishNameTranslation: "The Courser", revelationType: "Meccan", ayahCount: 11, juz: 30, page: 599 },
  { number: 101, name: "القَارِعَة", englishName: "Al-Qaari'a", englishNameTranslation: "The Calamity", revelationType: "Meccan", ayahCount: 11, juz: 30, page: 600 },
  { number: 102, name: "التَّكَاثُر", englishName: "At-Takaathur", englishNameTranslation: "Competition in Increase", revelationType: "Meccan", ayahCount: 8, juz: 30, page: 600 },
  { number: 103, name: "العَصْر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day, Epoch", revelationType: "Meccan", ayahCount: 3, juz: 30, page: 601 },
  { number: 104, name: "الهُمَزَة", englishName: "Al-Humaza", englishNameTranslation: "The Traducer", revelationType: "Meccan", ayahCount: 9, juz: 30, page: 601 },
  { number: 105, name: "الفِيل", englishName: "Al-Feel", englishNameTranslation: "The Elephant", revelationType: "Meccan", ayahCount: 5, juz: 30, page: 601 },
  { number: 106, name: "قُرَيْش", englishName: "Quraysh", englishNameTranslation: "Quraysh", revelationType: "Meccan", ayahCount: 4, juz: 30, page: 602 },
  { number: 107, name: "المَاعُون", englishName: "Al-Maa'oon", englishNameTranslation: "Small Kindnesses", revelationType: "Meccan", ayahCount: 7, juz: 30, page: 602 },
  { number: 108, name: "الكَوْثَر", englishName: "Al-Kawthar", englishNameTranslation: "Abundance", revelationType: "Meccan", ayahCount: 3, juz: 30, page: 602 },
  { number: 109, name: "الكَافِرُون", englishName: "Al-Kaafiroon", englishNameTranslation: "The Disbelievers", revelationType: "Meccan", ayahCount: 6, juz: 30, page: 603 },
  { number: 110, name: "النَّصْر", englishName: "An-Nasr", englishNameTranslation: "Divine Support", revelationType: "Medinan", ayahCount: 3, juz: 30, page: 603 },
  { number: 111, name: "المَسَد", englishName: "Al-Masad", englishNameTranslation: "Palm Fibre", revelationType: "Meccan", ayahCount: 5, juz: 30, page: 603 },
  { number: 112, name: "الإِخْلَاص", englishName: "Al-Ikhlaas", englishNameTranslation: "Sincerity", revelationType: "Meccan", ayahCount: 4, juz: 30, page: 604 },
  { number: 113, name: "الفَلَق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", revelationType: "Meccan", ayahCount: 5, juz: 30, page: 604 },
  { number: 114, name: "النَّاس", englishName: "An-Naas", englishNameTranslation: "Mankind", revelationType: "Meccan", ayahCount: 6, juz: 30, page: 604 }
];

export const POPULAR_SURAHS = [1, 18, 36, 55, 56, 67, 112, 113, 114];

export const BASMALA = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

// Bundled instant offline ayahs for Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas, and Al-Kawthar
export const BUNDLED_SURAHS: Record<number, Ayah[]> = {
  1: [
    { number: 1, numberInQuran: 1, text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tafsir: "أبدأ قراءتي مستعينا باسم الله تعالى، الرحمن الذي وسعت رحمته كل شيء، الرحيم بعباده المؤمنين." },
    { number: 2, numberInQuran: 2, text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", tafsir: "الثناء التام الكامل لله وحده، خالق الخلائق ومالكهم ومدبر أمورهم ومربيهم بنعمه." },
    { number: 3, numberInQuran: 3, text: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tafsir: "الرحمن ذو الرحمة العامة الشاملة لجميع الخلائق، والرحيم بالمؤمنين خاصة." },
    { number: 4, numberInQuran: 4, text: "مَٰلِكِ يَوْمِ ٱلدِّينِ", tafsir: "المتصرف وحده سبحانه في يوم الحساب والجزاء، وهو يوم القيامة." },
    { number: 5, numberInQuran: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", tafsir: "نخصك وحدك بالعبادة لا شريك لك، ونستعين بك وحدك في جميع أمورنا." },
    { number: 6, numberInQuran: 6, text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", tafsir: "وفقنا وأرشدنا وثبتنا على الصراط السوي المستقيم، وهو الإسلام." },
    { number: 7, numberInQuran: 7, text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", tafsir: "طريق الذين أنعمت عليهم من النبيين والصدّيقين والشهداء والصالحين، غير طريق المغضوب عليهم وهم اليهود ومن شابههم، ولا الضالين وهم النصارى ومن على ملتهم." }
  ],
  108: [
    { number: 1, numberInQuran: 6194, text: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ", tafsir: "إنا أعطيناك يا محمد الخير الكثير والفضل العظيم، ومنه نهر الكوثر في الجنة." },
    { number: 2, numberInQuran: 6195, text: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ", tafsir: "فأخلص لربك صلاتك كلها، واذبح ذبيحتك له وحده شكرا على نعمائه." },
    { number: 3, numberInQuran: 6196, text: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ", tafsir: "إن مبغضك وعدوك هو المنقطع عن كل خير، المقطوع ذكره وأثره." }
  ],
  112: [
    { number: 1, numberInQuran: 6222, text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", tafsir: "قل يا محمد: الله سبحانه واحد لا شريك له ولا مثيل ولا نظير." },
    { number: 2, numberInQuran: 6223, text: "ٱللَّهُ ٱلصَّمَدُ", tafsir: "الله السيد الكامل في صفاته، الذي تصمد إليه الخلائق في حوائجها ورغائبها." },
    { number: 3, numberInQuran: 6224, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", tafsir: "ليس له ولد ولا والد، منزه عن صفات النقص والمماثلة." },
    { number: 4, numberInQuran: 6225, text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ", tafsir: "ولم يكن له مماثل ولا مكافئ في أسمائه وصفاته وأفعاله سبحانه." }
  ],
  113: [
    { number: 1, numberInQuran: 6226, text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", tafsir: "قل: أعتصم وأتحصن برب الصبح وفالقه بنوره." },
    { number: 2, numberInQuran: 6227, text: "مِن شَرِّ مَا خَلَقَ", tafsir: "من شر جميع ما خلق الله من الإنس والجن والحيوان والدواب وجميع المؤذيات." },
    { number: 3, numberInQuran: 6228, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", tafsir: "ومن شر ليل مظلم إذا أقبل ودخل بظلامه وما ينتشر فيه من الشرور." },
    { number: 4, numberInQuran: 6229, text: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ", tafsir: "ومن شر السواحر اللاتي يعقدن العقد وينفثن فيها بالسحر والأذى." },
    { number: 5, numberInQuran: 6230, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", tafsir: "ومن شر كل حاسد يتمنى زوال نعمة غيره ويبدي حسده ويعمل بمقتضاه." }
  ],
  114: [
    { number: 1, numberInQuran: 6231, text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", tafsir: "قل: ألتجئ وأعتصم برب الناس وخالقهم ومدبر أمورهم." },
    { number: 2, numberInQuran: 6232, text: "مَلِكِ ٱلنَّاسِ", tafsir: "ملك الناس المتصرف فيهم بسلطانه وقضائه وقدره." },
    { number: 3, numberInQuran: 6233, text: "إِلَٰهِ ٱلنَّاسِ", tafsir: "معبود الناس الحق الذي لا معبود سواه بحق." },
    { number: 4, numberInQuran: 6234, text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", tafsir: "من شر الشيطان الذي يوسوس عند الغفلة، ويخنس ويتراجع إذا ذكر الله." },
    { number: 5, numberInQuran: 6235, text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", tafsir: "الذي يبث الشر والشك والشبهات في قلوب البشر." },
    { number: 6, numberInQuran: 6236, text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", tafsir: "من شياطين الجن وشياطين الإنس الذين يزينون الباطل." }
  ]
};
