export interface Reciter {
  id: string;
  name: string;
  subname: string;
  style: string;
  serverUrl: string;
  ayahSubfolder?: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'مشاري بن راشد العفاسي',
    subname: 'رواية حفص عن عاصم',
    style: 'مرتل خاشع',
    serverUrl: 'https://server8.mp3quran.net/afs',
    ayahSubfolder: 'Alafasy_128kbps'
  },
  {
    id: 'abdulbasit',
    name: 'عبد الباسط عبد الصمد',
    subname: 'المصحف المرتل',
    style: 'مرتل',
    serverUrl: 'https://server7.mp3quran.net/basit',
    ayahSubfolder: 'Abdul_Basit_Murattal_192kbps'
  },
  {
    id: 'minshawi',
    name: 'محمد صديق المنشاوي',
    subname: 'رواية حفص عن عاصم',
    style: 'مرتل متقن',
    serverUrl: 'https://server10.mp3quran.net/minsh',
    ayahSubfolder: 'Minshawy_Murattal_128kbps'
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري',
    subname: 'المصحف المرتل',
    style: 'أستاذ القراء',
    serverUrl: 'https://server13.mp3quran.net/husr',
    ayahSubfolder: 'Husary_128kbps'
  },
  {
    id: 'maher',
    name: 'ماهر المعيقلي',
    subname: 'إمام الحرم المكي',
    style: 'مرتل عذب',
    serverUrl: 'https://server12.mp3quran.net/maher',
    ayahSubfolder: 'MaherAlMuaiqly128kbps'
  },
  {
    id: 'ghamdi',
    name: 'سعد الغامدي',
    subname: 'رواية حفص عن عاصم',
    style: 'مرتل شجي',
    serverUrl: 'https://server7.mp3quran.net/s_gmd',
    ayahSubfolder: 'Ghamadi_40kbps'
  },
  {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    subname: 'رواية حفص عن عاصم',
    style: 'مرتل مؤثر',
    serverUrl: 'https://server11.mp3quran.net/shatri',
    ayahSubfolder: 'Abu_Bakr_Ash-Shaatree_128kbps'
  },
  {
    id: 'ajmy',
    name: 'أحمد بن علي العجمي',
    subname: 'رواية حفص عن عاصم',
    style: 'مرتل خاشع',
    serverUrl: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1',
    ayahSubfolder: 'Ahmed_ibn_Ali_al-Ajamy_64kbps_QuranExplorer.Com'
  },
  {
    id: 'dossari',
    name: 'ياسر بن راشد الدوسري',
    subname: 'إمام الحرم المكي الشريف',
    style: 'تلاوة خاشعة شجية',
    serverUrl: 'https://cdn.mp3quran.net/audio/yasser-dosari/r1',
    ayahSubfolder: 'Yasser_Ad-Dussary_128kbps'
  },
  {
    id: 'ibrahim_dossari',
    name: 'إبراهيم الدوسري',
    subname: 'رواية حفص عن عاصم',
    style: 'مرتل متقن',
    serverUrl: 'https://cdn.mp3quran.net/audio/ibrahim-dosari/r2',
    ayahSubfolder: 'Alafasy_128kbps'
  }
];

export function getSurahAudioUrl(reciter: Reciter, surahNumber: number): string {
  const padded = String(surahNumber).padStart(3, '0');
  return `${reciter.serverUrl}/${padded}.mp3`;
}

export function getAyahAudioUrl(reciter: Reciter, surahNumber: number, ayahNumber: number): string {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumber).padStart(3, '0');
  const folder = reciter.ayahSubfolder || 'Alafasy_128kbps';
  return `https://everyayah.com/data/${folder}/${paddedSurah}${paddedAyah}.mp3`;
}
