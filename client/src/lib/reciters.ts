// Reciters list (Quran.com API v4 recitation IDs)
export const RECITERS = [
    { id: "3", name: "Abdurrahmaan As-Sudais", arabicName: "عبدالرحمن السديس" },
    { id: "7", name: "Mishary Alafasy", arabicName: "مشاري العفاسي" },
    { id: "6", name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري" },
    { id: "9", name: "Muhammad Siddiq Al-Minshawi", arabicName: "محمد صديق المنشاوي" },
    { id: "2", name: "Abdul Basit (Murattal)", arabicName: "عبد الباسط عبد الصمد" },
    { id: "10", name: "Saood Ash-Shuraym", arabicName: "سعود الشريم" },
    { id: "4", name: "Abu Bakr al-Shatri", arabicName: "أبو بكر الشاطري" },
    { id: "5", name: "Hani ar-Rifai", arabicName: "هاني الرفاعي" },
];

export const DEFAULT_RECITER = "3";

export function reciterName(id: string): string {
    return RECITERS.find((r) => r.id === id)?.name ?? "Quran recitation";
}
