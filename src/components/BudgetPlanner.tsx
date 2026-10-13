import React, { useState, useMemo } from "react";
import {
  Calculator,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  ShoppingBag,
  GraduationCap,
  Bus,
  Zap,
  Shield,
  Smartphone,
  Heart,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Sparkles,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  Wallet,
  Users,
  Building2,
  ExternalLink,
} from "lucide-react";
import {
  FamilyBudgetState,
  BudgetSavingTip,
  CategoryId,
} from "../types";
import {
  BUDGET_PRESETS,
  SWEDISH_SAVING_TIPS,
  BUDGET_GLOSSARY,
  calculateBarnbidrag,
  calculateKonsumentverketBenchmark,
} from "../data/budgetData";
import { AudioPlayerButton } from "./AudioPlayerButton";

interface BudgetPlannerProps {
  onAskAI?: (prefillQuestion: string, categoryId?: CategoryId) => void;
  onExploreCategory?: (categoryId: CategoryId) => void;
}

const EXPENSE_CATEGORIES_CONFIG = [
  {
    key: "rent" as const,
    labelArabic: "إيجار السكن / رسوم الشقة",
    labelSwedish: "Hyra / Bostadsavgift",
    icon: Home,
    color: "#005293",
    hint: "يشمل الإيجار الأساسي أو الرسوم الشهرية للبلدية/المالك",
  },
  {
    key: "groceries" as const,
    labelArabic: "المواد الغذائية والتموين المنزلي",
    labelSwedish: "Mat & Dagligvaror",
    icon: ShoppingBag,
    color: "#1E7E34",
    hint: "مشتريات السوبرماركت (Willys, ICA, Lidl) واللحوم والخضار",
  },
  {
    key: "childcareAndSchool" as const,
    labelArabic: "رسوم الروضة ورعاية ما بعد المدرسة",
    labelSwedish: "Förskoleavgift & Fritids",
    icon: GraduationCap,
    color: "#D97706",
    hint: "تخضع لنظام السقف الأعلى (Maxtaxa) وفق دخل الأسرة",
  },
  {
    key: "childrenClothing" as const,
    labelArabic: "ملابس وأحذية الأطفال ومعدات الشتاء",
    labelSwedish: "Barnkläder & Vinterskor",
    icon: Users,
    color: "#8B5CF6",
    hint: "الأوفرولات الشتوية، المعاطف المطرية، والأحذية المناسبة للطقس",
  },
  {
    key: "publicTransit" as const,
    labelArabic: "المواصلات العامة والبطاقات الشهرية",
    labelSwedish: "Kollektivtrafik (Månadskort)",
    icon: Bus,
    color: "#0284C7",
    hint: "بطاقات SL أو Västtrafik أو Skånetrafiken الشهرية",
  },
  {
    key: "carAndFuel" as const,
    labelArabic: "مصاريف السيارة والوقود والتأمين",
    labelSwedish: "Bil, Bensin & Försäkring",
    icon: Building2,
    color: "#64748B",
    hint: "وقود، تأمين سيارة، فحص دوري، وضريبة الطريق",
  },
  {
    key: "electricityAndHeating" as const,
    labelArabic: "فاتورة الكهرباء والتدفئة",
    labelSwedish: "El & Värme",
    icon: Zap,
    color: "#EAB308",
    hint: "عقد الكهرباء (Elnät + Elhandel) والتدفئة",
  },
  {
    key: "homeInsurance" as const,
    labelArabic: "التأمين المنزلي الإلزامي",
    labelSwedish: "Hemförsäkring",
    icon: Shield,
    color: "#10B981",
    hint: "ضروري جداً في السويد لحماية الممتلكات والمسؤولية القانونية",
  },
  {
    key: "phoneAndInternet" as const,
    labelArabic: "الهواتف المحمولة والإنترنت المنزلي",
    labelSwedish: "Mobil & Bredband",
    icon: Smartphone,
    color: "#EC4899",
    hint: "باقات الهواتف الذكية واشتراك الألياف الضوئية",
  },
  {
    key: "healthAndMedication" as const,
    labelArabic: "الصحة والأدوية والأسنان",
    labelSwedish: "Hälsa, Medicin & Tandvård",
    icon: Heart,
    color: "#EF4444",
    hint: "مشمول بسقف التكلفة القصوى (Högkostnadsskydd)",
  },
  {
    key: "unionAndAkassa" as const,
    labelArabic: "النقابة وصندوق البطالة",
    labelSwedish: "Fackförening & A-kassa",
    icon: Award,
    color: "#6366F1",
    hint: "أمان مالي أساسي في سوق العمل السويدي عند فقدان الوظيفة",
  },
  {
    key: "leisureAndActivities" as const,
    labelArabic: "الأنشطة الرياضية والترفيه",
    labelSwedish: "Fritid & Aktiviteter",
    icon: Sparkles,
    color: "#F59E0B",
    hint: "اشتراكات الأندية الرياضية، نوادي السباحة، والأنشطة العائلية",
  },
  {
    key: "emergencySavings" as const,
    labelArabic: "الادخار وصندوق الطوارئ",
    labelSwedish: "Buffertsparande",
    icon: PiggyBank,
    color: "#059669",
    hint: "مخصص للمصروفات غير المتوقعة (إصلاحات، طوارئ الأسنان)",
  },
];

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  onAskAI,
  onExploreCategory,
}) => {
  // Budget State initialized with newcomer preset
  const [budget, setBudget] = useState<FamilyBudgetState>(BUDGET_PRESETS[0].data);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("newcomer-2kids");
  const [autoCalculateBarnbidrag, setAutoCalculateBarnbidrag] = useState(true);
  const [activeTab, setActiveTab] = useState<"planner" | "tips" | "benchmark" | "glossary">("planner");
  const [selectedTipCategory, setSelectedTipCategory] = useState<string>("all");
  const [appliedTipIds, setAppliedTipIds] = useState<Record<string, boolean>>({});
  const [copiedReport, setCopiedReport] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Apply a preset
  const handleSelectPreset = (preset: typeof BUDGET_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setBudget(JSON.parse(JSON.stringify(preset.data)));
  };

  // Update adults count
  const handleAdultsChange = (delta: number) => {
    const next = Math.max(1, Math.min(4, budget.adultsCount + delta));
    setBudget((prev) => ({ ...prev, adultsCount: next }));
  };

  // Update children count
  const handleChildrenChange = (delta: number) => {
    const next = Math.max(0, Math.min(8, budget.childrenCount + delta));
    const newBarnbidrag = autoCalculateBarnbidrag ? calculateBarnbidrag(next) : budget.incomes.barnbidrag;
    setBudget((prev) => ({
      ...prev,
      childrenCount: next,
      incomes: {
        ...prev.incomes,
        barnbidrag: newBarnbidrag,
      },
    }));
  };

  // Handle Income Change
  const handleIncomeChange = (field: keyof typeof budget.incomes, value: number) => {
    setBudget((prev) => ({
      ...prev,
      incomes: {
        ...prev.incomes,
        [field]: Math.max(0, isNaN(value) ? 0 : value),
      },
    }));
  };

  // Handle Expense Change
  const handleExpenseChange = (field: keyof typeof budget.expenses, value: number) => {
    setBudget((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [field]: Math.max(0, isNaN(value) ? 0 : value),
      },
    }));
  };

  // Quick increment/decrement helper
  const adjustExpense = (field: keyof typeof budget.expenses, step: number) => {
    const current = budget.expenses[field] || 0;
    handleExpenseChange(field, Math.max(0, current + step));
  };

  const adjustIncome = (field: keyof typeof budget.incomes, step: number) => {
    const current = budget.incomes[field] || 0;
    handleIncomeChange(field, Math.max(0, current + step));
  };

  // Calculations
  const totalIncome = useMemo(() => {
    return (Object.values(budget.incomes) as number[]).reduce((sum: number, val: number) => sum + (Number(val) || 0), 0);
  }, [budget.incomes]);

  const totalExpenses = useMemo(() => {
    return (Object.values(budget.expenses) as number[]).reduce((sum: number, val: number) => sum + (Number(val) || 0), 0);
  }, [budget.expenses]);

  const balance = totalIncome - totalExpenses;

  // Konsumentverket Benchmark for current family size
  const benchmark = useMemo(() => {
    return calculateKonsumentverketBenchmark(budget.adultsCount, budget.childrenCount);
  }, [budget.adultsCount, budget.childrenCount]);

  // Saving tips applied sum
  const totalPotentialSavings = useMemo(() => {
    return SWEDISH_SAVING_TIPS.reduce((sum, tip) => {
      if (appliedTipIds[tip.id]) {
        return sum + tip.estimatedSavingSEK;
      }
      return sum;
    }, 0);
  }, [appliedTipIds]);

  const toggleTip = (id: string) => {
    setAppliedTipIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter tips
  const filteredTips = useMemo(() => {
    if (selectedTipCategory === "all") return SWEDISH_SAVING_TIPS;
    return SWEDISH_SAVING_TIPS.filter((t) => t.category === selectedTipCategory);
  }, [selectedTipCategory]);

  // Copy full budget text
  const generateBudgetText = () => {
    return `📊 **تقرير ميزانية الأسرة الشهرية في السويد (Familjens Månadsbudget)**
👨‍👩‍👧‍👦 تكوين الأسرة: ${budget.adultsCount} بالغين، ${budget.childrenCount} أطفال
-----------------------------------------
💰 **إجمالي الدخل الشهري الصافي**: ${totalIncome.toLocaleString()} SEK
  • الراتب الأول: ${budget.incomes.salary1.toLocaleString()} SEK
  • الراتب الثاني: ${budget.incomes.salary2.toLocaleString()} SEK
  • نقدية الأطفال (Barnbidrag): ${budget.incomes.barnbidrag.toLocaleString()} SEK
  • دعم السكن (Bostadsbidrag): ${budget.incomes.bostadsbidrag.toLocaleString()} SEK
  • بدلات الترسيخ / CSN: ${budget.incomes.etableringOrCSN.toLocaleString()} SEK
  • مصادر دخل أخرى: ${budget.incomes.otherIncome.toLocaleString()} SEK

💸 **إجمالي المصاريف الشهرية**: ${totalExpenses.toLocaleString()} SEK
  • إيجار السكن: ${budget.expenses.rent.toLocaleString()} SEK
  • الطعام والتموين المنزلي: ${budget.expenses.groceries.toLocaleString()} SEK
  • الروضة والفريتيدس: ${budget.expenses.childcareAndSchool.toLocaleString()} SEK
  • ملابس الأطفال ومعدات الشتاء: ${budget.expenses.childrenClothing.toLocaleString()} SEK
  • المواصلات العامة: ${budget.expenses.publicTransit.toLocaleString()} SEK
  • السيارة والوقود: ${budget.expenses.carAndFuel.toLocaleString()} SEK
  • الكهرباء والتدفئة: ${budget.expenses.electricityAndHeating.toLocaleString()} SEK
  • التأمين المنزلي: ${budget.expenses.homeInsurance.toLocaleString()} SEK
  • الهواتف والإنترنت: ${budget.expenses.phoneAndInternet.toLocaleString()} SEK
  • الصحة والأدوية: ${budget.expenses.healthAndMedication.toLocaleString()} SEK
  • النقابة والأكاسا: ${budget.expenses.unionAndAkassa.toLocaleString()} SEK
  • الأنشطة والترفيه: ${budget.expenses.leisureAndActivities.toLocaleString()} SEK
  • ادخار الطوارئ: ${budget.expenses.emergencySavings.toLocaleString()} SEK

⚖️ **الرصيد الشهري الصافي**: ${balance >= 0 ? `+${balance.toLocaleString()} SEK (فائض إيجابي)` : `${balance.toLocaleString()} SEK (عجز شهري)`}
💡 **مقارنة مع معايير مصلحة حماية المستهلك السويدية (Konsumentverket)**:
  • متوسط تكلفة الطعام المرجعية: ${benchmark.foodReference.toLocaleString()} SEK (مصروفكم الفعلي: ${budget.expenses.groceries.toLocaleString()} SEK)

تم إنشاء التقرير عبر بوابة جسر الأسرة في السويد 🇸🇪`;
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(generateBudgetText());
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // SVG Donut calculation
  const donutSlices = useMemo(() => {
    if (totalExpenses === 0) return [];
    let accumulatedAngle = 0;
    return EXPENSE_CATEGORIES_CONFIG.map((cat) => {
      const amount = budget.expenses[cat.key] || 0;
      const percentage = (amount / totalExpenses) * 100;
      const angle = (amount / totalExpenses) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      return {
        ...cat,
        amount,
        percentage,
        startAngle,
        angle,
      };
    }).filter((s) => s.amount > 0);
  }, [budget.expenses, totalExpenses]);

  return (
    <div id="budget-planner-tool" className="space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-br from-[#003C6E] via-[#005293] to-[#0A6CB8] p-6 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-bold border border-white/10">
              <Calculator className="w-4 h-4 text-amber-300" />
              <span>أداة تفاعلية • مبنية على بيانات مصلحة حماية المستهلك السويدية</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              مخطط وحاسبة ميزانية الأسرة في السويد
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
              خطط نفقات عائلتك الشهرية في السويد (الإيجار، الطعام، الروضة، فواتير الكهرباء، بدلات التأمينات)، وقارن مصاريفك بالمعايير الرسمية لـ <span className="text-amber-200 font-semibold">Konsumentverket</span> مع نصائح مجربة لتوفير آلاف الكرونات.
            </p>

            {/* Quick Audio Guide */}
            <div className="pt-2">
              <AudioPlayerButton
                text={`مرحباً بك في مخطط ميزانية الأسرة في السويد. تتيح لك هذه الأداة حساب إجمالي الدخل الصافي بما في ذلك نقدية الأطفال ودعم السكن، وتوزيع المصاريف الأساسية مثل الإيجار ورسوم الروضة والكهرباء، مع نصائح توفير عملية مبنية على المعايير السويدية.`}
                label="استمع للدليل الإرشادي للميزانية"
              />
            </div>
          </div>

          {/* Quick Balance Preview Card */}
          <div className="w-full lg:w-auto shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col sm:flex-row lg:flex-col gap-4 text-center sm:text-right lg:text-center min-w-[260px]">
            <div>
              <span className="text-xs text-blue-200 block font-medium">الصافي الشهري المتوقع</span>
              <div className={`text-2xl sm:text-3xl font-black mt-1 ${balance >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {balance >= 0 ? `+${balance.toLocaleString()} kr` : `${balance.toLocaleString()} kr`}
              </div>
              <span className="text-[11px] text-blue-100 font-medium">
                {balance >= 0 ? "✓ فائض شهري متوفر للادخار" : "⚠️ عجز شهري بحاجة لإعادة توازن"}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
              <span>الدخل: <strong className="text-white">{totalIncome.toLocaleString()} kr</strong></span>
              <span>المصاريف: <strong className="text-white">{totalExpenses.toLocaleString()} kr</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          id="tab-btn-planner"
          onClick={() => setActiveTab("planner")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "planner"
              ? "bg-[#005293] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>المخطط والحاسبة التفاعلية</span>
        </button>

        <button
          id="tab-btn-tips"
          onClick={() => setActiveTab("tips")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "tips"
              ? "bg-[#005293] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>نصائح التوفير في السويد</span>
          {totalPotentialSavings > 0 && (
            <span className="text-[11px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
              +{totalPotentialSavings.toLocaleString()} kr
            </span>
          )}
        </button>

        <button
          id="tab-btn-benchmark"
          onClick={() => setActiveTab("benchmark")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "benchmark"
              ? "bg-[#005293] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <PieChartIcon className="w-4 h-4 text-blue-500" />
          <span>مقارنة المعايير الرسمية (Konsumentverket)</span>
        </button>

        <button
          id="tab-btn-glossary"
          onClick={() => setActiveTab("glossary")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "glossary"
              ? "bg-[#005293] text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-purple-500" />
          <span>قاموس المصطلحات المالية</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE PLANNER */}
      {activeTab === "planner" && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Scenario Selector */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#003C6E] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#005293]" />
                  <span>نماذج أسر جاهزة (Scenarion)</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  اختر نموذجاً قريباً من وضع أسرتك للبدء سريعاً، أو خصص الأرقام بنفسك
                </p>
              </div>

              {/* Reset to custom */}
              <button
                onClick={() => {
                  setSelectedPresetId("custom");
                  setBudget({
                    adultsCount: 2,
                    childrenCount: 2,
                    cityType: "medium",
                    incomes: { salary1: 0, salary2: 0, barnbidrag: 2650, bostadsbidrag: 0, etableringOrCSN: 0, otherIncome: 0 },
                    expenses: { rent: 0, electricityAndHeating: 0, homeInsurance: 0, groceries: 0, childcareAndSchool: 0, childrenClothing: 0, publicTransit: 0, carAndFuel: 0, phoneAndInternet: 0, healthAndMedication: 0, unionAndAkassa: 0, leisureAndActivities: 0, emergencySavings: 0 },
                  });
                }}
                className="text-xs font-bold text-gray-600 hover:text-[#005293] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تصفير وتخصيص من الصفر</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {BUDGET_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`preset-btn-${preset.id}`}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-2xl text-right transition-all border cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#F0F7FF] border-[#005293] ring-2 ring-[#005293]/20 shadow-xs"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50/70"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{preset.icon}</span>
                        {isSelected && (
                          <span className="text-[10px] font-black bg-[#005293] text-white px-2 py-0.5 rounded-full">
                            مُختار
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-[#003C6E] leading-snug">
                        {preset.nameArabic}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed line-clamp-2">
                        {preset.descriptionArabic}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Household Size Controls */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#F8FAFC] border border-gray-200 shadow-xs">
            <h3 className="text-sm sm:text-base font-black text-[#003C6E] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#005293]" />
              <span>تكوين الأسرة ومساعدات الأطفال</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Adults Counter */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">البالغين في المنزل</span>
                  <span className="text-base font-black text-[#003C6E]">
                    {budget.adultsCount} {budget.adultsCount === 1 ? "شخص بالغ" : "بالغين"} (Vuxna)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdultsChange(-1)}
                    disabled={budget.adultsCount <= 1}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black w-6 text-center">{budget.adultsCount}</span>
                  <button
                    onClick={() => handleAdultsChange(1)}
                    disabled={budget.adultsCount >= 4}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">عدد الأطفال تحت 18 سنة</span>
                  <span className="text-base font-black text-[#003C6E]">
                    {budget.childrenCount} {budget.childrenCount === 1 ? "طفل" : "أطفال"} (Barn)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleChildrenChange(-1)}
                    disabled={budget.childrenCount <= 0}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-700 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black w-6 text-center">{budget.childrenCount}</span>
                  <button
                    onClick={() => handleChildrenChange(1)}
                    disabled={budget.childrenCount >= 8}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 font-bold text-gray-700 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Automatic Barnbidrag Box */}
              <div className="bg-[#EAF6ED] p-4 rounded-2xl border border-[#D1EAD8] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#1E7E34] font-black">نقدية الأطفال المحسوبة</span>
                    <span className="text-[10px] bg-white text-[#1E7E34] font-bold px-1.5 py-0.5 rounded-full border border-green-200">
                      Försäkringskassan
                    </span>
                  </div>
                  <span className="text-base font-black text-[#1E7E34]">
                    {calculateBarnbidrag(budget.childrenCount).toLocaleString()} kr / شهرياً
                  </span>
                </div>

                <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCalculateBarnbidrag}
                    onChange={(e) => {
                      setAutoCalculateBarnbidrag(e.target.checked);
                      if (e.target.checked) {
                        handleIncomeChange("barnbidrag", calculateBarnbidrag(budget.childrenCount));
                      }
                    }}
                    className="w-4 h-4 rounded text-[#005293] focus:ring-[#005293]"
                  />
                  <span>ربط تلقائي</span>
                </label>
              </div>
            </div>
          </div>

          {/* TWO COLUMNS: INCOMES & EXPENSES INPUTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: INCOMES (4 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#003C6E]">المداخيل الشهرية (Inkomster)</h3>
                      <span className="text-xs text-gray-500 font-medium">الرواتب الصافية بعد الضرائب والمساعدات</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">إجمالي الدخل</span>
                    <strong className="text-base font-black text-emerald-600">{totalIncome.toLocaleString()} kr</strong>
                  </div>
                </div>

                {/* Income Fields */}
                <div className="space-y-3.5">
                  {/* Salary 1 */}
                  <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>الراتب الصافي 1 (Lön efter skatt)</span>
                      <span className="text-gray-400 font-normal">كرونة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={budget.incomes.salary1 || ""}
                        onChange={(e) => handleIncomeChange("salary1", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-300 font-black text-sm text-[#003C6E] focus:outline-hidden focus:border-[#005293]"
                      />
                      <button
                        onClick={() => adjustIncome("salary1", 1000)}
                        className="px-2 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700 cursor-pointer"
                        title="+1000 kr"
                      >
                        +1k
                      </button>
                    </div>
                  </div>

                  {/* Salary 2 */}
                  <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>الراتب الصافي 2 للشريك (Lön partner)</span>
                      <span className="text-gray-400 font-normal">كرونة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={budget.incomes.salary2 || ""}
                        onChange={(e) => handleIncomeChange("salary2", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-300 font-black text-sm text-[#003C6E] focus:outline-hidden focus:border-[#005293]"
                      />
                      <button
                        onClick={() => adjustIncome("salary2", 1000)}
                        className="px-2 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700 cursor-pointer"
                        title="+1000 kr"
                      >
                        +1k
                      </button>
                    </div>
                  </div>

                  {/* Barnbidrag */}
                  <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1E7E34]">
                      <span>نقدية الأطفال (Barnbidrag + Flerbarnstillägg)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded-sm">معفى من الضريبة</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={budget.incomes.barnbidrag || ""}
                      onChange={(e) => handleIncomeChange("barnbidrag", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      disabled={autoCalculateBarnbidrag}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-300 font-black text-sm text-[#1E7E34] disabled:bg-gray-100 disabled:text-gray-600 focus:outline-hidden focus:border-[#1E7E34]"
                    />
                  </div>

                  {/* Bostadsbidrag */}
                  <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>دعم السكن للأسرة (Bostadsbidrag)</span>
                      <span className="text-gray-400 font-normal">كرونة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="200"
                        value={budget.incomes.bostadsbidrag || ""}
                        onChange={(e) => handleIncomeChange("bostadsbidrag", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-300 font-black text-sm text-[#003C6E] focus:outline-hidden focus:border-[#005293]"
                      />
                      <button
                        onClick={() => adjustIncome("bostadsbidrag", 500)}
                        className="px-2 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700 cursor-pointer"
                        title="+500 kr"
                      >
                        +500
                      </button>
                    </div>
                  </div>

                  {/* Etablering or CSN */}
                  <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>بدل الترسيخ / سلفة الدراسة (Etablering / CSN)</span>
                      <span className="text-gray-400 font-normal">كرونة</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={budget.incomes.etableringOrCSN || ""}
                      onChange={(e) => handleIncomeChange("etableringOrCSN", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-300 font-black text-sm text-[#003C6E] focus:outline-hidden focus:border-[#005293]"
                    />
                  </div>

                  {/* Other Incomes */}
                  <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>مساعدات أخرى (Underhållsstöd / أخرى)</span>
                      <span className="text-gray-400 font-normal">كرونة</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="200"
                      value={budget.incomes.otherIncome || ""}
                      onChange={(e) => handleIncomeChange("otherIncome", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-300 font-black text-sm text-[#003C6E] focus:outline-hidden focus:border-[#005293]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick AI Tip Callout */}
              <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#005293] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#003C6E]">هل يحق لك التقديم على دعم السكن؟</h4>
                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                    إذا كان لديكم أطفال وكان الإيجار مرتفعاً مقارنة بالدخل، يمكنكم التقديم لدى التأمينات العامة (Försäkringskassan).
                  </p>
                  {onAskAI && (
                    <button
                      onClick={() => onAskAI("كيف أقدم على دعم السكن Bostadsbidrag من Försäkringskassan وما هي الشروط؟", "daily-life")}
                      className="text-xs font-bold text-[#005293] hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>اسأل المساعد الذكي عن الشروط</span>
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: EXPENSES (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#003C6E]">المصاريف الشهرية (Utgifter)</h3>
                      <span className="text-xs text-gray-500 font-medium">تكاليف المعيشة والإيجار والفواتير</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">إجمالي المصاريف</span>
                    <strong className="text-base font-black text-rose-600">{totalExpenses.toLocaleString()} kr</strong>
                  </div>
                </div>

                {/* Expense Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {EXPENSE_CATEGORIES_CONFIG.map((cat) => {
                    const val = budget.expenses[cat.key] || 0;
                    const IconComponent = cat.icon;
                    return (
                      <div
                        key={cat.key}
                        className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:border-gray-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
                              style={{ backgroundColor: cat.color }}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-black text-gray-800 leading-tight">
                              {cat.labelArabic}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">kr</span>
                        </div>

                        <div className="text-[11px] text-gray-500 font-medium truncate">
                          {cat.labelSwedish}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={val || ""}
                            onChange={(e) => handleExpenseChange(cat.key, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-300 font-black text-sm text-[#003C6E] focus:outline-hidden focus:border-[#005293]"
                          />
                          <button
                            onClick={() => adjustExpense(cat.key, 200)}
                            className="px-2 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700 cursor-pointer shrink-0"
                            title="+200 kr"
                          >
                            +200
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL ANALYTICS & BREAKDOWN DASHBOARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#003C6E] flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#005293]" />
                  <span>التحليل البصري وتوزيع المصاريف (Kassaflödesanalys)</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  رؤية واضحة لحجم النفقات وأين تذهب أموال الأسرة كل شهر
                </p>
              </div>

              {/* Action Buttons: Copy / Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                    copiedReport
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                  }`}
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>تم نسخ التقرير!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-600" />
                      <span>نسخ تقرير الميزانية</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all cursor-pointer flex items-center gap-1.5"
                  title="طباعة تقرير الميزانية"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>
              </div>
            </div>

            {/* Financial Health Status Box */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                balance > 1500
                  ? "bg-[#EAF6ED] border-[#D1EAD8] text-[#1E7E34]"
                  : balance >= 0
                  ? "bg-blue-50 border-blue-200 text-[#005293]"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-2xs">
                  {balance > 1500 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  ) : balance >= 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#005293]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black">
                    {balance > 1500
                      ? "وضع مالي ممتاز: يتوفر لديك فائض شهري للادخار والاستثمار"
                      : balance >= 0
                      ? "الميزانية متوازنة: الدخل يغطي المصاريف بدقة"
                      : "تنبيه: المصاريف تفوق الدخل الشهري بمقدار " + Math.abs(balance).toLocaleString() + " كرونة"}
                  </h4>
                  <p className="text-xs opacity-90 font-medium mt-0.5">
                    {balance >= 0
                      ? "نوصي بتخصيص الفائض شهرياً في صندوق طوارئ (Buffertsparande) بحساب بنكي بفائدة مضمونة."
                      : "تحقق من نصائح التوفير في التبويب المجاور للتقليل من فواتير الكهرباء، السوبرماركت، ودعم السكن."}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-bold block opacity-80">الرصيد المتبقي</span>
                <span className="text-xl sm:text-2xl font-black">
                  {balance >= 0 ? `+${balance.toLocaleString()} kr` : `${balance.toLocaleString()} kr`}
                </span>
              </div>
            </div>

            {/* Visual Distribution Bars */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                <span>توزيع بنود المصاريف من إجمالي الدخل:</span>
                <span>{totalExpenses > 0 ? ((totalExpenses / (totalIncome || 1)) * 100).toFixed(0) : 0}% من الدخل</span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden flex shadow-inner">
                {donutSlices.map((slice) => (
                  <div
                    key={slice.key}
                    style={{
                      width: `${slice.percentage}%`,
                      backgroundColor: slice.color,
                    }}
                    title={`${slice.labelArabic}: ${slice.amount.toLocaleString()} kr (${slice.percentage.toFixed(1)}%)`}
                    className="h-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {donutSlices.map((slice) => (
                  <div
                    key={slice.key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span>{slice.labelArabic}</span>
                    <span className="text-gray-500 font-mono text-[11px]">
                      {slice.amount.toLocaleString()} kr ({slice.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SWEDISH SAVING TIPS */}
      {activeTab === "tips" && (
        <div className="space-y-6 animate-fade-in">
          {/* Tips Summary Counter */}
          <div className="p-6 rounded-3xl bg-linear-to-r from-[#003C6E] to-[#005293] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حاسبة الوفورات المحتملة</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                نصائح ذكية لتوفير مصاريف الأسرة في السويد
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium max-w-xl">
                حدد النصائح التي تناسب أسرتك لحساب إجمالي المبالغ التي يمكنك توفيرها كل شهر
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center sm:text-right min-w-[200px]">
              <span className="text-xs text-blue-200 block font-medium">مجموع الوفورات المحددة</span>
              <strong className="text-2xl sm:text-3xl font-black text-amber-300 block mt-0.5">
                +{totalPotentialSavings.toLocaleString()} kr / شهر
              </strong>
              <span className="text-[11px] text-blue-100 font-medium">
                ما يعادل {(totalPotentialSavings * 12).toLocaleString()} kr سنوياً!
              </span>
            </div>
          </div>

          {/* Tips List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTips.map((tip) => {
              const isApplied = !!appliedTipIds[tip.id];
              return (
                <div
                  key={tip.id}
                  id={`tip-card-${tip.id}`}
                  onClick={() => toggleTip(tip.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isApplied
                      ? "bg-[#EAF6ED] border-[#1E7E34] shadow-xs"
                      : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-2xs"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isApplied}
                          onChange={() => {}} // Handled by card click
                          className="w-5 h-5 rounded-md text-[#1E7E34] focus:ring-[#1E7E34] cursor-pointer"
                        />
                        <h4 className="text-sm sm:text-base font-black text-[#003C6E] leading-snug">
                          {tip.titleArabic}
                        </h4>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 shrink-0 font-mono">
                        توفير ~{tip.estimatedSavingSEK.toLocaleString()} kr
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500 font-mono font-medium">
                      🇸🇪 {tip.titleSwedish}
                    </div>

                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {tip.descriptionArabic}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100/80 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium">
                      المصدر: <strong className="text-gray-700">{tip.sourceName}</strong>
                    </span>
                    {tip.swedishTerm && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#005293] font-bold">
                        {tip.swedishTerm}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: KONSUMENTVERKET BENCHMARK COMPARISON */}
      {activeTab === "benchmark" && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#003C6E] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#005293]" />
                  <span>المعايير المرجعية لمصلحة حماية المستهلك (Konsumentverket)</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  تصدر مصلحة المستهلك السويدية تقريراً سنوياً بالحد الأدنى المعقول لنفقات الأسر حسب عدد الأفراد
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#005293]">
                الأسرة الحالية: {budget.adultsCount} بالغين + {budget.childrenCount} أطفال
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Food Comparison */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-black text-[#003C6E]">الطعام والمشتريات (Matkostnad)</h4>
                  </div>
                  <span className="text-xs font-bold text-gray-500">شهرياً</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">المعيار الوطني المحسوب لأسرتكم:</span>
                    <strong className="text-gray-900 font-black">{benchmark.foodReference.toLocaleString()} kr</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">مصروفكم الفعلي المدخل:</span>
                    <strong className="text-[#005293] font-black">{budget.expenses.groceries.toLocaleString()} kr</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600">
                  {budget.expenses.groceries <= benchmark.foodReference ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      مصروفكم منخفض أو ضمن المعيار الوطني السويدي المعقول.
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      مصروف الطعام أعلى من المعدل بنحو {(budget.expenses.groceries - benchmark.foodReference).toLocaleString()} kr. راجع نصائح التسوق.
                    </span>
                  )}
                </div>
              </div>

              {/* Children Clothing & Equipment Comparison */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h4 className="text-sm font-black text-[#003C6E]">الملابس والأحذية (Kläder & Skor)</h4>
                  </div>
                  <span className="text-xs font-bold text-gray-500">شهرياً</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">المعيار المرجعي للملابس:</span>
                    <strong className="text-gray-900 font-black">{benchmark.clothingReference.toLocaleString()} kr</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">مصروف ملابس الأطفال المدخل:</span>
                    <strong className="text-[#005293] font-black">{budget.expenses.childrenClothing.toLocaleString()} kr</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600">
                  💡 يوصي خبراء حماية المستهلك بتوفير ميزانية شهرية ثابتة لملابس الشتاء والأوفرولات لتجنب عبء المصاريف المفاجئة في شهر أكتوبر ونوفمبر.
                </div>
              </div>
            </div>

            {/* Official Source Callout */}
            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-[#005293] shrink-0" />
                <p className="text-xs text-gray-600 font-medium">
                  المعايير المرجعية مبنية على حسابات مصلحة حماية المستهلك السويدية الرسمية (Konsumentverkets beräknade hushållskostnader).
                </p>
              </div>
              <a
                href="https://www.konsumentverket.se"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#005293] hover:underline shrink-0 flex items-center gap-1"
              >
                <span>Konsumentverket.se</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GLOSSARY OF SWEDISH FINANCIAL TERMS */}
      {activeTab === "glossary" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUDGET_GLOSSARY.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#005293] font-mono">
                    {item.term}
                  </span>
                </div>
                <h4 className="text-sm font-black text-[#003C6E]">
                  {item.arabic}
                </h4>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
