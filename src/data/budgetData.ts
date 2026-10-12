import { BudgetSavingTip, FamilyBudgetState } from "../types";

/**
 * Calculates Swedish child allowance (Barnbidrag + Flerbarnstillägg)
 * Based on official Försäkringskassan rates
 */
export function calculateBarnbidrag(childCount: number): number {
  if (childCount <= 0) return 0;
  const basePerChild = 1250;
  const baseTotal = childCount * basePerChild;

  // Flerbarnstillägg (Large family supplement rates)
  let flerbarnstillagg = 0;
  if (childCount === 2) flerbarnstillagg = 150;
  else if (childCount === 3) flerbarnstillagg = 730;
  else if (childCount === 4) flerbarnstillagg = 1740;
  else if (childCount === 5) flerbarnstillagg = 2990;
  else if (childCount > 5) flerbarnstillagg = 2990 + (childCount - 5) * 1250;

  return baseTotal + flerbarnstillagg;
}

/**
 * Calculates national reference living benchmark based on Konsumentverket figures
 */
export function calculateKonsumentverketBenchmark(adults: number, children: number) {
  // Approximate standard monthly reference costs (Konsumentverkets beräknade hushållskostnader)
  const foodPerAdult = 3600;
  const foodPerChild = 2400;
  const clothingPerAdult = 950;
  const clothingPerChild = 800;
  const hygienePerAdult = 500;
  const hygienePerChild = 350;
  const phoneMediaPerAdult = 1400;
  const phoneMediaPerChild = 700;

  const totalFood = adults * foodPerAdult + children * foodPerChild;
  const totalClothing = adults * clothingPerAdult + children * clothingPerChild;
  const totalHygiene = adults * hygienePerAdult + children * hygienePerChild;
  const totalMedia = adults * phoneMediaPerAdult + children * phoneMediaPerChild;
  const standardHouseholdBasic = totalFood + totalClothing + totalHygiene + totalMedia;

  return {
    foodReference: totalFood,
    clothingReference: totalClothing,
    hygieneReference: totalHygiene,
    mediaReference: totalMedia,
    totalBasicLivingCosts: standardHouseholdBasic,
  };
}

export interface BudgetPreset {
  id: string;
  nameArabic: string;
  nameSwedish: string;
  descriptionArabic: string;
  icon: string;
  data: FamilyBudgetState;
}

