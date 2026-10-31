export interface Hadith {
  text: string;
  arabic: string;
  source: string;
}

export const HADITHS: Hadith[] = [
  {
    text: "Shalat berjamaah lebih utama dua puluh tujuh derajat daripada shalat sendirian.",
    arabic: "صَلَاةُ الْجَمَاعَةِ تَفْضُلُ صَلَاةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً",
    source: "HR. Bukhari no. 645 dan Muslim no. 650",
  },
  {
    text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.",
    arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
    source: "HR. ath-Thabarani, al-Mu‘jam al-Awsath no. 5787",
  },
  {
    text: "Barangsiapa menempuh jalan untuk mencari ilmu, Allah mudahkan baginya jalan menuju surga.",
    arabic: "وَمَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    source: "HR. Muslim no. 2699 (penggalan hadits)",
  },
  {
    text: "Barang siapa beriman kepada Allah dan hari akhir, hendaklah ia berbuat baik kepada tetangganya.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُحْسِنْ إِلَى جَارِهِ",
    source: "HR. Bukhari no. 6018 dan Muslim no. 47",
  },
  {
    text: "Sebaik-baik kalian adalah yang mempelajari Al-Qur’an dan mengajarkannya.",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    source: "HR. Bukhari no. 5027",
  },
];
