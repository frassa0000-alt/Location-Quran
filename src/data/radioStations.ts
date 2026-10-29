export interface RadioStation {
  id: string;
  name: string;
  description: string;
  url: string;
  fallbackUrls?: string[];
  category: 'general' | 'reciter' | 'tafsir';
  city: string;
  country: string;
  timeZone: string; // e.g. 'Africa/Cairo', 'Asia/Riyadh'
  coordinates: { lat: number; lng: number };
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'cairo',
    name: 'إذاعة القرآن الكريم - القاهرة',
    description: 'البث الحي والمباشر لإذاعة القرآن الكريم من ماسبيرو - القاهرة 24/7 بتوقيت القاهرة الرسمي',
    url: 'https://radio.xecod.com/station/quran-cairo',
    fallbackUrls: [
      'https://stream.zeno.fm/f3wvbbqmdg8uv',
      'https://stream.radiojar.com/8s5u5tpdtwzuv',
      'https://backup.qurango.net/radio/cairo'
    ],
    category: 'general',
    city: 'القاهرة',
    country: 'مصر',
    timeZone: 'Africa/Cairo',
    coordinates: { lat: 30.0444, lng: 31.2357 }
  },
  {
    id: 'makkah',
    name: 'إذاعة القرآن الكريم - مكة المكرمة والحرم المكي',
    description: 'تلاوات الحرم المكي الشريف وأجواء المسجد الحرام العطرة 24/7 بتوقيت أم القرى',
    url: 'https://qurango.net/radio/mix',
    fallbackUrls: [
      'https://radio.mp3islam.com/listen/sudais/radio.mp3',
      'https://backup.qurango.net/radio/salma'
    ],
    category: 'general',
    city: 'مكة المكرمة',
    country: 'السعودية',
    timeZone: 'Asia/Riyadh',
    coordinates: { lat: 21.4225, lng: 39.8262 }
  },
  {
    id: 'makkah_sudais',
    name: 'إذاعة الحرم المكي (الشيخ عبد الرحمن السديس)',
    description: 'تلاوات إمام وخطيب المسجد الحرام الشيخ عبد الرحمن السديس بتوقيت مكة',
    url: 'https://radio.mp3islam.com/listen/sudais/radio.mp3',
    fallbackUrls: ['https://qurango.net/radio/mix'],
    category: 'reciter',
    city: 'مكة المكرمة',
    country: 'السعودية',
    timeZone: 'Asia/Riyadh',
    coordinates: { lat: 21.4225, lng: 39.8262 }
  },
  {
    id: 'abdulbasit_radio',
    name: 'إذاعة عبد الباسط عبد الصمد (توقيت القاهرة)',
    description: 'المصحف المرتل والمجود برواية حفص عن عاصم بصوت صوت مكة والقاهرة',
    url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
    fallbackUrls: ['https://radio.mp3islam.com/listen/abdulbasit/radio.mp3'],
    category: 'reciter',
    city: 'القاهرة',
    country: 'مصر',
    timeZone: 'Africa/Cairo',
    coordinates: { lat: 30.0444, lng: 31.2357 }
  },
  {
    id: 'minshawi_radio',
    name: 'إذاعة محمد صديق المنشاوي (توقيت القاهرة)',
    description: 'تلاوات خاشعة مرتعشة بالنقاء الإيماني لأحد عمالقة التلاوة المصرية',
    url: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi',
    fallbackUrls: ['https://radio.mp3islam.com/listen/minshawi/radio.mp3'],
    category: 'reciter',
    city: 'القاهرة',
    country: 'مصر',
    timeZone: 'Africa/Cairo',
    coordinates: { lat: 30.0444, lng: 31.2357 }
  },
  {
    id: 'husary_radio',
    name: 'إذاعة محمود خليل الحصري (توقيت القاهرة)',
    description: 'شيخ عموم المقارئ المصرية بأعلى درجات الإتقان وأحكام التجويد',
    url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary',
    fallbackUrls: ['https://backup.qurango.net/radio/tarateel'],
    category: 'reciter',
    city: 'القاهرة',
    country: 'مصر',
    timeZone: 'Africa/Cairo',
    coordinates: { lat: 30.0444, lng: 31.2357 }
  },
  {
    id: 'alafasy_radio',
    name: 'إذاعة مشاري راشد العفاسي',
    description: 'تلاوات خاشعة بصوت القارئ مشاري العفاسي 24/7',
    url: 'https://backup.qurango.net/radio/mishary_alafasi',
    fallbackUrls: ['https://radio.mp3islam.com/listen/mishary/radio.mp3'],
    category: 'reciter',
    city: 'الكويت',
    country: 'الكويت',
    timeZone: 'Asia/Kuwait',
    coordinates: { lat: 29.3759, lng: 47.9774 }
  },
  {
    id: 'maher_radio',
    name: 'إذاعة ماهر المعيقلي',
    description: 'تلاوات ندية ومريحة من رحاب الحرم المكي الشريف',
    url: 'https://backup.qurango.net/radio/maher',
    fallbackUrls: ['https://radio.mp3islam.com/listen/maher/radio.mp3'],
    category: 'reciter',
    city: 'مكة المكرمة',
    country: 'السعودية',
    timeZone: 'Asia/Riyadh',
    coordinates: { lat: 21.4225, lng: 39.8262 }
  },
  {
    id: 'dossari_radio',
    name: 'إذاعة الشيخ ياسر الدوسري',
    description: 'تلاوات خاشعة شجية لإمام الحرم المكي الشريف الشيخ ياسر الدوسري 24/7',
    url: 'https://backup.qurango.net/radio/yasser_aldosari',
    fallbackUrls: ['https://backup.qurango.net/radio/ibrahim_aldosari'],
    category: 'reciter',
    city: 'مكة المكرمة',
    country: 'السعودية',
    timeZone: 'Asia/Riyadh',
    coordinates: { lat: 21.4225, lng: 39.8262 }
  },
  {
    id: 'ajmi_radio',
    name: 'إذاعة الشيخ أحمد بن علي العجمي',
    description: 'تلاوات ندية ومؤثرة بصوت القارئ أحمد بن علي العجمي على مدار الساعة',
    url: 'https://backup.qurango.net/radio/ahmad_alajmy',
    category: 'reciter',
    city: 'الخبر',
    country: 'السعودية',
    timeZone: 'Asia/Riyadh',
    coordinates: { lat: 26.2172, lng: 50.1971 }
  },
  {
    id: 'tafsir_radio',
    name: 'إذاعة تفسير القرآن الكريم',
    description: 'شرح وتفسير معاني الآيات والسور الكريمة بتوقيت القاهرة',
    url: 'https://backup.qurango.net/radio/tafseer',
    category: 'tafsir',
    city: 'القاهرة',
    country: 'مصر',
    timeZone: 'Africa/Cairo',
    coordinates: { lat: 30.0444, lng: 31.2357 }
  },
  {
    id: 'adhkar_radio',
    name: 'إذاعة الرقية الشرعية والأذكار',
    description: 'أذكار الصباح والمساء والرقية الشرعية على مدار الساعة',
    url: 'https://backup.qurango.net/radio/roqiah',
    category: 'general',
    city: 'مكة المكرمة',
    country: 'السعودية',
    timeZone: 'Asia/Riyadh',
    coordinates: { lat: 21.4225, lng: 39.8262 }
  }
];