export const BUDGET_PRESETS: BudgetPreset[] = [
  {
    id: "newcomer-2kids",
    nameArabic: "أسرة وافدة حديثاً (أب وأم وطفلان)",
    nameSwedish: "Nyanländ familj (2 vuxna + 2 barn)",
    descriptionArabic: "دخل يعتمد على بدلات الترسيخ (Etableringsersättning) ودعم السكن ونفقات المعيشة الأساسية.",
    icon: "🏠",
    data: {
      adultsCount: 2,
      childrenCount: 2,
      cityType: "medium",
      incomes: {
        salary1: 0,
        salary2: 0,
        barnbidrag: 2650,
        bostadsbidrag: 3800,
        etableringOrCSN: 14600,
        otherIncome: 0,
      },
      expenses: {
        rent: 7800,
        electricityAndHeating: 650,
        homeInsurance: 180,
        groceries: 6200,
        childcareAndSchool: 850,
        childrenClothing: 600,
        publicTransit: 1400,
        carAndFuel: 0,
        phoneAndInternet: 650,
        healthAndMedication: 300,
        unionAndAkassa: 280,
        leisureAndActivities: 400,
        emergencySavings: 500,
      },
    },
  },
  {
    id: "working-family-1kid",
    nameArabic: "أسرة عاملة متوسطة (أب وأم وطفل واحد)",
    nameSwedish: "Medelinkomstfamilj (2 vuxna + 1 barn)",
    descriptionArabic: "نموذج لأسرة ذات دخل وظيفي مستقر مع رعاية أطفال وتأمين وسيارة أو مواصلات عامة.",
    icon: "💼",
    data: {
      adultsCount: 2,
      childrenCount: 1,
      cityType: "large",
      incomes: {
        salary1: 24500,
        salary2: 19000,
        barnbidrag: 1250,
        bostadsbidrag: 0,
        etableringOrCSN: 0,
        otherIncome: 0,
      },
      expenses: {
        rent: 11500,
        electricityAndHeating: 1100,
        homeInsurance: 240,
        groceries: 7500,
        childcareAndSchool: 1680,
        childrenClothing: 900,
        publicTransit: 1020,
        carAndFuel: 3200,
        phoneAndInternet: 850,
        healthAndMedication: 450,
        unionAndAkassa: 720,
        leisureAndActivities: 1800,
        emergencySavings: 3500,
      },
    },
  },
  {
    id: "single-parent-2kids",
    nameArabic: "معيل وحيد مع طفلين (أم أو أب)",
    nameSwedish: "Ensamstående förälder med 2 barn",
    descriptionArabic: "نموذج لإدارة ميزانية الوالد المعيل بالاعتماد على دعم السكن ومكملات الأطفال المزدوجة.",
    icon: "🌟",
    data: {
      adultsCount: 1,
      childrenCount: 2,
      cityType: "medium",
      incomes: {
        salary1: 18500,
        salary2: 0,
        barnbidrag: 2650,
        bostadsbidrag: 4200,
        etableringOrCSN: 0,
        otherIncome: 3200, // Underhållsstöd (Child maintenance)
      },
      expenses: {
        rent: 8900,
        electricityAndHeating: 700,
        homeInsurance: 190,
        groceries: 5800,
        childcareAndSchool: 950,
        childrenClothing: 800,
        publicTransit: 850,
        carAndFuel: 0,
        phoneAndInternet: 550,
        healthAndMedication: 350,
        unionAndAkassa: 360,
        leisureAndActivities: 800,
        emergencySavings: 1000,
      },
    },
  },
  {
    id: "large-family-4kids",
    nameArabic: "أسرة كبيرة (أب وأم و 4 أطفال)",
    nameSwedish: "Stor familj med 4 barn",
    descriptionArabic: "إدارة مصاريف الأسر الكبيرة مع الاستفادة الكاملة من علاوة الأطفال الإضافية (Flerbarnstillägg).",
    icon: "👨‍👩‍👧‍👦",
    data: {
      adultsCount: 2,
      childrenCount: 4,
      cityType: "small",
      incomes: {
        salary1: 27000,
        salary2: 12000,
        barnbidrag: 6740,
        bostadsbidrag: 4900,
        etableringOrCSN: 0,
        otherIncome: 0,
      },
      expenses: {
        rent: 12800,
        electricityAndHeating: 1600,
        homeInsurance: 260,
        groceries: 12500,
        childcareAndSchool: 2400,
        childrenClothing: 2100,
        publicTransit: 1700,
        carAndFuel: 3800,
        phoneAndInternet: 950,
        healthAndMedication: 600,
        unionAndAkassa: 700,
        leisureAndActivities: 1800,
        emergencySavings: 2000,
      },
    },
  },
];

export const SWEDISH_SAVING_TIPS: BudgetSavingTip[] = [
  {
    id: "groceries-flyers-discount",
    category: "groceries",
    titleArabic: "مقارنة عروض السوبرماركت والتسوق الأسبوعي (Matpriskollen)",
    titleSwedish: "Handla efter veckans extrapriser",
    descriptionArabic: "استخدام تطبيقات عروض المتاجر الأسبوعية (مثل Matpriskollen أو عروض Willys و Lidl) وشراء الحبوب والخضروات الأساسية بالجملة بدلاً من المتاجر الصغيرة السريعة.",
    estimatedSavingSEK: 1200,
    difficulty: "easy",
    sourceName: "Konsumentverket",
    swedishTerm: "Extrapriser & Veckoblad",
  },
  {
    id: "second-hand-winter-overalls",
    category: "childrenClothing",
    titleArabic: "ملابس الشتاء والأوفرول المستعمل بحالة ممتازة (Second Hand)",
    titleSwedish: "Köp vinterkläder och overaller second hand",
    descriptionArabic: "شراء ملابس الشتاء للأطفال (Overaller, Vinterskor من ماركات قوية مثل Polarn O. Pyret و Didriksons) عبر مواقع مثل Tradera و Vinted و Sellpy أو متاجر Erikshjälpen / Röda Korset. توفر أكثر من 65% من السعر الجديد.",
    estimatedSavingSEK: 950,
    difficulty: "easy",
    sourceName: "Tradera / Röda Korset",
    swedishTerm: "Begagnat & Second Hand",
  },
  {
    id: "bostadsbidrag-application",
    category: "bostadsbidrag",
    titleArabic: "التقديم على دعم السكن للعائلات التي لديها أطفال (Bostadsbidrag)",
    titleSwedish: "Ansök om bostadsbidrag hos Försäkringskassan",
    descriptionArabic: "يحق لكثير من العائلات ذات الدخل المنخفض أو المتوسط ولديها أطفال الحصول على دعم شهري لإيجار المنزل من صندوق التأمينات العامة (Försäkringskassan).",
    estimatedSavingSEK: 2500,
    difficulty: "medium",
    sourceName: "Försäkringskassan",
    swedishTerm: "Bostadsbidrag för barnfamiljer",
  },
  {
    id: "electricity-contract-negotiation",
    category: "electricity",
    titleArabic: "مقارنة عقود الكهرباء وتجنب السعر المفروض (Tillsvidarepris)",
    titleSwedish: "Jämför elavtal och undvik anvisat pris",
    descriptionArabic: "لا تبقَ أبداً على عقد الكهرباء الافتراضي الغالي (Anvisningspris). قارن بين العقود المتغيرة (Rörligt elpris) عبر موقع Elskling.se لتوفير مئات الكرونات شهرياً.",
    estimatedSavingSEK: 450,
    difficulty: "easy",
    sourceName: "Energimarknadsbyrån",
    swedishTerm: "Rörligt elavtal / Elskling",
  },
  {
    id: "mobile-discount-operators",
    category: "phoneAndInternet",
    titleArabic: "الانتقال إلى شركات الاتصالات الاقتصادية منخفضة التكلفة",
    titleSwedish: "Byt till lågprisoperatörer för mobilabonnemang",
    descriptionArabic: "التحويل من المشغلين الكبار المرتفعي التكلفة إلى شركات تابعة منخفضة السعر مثل (Hallon, Vimla, Fello) والتي تستخدم نفس شبكات التغطية القوية لكن بأسعار تبدأ من 99-145 كرونة شهرياً.",
    estimatedSavingSEK: 350,
    difficulty: "easy",
    sourceName: "Konsumenternas",
    swedishTerm: "Lågprisoperatör",
  },
  {
    id: "school-transit-pass",
    category: "publicTransit",
    titleArabic: "بطاقة المواصلات المدرسية المجانية للطلاب (Skolkort)",
    titleSwedish: "Gratis skolkort via kommunen",
    descriptionArabic: "تأكد من التقديم على بطاقة المواصلات المدرسية المجانية من البلدية (Kommunen) للأطفال الذين تبعد مدرستهم مسافة معينة عن المنزل، واستفد من سفر الأطفال مجاناً مع الوالدين في عطل نهاية الأسبوع في بعض المدن.",
    estimatedSavingSEK: 650,
    difficulty: "easy",
    sourceName: "Kommun & Kollektivtrafik",
    swedishTerm: "Skolkort för elever",
  },
  {
    id: "maxtaxa-childcare",
    category: "childcareAndSchool",
    titleArabic: "التأكد من دقة حساب سقف رسوم الروضة (Maxtaxa)",
    titleSwedish: "Kontrollera din maxtaxa för förskola och fritids",
    descriptionArabic: "رسوم الروضة والفريتيدس تخضع لنظام السقف الأعلى (Maxtaxa) وتحسب كنسبة مئوية من دخل الأسرة الإجمالي. إذا انخفض دخلك، قم بتحديث بياناتك لدى البلدية فوراً لتخفيض الفاتورة.",
    estimatedSavingSEK: 700,
    difficulty: "medium",
    sourceName: "Skolverket",
    swedishTerm: "Maxtaxa förskola",
  },
  {
    id: "free-activities-library",
    category: "leisureAndActivities",
    titleArabic: "الأنشطة المجانية والمكتبات ومنح الأنشطة الرياضية (Fritidskort)",
    titleSwedish: "Utnyttja bibliotekets gratisaktiviteter och föreningsstöd",
    descriptionArabic: "تقدم المكتبات العامة السويدية كتباً، إنترنت، ومسرحيات مجانية للأطفال. كما تقدم العديد من البلديات والجمعيات (Föreningar) دعماً للأطفال للمشاركة في الرياضة والسباحة.",
    estimatedSavingSEK: 500,
    difficulty: "easy",
    sourceName: "Biblioteket & Riksidrottsförbundet",
    swedishTerm: "Fritidspeng & Föreningsliv",
  },
  {
    id: "emergency-buffer-account",
    category: "emergencySavings",
    titleArabic: "بناء صندوق طوارئ آمن بحساب عالي الفائدة (Buffertsparande)",
    titleSwedish: "Buffertsparande på konto med ränta och insättningsgaranti",
    descriptionArabic: "توصي هيئة حماية المستهلك بامتلاك صندوق طوارئ يعادل مصاريف شهر إلى شهرين في حساب بنكي ذي فائدة مضمونة (Statlig insättningsgaranti) لتغطية الأعطال المفاجئة أو فواتير الأسنان.",
    estimatedSavingSEK: 600,
    difficulty: "medium",
    sourceName: "Konsumentverket",
    swedishTerm: "Buffertkonto",
  },
];

export const BUDGET_GLOSSARY = [
  {
    term: "Disponibel inkomst",
    arabic: "الدخل الصافي المتاح",
    desc: "المبلغ المالي المتبقي للأسرة بعد خصم الضرائب وإضافة جميع المساعدات والبدلات الحكومية.",
  },
  {
    term: "Buffertsparande",
    arabic: "ادخار الطوارئ",
    desc: "مبلغ مالي مخصص للحوادث الطارئة مثل تعطل الأجهزة المنزلية أو نفقات العلاج غير المتوقعة.",
  },
  {
    term: "Maxtaxa",
    arabic: "السقف الأعلى لرسوم الروضة",
    desc: "قانون سويدي يحدد أقصى مبلغ يمكن للبلدية فرضه كرسوم لرعاية الأطفال والروضة حسب الدخل.",
  },
  {
    term: "Bostadsbidrag",
    arabic: "دعم السكن للأسرة",
    desc: "مساعدة مالية شهرية غير خاضعة للضريبة من التأمينات السويدية للعائلات المستأجرة أو المالكة للمسكن.",
  },
  {
    term: "Konsumentverket",
    arabic: "مصلحة حماية المستهلك السويدية",
    desc: "الجهة الحكومية التي تصدر سنوياً التقديرات المرجعية لتكاليف المعيشة والسلع الأساسية للأسر في السويد.",
  },
  {
    term: "Högkostnadsskydd",
    arabic: "سقف التكلفة القصوى للعلاج والدواء",
    desc: "نظام يضمن أنك لن تدفع أكثر من حد أقصى سنوي للزيارات الطبية والأدوية الموصوفة بوصفة طبية.",
  },
];
