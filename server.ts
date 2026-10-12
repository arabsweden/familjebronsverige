import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini features will return fallback guidance.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "جسر الأسرة في السويد" });
});

// AI Question answering endpoint with robust model fallback and retry logic
app.post("/api/ask", async (req, res) => {

  try {
    const { question, category } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "السؤال مطلوب (Question is required)" });
    }

    const ai = getGenAI();

    // If no API key is provided, return rich structured guidance directly
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        answer: generateContextualFallbackAnswer(question, category),
      });
    }

    const systemInstruction = `أنت المساعد الذكي في منصة "جسر الأسرة في السويد" (Familjens Bro i Sverige).
مهمتك: تقديم إجابات هادئة، دقيقة، موثوقة، ومبسطة باللغة العربية الواضحة للعائلات الناطقة بالعربية في السويد (خاصة القادمين الجدد وأولياء الأمور).

استند دائماً إلى القوانين والجهات الرسمية السويدية الموثوقة:
- Skollagen (قانون المدارس) و Skolverket (مصلحة المدارس)
- Socialtjänstlagen (قانون الخدمات الاجتماعية SoL) و Socialstyrelsen (هيئة الشؤون الاجتماعية)
- Barnkonventionen (اتفاقية حقوق الطفل كقانون سويدي)
- Föräldrabalken (قانون الوالدين والنزاعات الأسرية والحضانة)
- Försäkringskassan (صندوق التأمينات الاجتماعية)
- 1177 Vårdguiden (الرعاية الصحية)

قواعد صارمة:
1. استخدم لغة عربية فصيحة وسلسة ومطمئنة، وتجنب التعقيد أو التهويل أو التخويف.
2. وضح دائماً المصطلحات السويدية الرسمية بجانب الكلمات العربية (مثل: Orosanmälan, Skolplikt, Elevhälsa, Samarbetssamtal, Föräldrapenning, Tolk).
3. قدم خطوات عملية واقعية (ماذا يفعل الأب/الأم تحديداً، بمن يتصل، وما هي حقوقه كطلب مترجم مجاني Tolk).
4. أجب دائماً بصيغة JSON مطابقة للهيكل المطلوب بدقة.

هيكل الاستجابة بصيغة JSON:
{
  "summary": "شرح مباشر وملخص هادئ في 2-3 فقرات واضحة",
  "steps": [
    "الخطوة الأولى العملية",
    "الخطوة الثانية...",
    "الخطوة الثالثة..."
  ],
  "swedishTerms": [
    { "term": "المصطلح بالسويدية", "arabic": "المعنى بالعربية", "note": "ملاحظة أو سياق الاستخدام" }
  ],
  "authorities": [
    { "name": "اسم الجهة الرسمية بالسويدية والعربية", "role": "دورها ومجال مساعدتها", "contact": "كيفية التواصل أو الرقم" }
  ],
  "disclaimer": "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
}`;

    const prompt = `التصنيف: ${category || "عام"}
سؤال المستخدم المجهول:
"${question}"

قدم إجابة متكاملة ومنظمة ومطمئنة وموثوقة بصيغة JSON وفق القوانين والأنظمة السويدية مع توضيح المصطلحات بالسويدية والخطوات العملية.`;

    // Prioritize high-availability, fast flash models first to prevent 503 unavailable spikes
    const candidateModels = [
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.1-pro-preview",
    ];

    let responseText = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });

        if (response && response.text) {
          responseText = response.text;
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        const errCode = err?.status || err?.code || err?.message;
        console.warn(`[Ask Service] Notice: Model ${modelName} encountered (${errCode}), trying alternate model...`);
        // Brief delay before attempting next candidate model
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    // If Gemini succeeded, parse JSON
    if (responseText) {
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        parsedData = {
          summary: responseText,
          steps: [
            "طلب حضور مترجم مجاني (Tolk) عند التواصل مع أي جهة رسمية في السويد",
            "التواصل مع قسم الاستقبال في بلديتك (Medborgarkontor) للحصول على توجيه مباشر",
            "مراجعة الأقسام التفاعلية في هذا التطبيق للتعرف على القوانين ذات الصلة"
          ],
          swedishTerms: [
            { term: "Tolk", arabic: "مترجم فوري مجاني", note: "حقك القانوني في أي مقابلة رسمية" },
            { term: "Barnets bästa", arabic: "مصلحة الطفل الفضلى", note: "المبدأ الأساسي في القوانين السويدية" }
          ],
          authorities: [
            { name: "بلدية منطقتك (Kommun)", role: "الجهة التنفيذية المسؤولة عن المدارس والخدمات الاجتماعية", contact: "عبر موقع بلديتك الرسمي" },
            { name: "الدليل الصحي الوطني 1177", role: "الاستشارات الصحية والتمريضية", contact: "هاتف: 1177" }
          ],
          disclaimer: "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
        };
      }

      if (!parsedData.disclaimer) {
        parsedData.disclaimer = "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112.";
      }

      return res.json({ answer: parsedData });
    }

    // If all models encountered high demand / temporary unavailability, return high-quality context-aware fallback
    console.warn("All Gemini models unavailable, returning structured fallback response. Last error:", lastError?.message);
    const fallbackAnswer = generateContextualFallbackAnswer(question, category);
    return res.json({ answer: fallbackAnswer });

  } catch (error: any) {
    console.error("Critical error in /api/ask:", error);
    // Never return a broken 500 to the end user; provide an authoritative guidance response
    const safeFallback = generateContextualFallbackAnswer(req.body?.question || "", req.body?.category || "");
    return res.status(200).json({ answer: safeFallback });
  }
});

// Helper function to generate rich, contextual answers when models are busy or in high demand
function generateContextualFallbackAnswer(question: string, category?: string) {
  const qLower = (question || "").toLowerCase();
  const cat = (category || "").toLowerCase();

  const isSchool = cat.includes("school") || cat.includes("مدرسة") || qLower.includes("مدرسة") || qLower.includes("skola") || qLower.includes("غياب") || qLower.includes("fravette") || qLower.includes("معلم") || qLower.includes("سباحة");
  const isSocial = cat.includes("social") || cat.includes("سوسيال") || qLower.includes("سوسيال") || qLower.includes("social") || qLower.includes("orosanmälan") || qLower.includes("بلاغ") || qLower.includes("تحقيق") || qLower.includes("سحب");
  const isFamily = cat.includes("family") || cat.includes("dispute") || cat.includes("نزاع") || cat.includes("طلاق") || qLower.includes("طلاق") || qLower.includes("حضانة") || qLower.includes("نفقة") || qLower.includes("انفصال") || qLower.includes("skilsmässa");
  const isChildRights = cat.includes("child") || cat.includes("حقوق") || qLower.includes("ضرب") || qLower.includes("عقاب") || qLower.includes("تأديب") || qLower.includes("حقوق الطفل") || qLower.includes("barn");

  if (isSocial) {
    return {
      summary: `بخصوص استفسارك حول الخدمات الاجتماعية (Socialtjänsten): الهدف الأساسي للسوسيال في السويد بموجب قانون الخدمات الاجتماعية (Socialtjänstlagen) هو دعم الأسرة ومساعدتها على تجاوز الصعوبات بشكل طوعي وتشاركي.\n\nتلقي بلاغ قلق (Orosanmälan) أو رسالة من السوسيال لا يعني أبداً سحب الطفل؛ بل يعني أن الجهة ملزمة بالتحقق من وضع الطفل وتقديم برامج دعم وتأهيل وإرشاد للوالدين (Familjestöd).`,
      steps: [
        "احضر الموعد المحدد بكل هدوء وثقة، واطلب مسبقاً حقك القانوني في مترجم مجاني (Tolk) يتحدث لغتك الأم.",
        "تحدث بصدق ووضوح عن احتياجات أسرتك، واطلب خدمات الدعم الطوعية المتاحة مثل جلسات الاستشارة التربوية أو المرشد الأسري.",
        "إذا تلقيت أي خطاب لم تفهمه، يمكنك مراجعة مكتب رعاية المواطنين (Medborgarkontor) في بلديتك لترجمته وشرحه.",
        "تجنب الاعتماد على الشائعات المتداولة على وسائل التواصل؛ كافة الإجراءات تخضع لرقابة هيئة التفتيش السويدية (IVO) والمحاكم الإدارية."
      ],
      swedishTerms: [
        { term: "Orosanmälan", arabic: "بلاغ قلق أو اهتمام", note: "إشعار ترسله المدرسة أو الصحة عند ملاحظة قلق على الطفل" },
        { term: "Utredning", arabic: "دراسة حالة أو تقييم وضع", note: "جلسات استماع للوالدين والطفل لبحث سبل تقديم الدعم" },
        { term: "Familjestöd", arabic: "دعم ومساندة الأسرة", note: "برامج إرشادية وتدريبية ومادية طوعية لمساعدة الوالدين" },
        { term: "Tolk", arabic: "مترجم رسمي مجاني", note: "حق مكفول قانونياً في كافة المقابلات الرسمية" }
      ],
      authorities: [
        { name: "Socialtjänsten (السوسيال في بلديتك)", role: "تقديم الدعم الأسري والاستشارات والحلول الودية", contact: "عبر موقع بلديتك الرسمي (Kommun.se)" },
        { name: "IVO (مفتشية الصحة والرعاية)", role: "الرقابة على نزاهة وقانونية عمل السوسيال", contact: "ivo.se / هاتف: 010-788 50 00" },
        { name: "Barnombudsmannen (مفوض حقوق الطفل)", role: "حماية حقوق الأطفال في السويد", contact: "barnombudsmannen.se" }
      ],
      disclaimer: "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
    };
  }

  if (isSchool) {
    return {
      summary: `بخصوص موضوع المدرسة والتعليم: ينص قانون المدارس السويدي (Skollagen) على إلزامية التعليم (Skolplikt) للأطفال من عمر 6 إلى 16 سنة، وحق كل تلميذ في بيئة تعليمية آمنة وخالية من التنمر ودعم لغوي ونفسي متكامل.\n\nالمدرسة شريك أساسي للأهل، وجميع الأنشطة (بما فيها حصص الرياضة والسباحة والرحلات المدرسية) جزء من المنهاج التعليمي المعتمد من مصلحة المدارس (Skolverket).`,
      steps: [
        "تواصل مع معلم الصف أو المرشد التربوي (Mentor) لطلب اجتماع متابعة وتوضيح أي ظروف يمر بها طفلك.",
        "اطلب تفعيل فريق صحة الطالب (Elevhälsa) الذي يضم الممرضة المدرسية والأخصائي النفسي والاجتماعي لدعم الطفل في المدرسة.",
        "إذا كان طفلك جديداً في السويد، اطلب تدريس اللغة السويدية كلغة ثانية (SVA) والحق في دراسة اللغة الأم (Modersmål).",
        "احرص دائماً على طلب مترجم معتمد (Tolk) خلال اجتماعات أولياء الأمور (Utvecklingssamtal)."
      ],
      swedishTerms: [
        { term: "Skolplikt", arabic: "إلزامية التعليم", note: "واجب قانوني لحضور المدرسة من الصف التمهيدي حتى التاسع" },
        { term: "Utvecklingssamtal", arabic: "محادثة التطوير والتقدم", note: "اجتماع فصلي بين الأهل والمعلم والطالب" },
        { term: "Elevhälsa", arabic: "فريق صحة الطالب", note: "كادر طبي ونفسي واجتماعي متواجد داخل كل مدرسة" },
        { term: "Modersmålsundervisning", arabic: "تعليم اللغة الأم", note: "حق الطفل في دراسة لغته الأم أسبوعياً في المدرسة" }
      ],
      authorities: [
        { name: "إدارة مدرسة طفلك (Rektor & Skola)", role: "المسؤول الأول عن البيئة المدرسية والدعم الفردي", contact: "مباشرة في مدرستك" },
        { name: "Skolverket (مصلحة المدارس السويدية)", role: "الجهة الوطنية المسؤولة عن المناهج وقوانين التعليم", contact: "skolverket.se / هاتف: 08-527 332 00" },
        { name: "Skolinspektionen (مفتشية المدارس)", role: "التحقيق في شكاوى التنمر أو التقصير التعليمي", contact: "skolinspektionen.se" }
      ],
      disclaimer: "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
    };
  }

  if (isFamily) {
    return {
      summary: `بخصوص الخلافات الأسرية والحضانة والانفصال: ينظم قانون الوالدين السويدي (Föräldrabalken) حقوق الأطفال والحضانة والنفقة، ويشدد على أولوية مصلحة الطفل وبقاء علاقته الإيجابية مع كلا الوالدين.\n\nتوفر البلديات السويدية خدمة الإرشاد الأسري (Familjerådgivning) ومحادثات التعاون (Samarbetssamtal) بسرية مطلقة وبأسعار رمزية لمساعدة الأزواج على التفاهم أو إدارة الانفصال بسلام.`,
      steps: [
        "احجز موعداً في خدمة الإرشاد الأسري (Familjerådgivning) في بلديتك للاستشارة السرية دون فتح أي ملفات رسمية.",
        "في حال الانفصال، اطلب جلسات محادثات التعاون (Samarbetssamtal) في وحدة قانون الأسرة (Familjerätten) للاتفاق على الحضانة والسكن والنفقة ودياً.",
        "استعن بصندوق التأمينات الاجتماعية (Försäkringskassan) لتنظيم دعم النفقة (Underhållsstöd) بطريقة قانونية ومحايدة.",
        "تذكر دائماً أن الخلافات بين الوالدين لا ينبغي أن تؤثر على شعور الأطفال بالأمان والاستقرار."
      ],
      swedishTerms: [
        { term: "Familjerådgivning", arabic: "الإرشاد والاستشارة الأسرية", note: "خدمة بلدية سرية تماماً للمساعدة في حل النزاعات" },
        { term: "Gemensam vårdnad", arabic: "الحضانة المشتركة", note: "الأصل القانوني في السويد ما لم يصدر حكم قضائي مخالف" },
        { term: "Samarbetssamtal", arabic: "محادثات التعاون الودي", note: "جلسات وساطة في البلدية للاتفاق على رعاية الأطفال" },
        { term: "Underhållsstöd", arabic: "دعم ونفقة الأطفال", note: "مبلغ يُصرف عبر صندوق التأمينات Försäkringskassan" }
      ],
      authorities: [
        { name: "Familjerätten (وحدة قانون الأسرة في بلديتك)", role: "تنظيم محادثات التعاون واتفاقيات الحضانة والرؤية", contact: "عبر بلدية منطقتك (Kommun)" },
        { name: "Försäkringskassan (صندوق التأمينات)", role: "إدارة إعانات الأطفال ودعم النفقة", contact: "forsakringskassan.se / هاتف: 0771-524 524" }
      ],
      disclaimer: "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
    };
  }

  if (isChildRights) {
    return {
      summary: `بخصوص حقوق الطفل والتربية في السويد: أصبحت اتفاقية حقوق الطفل (Barnkonventionen) قانوناً سويدياً نافذاً منذ عام 2020. ينص القانون السويدي الصارم (منذ عام 1979) على الحظر التام والشامل لأي عقاب بدني (الضرب، الصفع، الهز) أو نفسي (الإهانة، التهديد، الحبس).\n\nالقانون يهدف لبناء علاقة قائمة على الحوار والتربية الإيجابية، وتتيح الدولة العديد من الدورات المجانية للوالدين (مثل دورات ABC و Alla Barn i Centrum) لدعم أساليب التربية الحديثة.`,
      steps: [
        "اعتمد على أساليب الحوار ووضع الحدود الإيجابية الهادئة دون اللجوء للصراخ أو العنف البدني أو النفسي.",
        "سجل في دورات الوالدية المجانية التي تنظمها بلديتك (مثل دورات Föräldraskapsprogram ABC) لتعلم أدوات التعامل مع غضب الأطفال وسلوكهم.",
        "استشر ممرضة مركز رعاية الأطفال (BVC) أو صحة الطالب في المدرسة عند مواجهة تحديات سلوكية.",
        "استمع لطفلك واشركه في اتخاذ القرارات المناسبة لعمره لتعزيز ثقته وأمانه النفسي."
      ],
      swedishTerms: [
        { term: "Barnkonventionen", arabic: "اتفاقية حقوق الطفل", note: "قانون سويدي نافذ يحمي سلامة ورأي ورفاه الطفل" },
        { term: "Föräldraskapsprogram", arabic: "برامج دعم الوالدية", note: "دورات مجانية تقدمها البلديات لتعزيز مهارات التربية" },
        { term: "BVC (Barnavårdscentral)", arabic: "مركز رعاية الطفولة", note: "متابعة صحة ونمو الطفل واللقاحات من الولادة حتى 6 سنوات" }
      ],
      authorities: [
        { name: "Barnombudsmannen (مفوض حقوق الطفل)", role: "المتابعة والمراقبة الرسمية لحقوق الطفل في السويد", contact: "barnombudsmannen.se" },
        { name: "BRIS (منظمة حقوق الطفل في المجتمع)", role: "خط مساعدة ودعم نفسي للأطفال والوالدين", contact: "bris.se / هاتف الوالدين: 077-150 50 50" }
      ],
      disclaimer: "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
    };
  }

  // General default fallback
  return {
    summary: `أهلاً بك في جسر الأسرة في السويد. بخصوص استفسارك حول "${question}":\n\nتعتمد المؤسسات والأنظمة في السويد على الشفافية والتعاون المباشر مع أولياء الأمور، مع إعطاء الأولوية لمصلحة الطفل الفضلى (Barnets bästa). يحق لك في كافة مراجعاتك الرسمية فهم كافة الإجراءات وطلب الترجمة المجانية.`,
    steps: [
      "تواصل مع الجهة الرسمية المعنية مباشرة واطلب دائماً توفير مترجم فوري مجاني (Tolk) باللغة العربية.",
      "اطلع على المصطلحات السويدية الرسمية المرتبطة بموضوعك لضمان الفهم الدقيق لكل المراسلات.",
      "توجه إلى مركز استقبال المواطنين في بلديتك (Medborgarkontor) للحصول على إرشاد مجاني ومباشر.",
      "في حالات الرعاية الصحية العامة والتمريض، اتصل برقم 1177 واطلب التحدث مع مترجم عربي."
    ],
    swedishTerms: [
      { term: "Tolk", arabic: "مترجم رسمي مجاني", note: "حق قانوني مضمون في كافة المقابلات والمراجعات" },
      { term: "Medborgarkontor", arabic: "مكتب رعاية المواطنين", note: "مركز خدمة في البلدية يقدم المساعدة في المعاملات" },
      { term: "1177 Vårdguiden", arabic: "الدليل الصحي السويدي", note: "استشارات طبية على مدار 24 ساعة" }
    ],
    authorities: [
      { name: "بلدية منطقتك (Kommun)", role: "المسؤولة عن المدارس والخدمات الاجتماعية ورعاية الأسرة", contact: "عبر موقع بلدية مدينتك" },
      { name: "الدليل الصحي الوطني 1177", role: "الاستشارات الطبية والتمريضية وتوجيه المرضى", contact: "هاتف: 1177 (متاح 24/7)" },
      { name: "طوارئ السويد 112", role: "لحالات الخطر المباشر وتهديد الحياة فقط", contact: "هاتف: 112" }
    ],
    disclaimer: "هذه المعلومات هي إرشاد عام وليست استشارة قانونية. في حال وجود خطر عاجل، اتصل فوراً بالرقم 112."
  };
}

// Podcast Dialogue Generator Endpoint
app.post("/api/podcast/generate", async (req, res) => {
  try {
    const { title, guestName = "أحمد", story, duration = "3min", tone = "مطمئنة" } = req.body;

    if (!story || typeof story !== "string") {
      return res.status(400).json({ error: "يرجى كتابة فكرة أو قصة الحلقة (Story is required)" });
    }

    const cleanGuest = (guestName && typeof guestName === "string" && guestName.trim()) ? guestName.trim() : "أحمد";
    const cleanTitle = (title && typeof title === "string" && title.trim()) ? title.trim() : `حوار حول: ${story.slice(0, 40)}...`;

    const ai = getGenAI();

    if (!process.env.GEMINI_API_KEY) {
      const fallbackPodcast = generateContextualPodcastFallback(cleanTitle, cleanGuest, story, duration, tone);
      return res.json({ podcast: fallbackPodcast });
    }

    const durationInstruction =
      duration === "1min"
        ? "حوار سريع ومركز ومدته دقيقة واحدة (حوالي 4-6 تبادلات سريعة بين هبه والضيف)."
        : duration === "5min"
        ? "حوار متعمق وشامل ومفصل ومدته 5 دقائق (حوالي 12-16 تبادلاً غنياً بالأمثلة والخطوات العملية)."
        : "حوار متوازن وشامل ومدته 3 دقائق (حوالي 8-10 تبادلات تغطي المشكلة، الإيضاح القانوني، والحل العملي).";

    const toneInstruction =
      tone === "عملية"
        ? "النبرة عملية وتطبيقية تركز على الخطوات الملموسة والجهات الرسمية والحقوق المباشرة."
        : tone === "توعوية"
        ? "النبرة توعوية تثقيفية تشرح فلسفة القوانين السويدية والأنظمة والوقاية."
        : "النبرة مطمئنة ودافئة تخفف القلق وتبدد المخاوف وتبني الثقة مع شرح هادئ.";

    const systemInstruction = `أنت الكاتب والمعد لحلقات "بودكاست جسر الأسرة في السويد" (Familjens Bro i Sverige).
شخصية المستشارة "هبه":
- مستشارة أسرية واجتماعية هادئة، دافئة، متعاطفة للغاية، لا تصدر أي أحكام على الضيف أو أسرته.
- تشرح القوانين والأنظمة السويدية (Skollagen, Socialtjänstlagen, Föräldrabalken, Barnkonventionen) بصورة مبسطة وسهلة الفهم للناطقين بالعربية.
- تذكر دائماً حقوق الأسرة مثل حق طلب مترجم رسمي مجاني (Tolk)، والتواصل الإيجابي مع المدرسة والسوسيال.

شخصية الضيف "${cleanGuest}":
- أب أو أم أو مقيم في السويد يشارك تجربته أو تساؤله بواقعية وصدق.

قواعد صارمة:
1. يجب أن يبدأ الحوار دائماً وأبداً بجملة هبه الافتتاحية:
   "هبه: أهلاً بكم في بودكاست جسر الأسرة في السويد..."
2. كتابة الحوار بتبادل واضح بين «هبه» و «${cleanGuest}».
3. ${durationInstruction}
4. ${toneInstruction}
5. اختم الحلقة بخلاصة عملية قصيرة ودعوة للحوار الإيجابي أو طلب المساعدة من الجهة السويدية المختصة عند الحاجة.
6. قم بإعداد "نسخة الريلز" (Reels Short Version) مدتها من 30 إلى 45 ثانية تبدأ بجملة قوية تجذب الانتباه (Hook) وتنتهي حتماً بعبارة:
   «جسر الأسرة في السويد — نفهم معًا، ونبني الثقة.»
7. إرجاع النتيجة حصراً بصيغة JSON وفق الهيكل التالي.

هيكل JSON المطلوب:
{
  "title": "${cleanTitle}",
  "guestName": "${cleanGuest}",
  "duration": "${duration}",
  "tone": "${tone}",
  "turns": [
    { "speaker": "هبه", "role": "host", "text": "أهلاً بكم في بودكاست جسر الأسرة في السويد..." },
    { "speaker": "${cleanGuest}", "role": "guest", "text": "..." }
  ],
  "fullText": "النص الكامل للحوار منسقاً بالأسطر",
  "summary": "خلاصة عملية قصيرة للحلقة في جملتين أو ثلاث",
  "actionCall": "الدعوة العملية للعمل أو التواصل مع الجهة المختصة",
  "reelsVersion": {
    "hook": "الجملة الجاذبة للانتباه في البداية",
    "turns": [
      { "speaker": "${cleanGuest}", "role": "guest", "text": "..." },
      { "speaker": "هبه", "role": "host", "text": "..." }
    ],
    "closing": "جسر الأسرة في السويد — نفهم معًا، ونبني الثقة.",
    "fullText": "نص الريلز المختصر كاملاً من البداية حتى العبارة الختامية"
  },
  "disclaimer": "هذا المحتوى توعوي عام ولا يغني عن الاستشارة المتخصصة في الحالات الفردية أو الطارئة."
}`;

    const prompt = `عنوان الحلقة المقترح: ${cleanTitle}
اسم الضيف: ${cleanGuest}
القصة أو الفكرة المطروحة:
"${story}"
المدة المطلوبة: ${duration}
النبرة المطلوبة: ${tone}

أنشئ نص الحوار الكامل المنظم والمؤثر مع نسخة الريلز بصيغة JSON.`;

    const candidateModels = [
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-3.7-flash",
      "gemini-3.1-pro-preview",
    ];

    let responseText = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });

        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errCode = err?.status || err?.code || err?.message;
        console.warn(`[Podcast Service] Notice: Model ${modelName} encountered (${errCode}), trying alternate model...`);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    if (responseText) {
      try {
        const parsed = JSON.parse(responseText);
        // Ensure starting sentence compliance
        if (parsed.turns && parsed.turns[0]) {
          if (!parsed.turns[0].text.startsWith("أهلاً بكم في بودكاست جسر الأسرة")) {
            parsed.turns[0].text = `أهلاً بكم في بودكاست جسر الأسرة في السويد. حوار يقرّب الفهم ويدعم الأسرة. يسعدني أن أرحب اليوم بضيفنا ${cleanGuest}. ${parsed.turns[0].text}`;
          }
        }
        if (!parsed.disclaimer) {
          parsed.disclaimer = "هذا المحتوى توعوي عام ولا يغني عن الاستشارة المتخصصة في الحالات الفردية أو الطارئة.";
        }
        return res.json({ podcast: parsed });
      } catch (parseErr) {
        console.warn("Failed to parse JSON from podcast response, constructing fallback:", parseErr);
      }
    }

    // Fallback if AI unavailable
    console.warn("Gemini models unavailable for podcast, generating rich contextual fallback.");
    const fallbackPodcast = generateContextualPodcastFallback(cleanTitle, cleanGuest, story, duration, tone);
    return res.json({ podcast: fallbackPodcast });

  } catch (error: any) {
    console.error("Critical error in /api/podcast/generate:", error);
    const safeFallback = generateContextualPodcastFallback(
      req.body?.title || "حوار أسري في السويد",
      req.body?.guestName || "أحمد",
      req.body?.story || "تجارب الأسرة في السويد",
      req.body?.duration || "3min",
      req.body?.tone || "مطمئنة"
    );
    return res.status(200).json({ podcast: safeFallback });
  }
});

// Rich contextual fallback generator for Podcast episodes
function generateContextualPodcastFallback(
  title: string,
  guestName: string,
  story: string,
  duration: string,
  tone: string
) {
  const storyLower = (story || "").toLowerCase();
  const isSchool = storyLower.includes("مدرسة") || storyLower.includes("skola") || storyLower.includes("طالب") || storyLower.includes("معلم") || storyLower.includes("صعوبة") || storyLower.includes("غياب");
  const isSocial = storyLower.includes("سوسيال") || storyLower.includes("social") || storyLower.includes("خوف") || storyLower.includes("بلاغ") || storyLower.includes("orosanmälan") || storyLower.includes("تواصل");
  const isDivorce = storyLower.includes("انفصال") || storyLower.includes("طلاق") || storyLower.includes("خلاف") || storyLower.includes("حضانة") || storyLower.includes("والدين");
  const isTranslation = storyLower.includes("ترجمة") || storyLower.includes("tolk") || storyLower.includes("مترجم") || storyLower.includes("اجتماع") || storyLower.includes("لغة");

  let turns: { speaker: string; role: "host" | "guest"; text: string }[] = [];
  let summary = "";
  let actionCall = "";
  let reelsHook = "";
  let reelsDialog: { speaker: string; role: "host" | "guest"; text: string }[] = [];

  if (isSocial) {
    turns = [
      {
        speaker: "هبه",
        role: "host",
        text: `أهلاً بكم في بودكاست جسر الأسرة في السويد. حوار يقرّب الفهم ويدعم الأسرة. يسعدني أن أرحب اليوم بضيفنا ${guestName}. ${guestName}، الكثير من الأهالي يشعرون بضغط كبير وقلق بمجرد سماع كلمة "السوسيال". ما الذي خطر ببالك عندما واجهت هذا الموقف؟`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `أهلاً بكِ أستاذة هبه. بصراحة، أول ما وصلني اتصال لطلب موعد، انتابني خوف شديد بسبب القصص والشائعات التي نسمعها على وسائل التواصل، وشعرت أنني مهدد في استقرار عائلتي.`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `هذا الشعور مفهوم وطبيعي تماماً يا ${guestName}، لكن من الضروري أن نعلم أن الهدف الأساسي لقانون الخدمات الاجتماعية (Socialtjänstlagen) في السويد هو مساعدة الأسرة ودعمها وليس إيذاءها. ما يقارب 98% من خدمات السوسيال هي خدمات دعم طوعي (Familjestöd) كجلسات استشارة وتدريب وتخفيف أعباء.`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `وما هي أفضل طريقة للتعامل مع هذا الموعد دون توتر؟`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `الخطوة الذهبية هي الشفافية والهدوء. لك حق قانوني كامل في طلب مترجم معتمد (Tolk) بلغتك مجاناً. اذهب واستمع للنقاط المطروحة، واشرح ظروفك، وإذا كان هناك أي تحدٍ، اطلب منهم خطط الدعم المتاحة في البلدية. التعاون هو الذي يبني الثقة ويحمي مصلحة الطفل الفضلى (Barnets bästa).`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `شكراً جزيلاً أستاذة هبه، هذا الشرح يمنحني راحة وطمأنينة ووضوحاً في الخطوات القادمة.`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `العفو يا ${guestName}. وتذكروا دائماً: المعرفة هي جسر الأمان، والحديث الصادق يفتح أبواب الحلول.`,
      },
    ];
    summary = "السوسيال جهة داعمة بالدرجة الأولى، والتعامل بهدوء وطلب مترجم مجاني (Tolk) يبني الثقة ويفعل خدمات الدعم الأسري الطوعي.";
    actionCall = "إذا تلقيت رسالة أو موعداً، احجز مترجماً معتمداً واحضر الحوار بكل ثقة للاستفادة من برامج مساندة الوالدين.";
    reelsHook = `هل تشعر بالخوف عند تلقي اتصال من السوسيال في السويد؟ إليك الحقيقة التي تحميك وترشدك.`;
    reelsDialog = [
      { speaker: guestName, role: "guest", text: "أول ما وصلني موعد السوسيال شعرت بخوف شديد من فقدان أطفالي!" },
      { speaker: "هبه", role: "host", text: "أكثر من 98% من عمل السوسيال هو دعم طوعي ومساندة للأهل. اطلب مترجماً رسمياً مجاناً، وتحدث بصدق للاستفادة من برامج الدعم." },
    ];
  } else if (isSchool) {
    turns = [
      {
        speaker: "هبه",
        role: "host",
        text: `أهلاً بكم في بودكاست جسر الأسرة في السويد. حوار يقرّب الفهم ويدعم الأسرة. معنا اليوم ${guestName} لنتحدث عن تجربة دراسية ومدرسية. ${guestName}، شاركنا ما الذي لاحظته على طفلك في المدرسة؟`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `أهلاً بكِ هبه. ابني بدأ يشكو من صعوبة في استيعاب بعض المواد، وأحياناً يشعر بالعزلة ولا يرغب في الذهاب صباحاً، وأنا كولي أمر في حيرة من أمري.`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `ما يمر به ابنك يحدث مع كثير من الطلاب، لكن الجميل في النظام المدرسي السويدي (Skollagen) أنه يلزم المدرسة بتقديم تعديلات إضافية (Extra anpassningar) ودعم خاص (Särskilt stöd) لكل طالب يحتاج ذلك، دون أي تكلفة إضافية على الأهل.`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `وكيف أبدأ في طلب هذا الدعم بشكل رسمي ومنظم؟`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `أولاً، اطلب اجتماعاً مع معلم الصف (Klasslärare) والمرشد التربوي، واطلب حضور مترجم (Tolk). ثانياً، اطلب إشراك فريق صحة الطالب (Elevhälsa) الذي يضم أخصائياً نفسياً وممرضة ومعلماً مختصاً بالتربية الخاصة (Specialpedagog) لوضع خطة دعم واضحة.`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `كنت أظن أن المشكلة تقع على عاتقي وحدي، والآن أرى أن المدرسة شريك داعم.`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `بالتأكيد يا ${guestName}. المدرسة وولي الأمر فريق واحد هدفه نجاح الطفل وسلامته النفسية.`,
      },
    ];
    summary = "القانون السويدي يضمن لكل طالب دعماً مخصصاً (Extra anpassningar) عبر فريق صحة الطالب (Elevhälsa) بمجرد تواصل الأهل المنظم مع المدرسة.";
    actionCall = "بادر بحجز موعد مع معلم الصف وفريق صحة الطالب، واطلب حضور مترجم رسمي لمناقشة خطة التعديلات الملائمة لطفلك.";
    reelsHook = `طفلك يواجه صعوبة في المدرسة السويدية؟ لا تدع الحيرة توقفك، فحقوق طفلك مكفولة قانونياً!`;
    reelsDialog = [
      { speaker: guestName, role: "guest", text: "ابني يعاني من صعوبة بالتركيز واللغة ولا أعرف ماذا أفعل مع المدرسة." },
      { speaker: "هبه", role: "host", text: "يحق لطفلك الحصول على دعم إضافي (Extra anpassningar) وفريق صحة الطالب مجاناً. اطلب موعداً عاجلاً مع المربي والمترجم." },
    ];
  } else if (isTranslation) {
    turns = [
      {
        speaker: "هبه",
        role: "host",
        text: `أهلاً بكم في بودكاست جسر الأسرة في السويد. حوار يقرّب الفهم ويدعم الأسرة. يسعدنا وجود ${guestName} معنا اليوم. ${guestName}، الكثير من الأشخاص يترددون في طلب مترجم في الاجتماعات الرسمية، كيف كانت تجربتك؟`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `أهلاً أستاذة هبه. كنت أحياناً أشعر بالحرج أو أحاول التحدث بالسويدية المحدودة، لكني وجدت أنني لا أفهم كل التفاصيل الدقيقة والقانونية!`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `هذه نقطة في غاية الأهمية يا ${guestName}. في القانون الإداري السويدي (Förvaltningslagen)، طلب المترجم المعتمد (Tolk) ليس مجرد خدمة ثانوية، بل هو حق أصيل ومجاني لكل مراجع لضمان الأمان القانوني وفهم القرارات بدقة. المترجم ملزم بالسرية المهنية التامة ولا يتدخل في القرار.`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `وهل يقلل طلب المترجم من نظرة المؤسسات السويدية لجهودي في الاندماج؟`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `على العكس تماماً! الجهات السويدية تفضل دائماً وجود مترجم معتمد لتفادي أي سوء فهم أو قرارات خاطئة مبنية على ترجمة ناقصة. استخدام المترجم دلالة على الوعي والحرص على حقوق أسرتك.`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `تذكروا دائماً: لا تتنازلوا عن حقكم في الفهم الكامل، فوضوح الكلمة هو بداية الحل.`,
      },
    ];
    summary = "طلب المترجم الرسمي (Tolk) حق قانوني مجاني يضمن الأمان والدقة والسرية الكاملة في جميع المقابلات مع الجهات السويدية.";
    actionCall = "احرص على إبلاغ أي جهة مسبقاً بحاجتك لمترجم معتمد لغتك الأم عند حجز أي موعد رسمي.";
    reelsHook = `هل تخجل من طلب مترجم في السويد؟ إليك سبب يجعل الجهات الرسمية تشكرك إذا طلبت مترجماً!`;
    reelsDialog = [
      { speaker: guestName, role: "guest", text: "أخجل من طلب مترجم حتى لا يظنوا أنني لم أتعلم اللغة بعد." },
      { speaker: "هبه", role: "host", text: "طلب المترجم (Tolk) هو حقك القانوني لضمان الدقة والسرية، والمؤسسات تفضله لمنع أي التباس في مصلحة عائلتك." },
    ];
  } else {
    // Default family dispute / general story
    turns = [
      {
        speaker: "هبه",
        role: "host",
        text: `أهلاً بكم في بودكاست جسر الأسرة في السويد. حوار يقرّب الفهم ويدعم الأسرة. يسعدني أن أرحب اليوم بضيفنا ${guestName}. ${guestName}، طرحت موضوعاً يهم الكثير من العائلات حول "${title}". ما التحدي الأساسي الذي واجهك؟`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `أهلاً أستاذة هبه. التحدي هو كيفية إدارة الخلافات وحماية مصلحة واستقرار أطفالنا، دون أن نقع في صراعات أو ضياع للحقوق في السويد.`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `هذا الوعي ممتاز جداً يا ${guestName}. القانون السويدي في قانون الوالدين (Föräldrabalken) ينطلق دائماً من مبدأ أن مصلحة الطفل هي البوصلة (Barnets bästa). توفر البلديات جلسات استشارة أسرية (Familjerådgivning) ومحادثات تعاون (Samarbetssamtal) بسرية مطلقة وبأسعار رمزية لمساعدة الوالدين على الاتفاق الودي.`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `وكيف نضمن عدم تصعيد الخلاف وتجنيب الأطفال أي ضغط نفسي؟`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `من خلال فصل مشاعر الخلاف بين البالغين عن مسؤولية الوالدية المشتركة. التواصل الهادئ واللجوء لجلسات الإرشاد الأسري بالبلدية يمنح الأطفال بيئة آمنة تضمن حقوقهم في الرعاية والحنان من كلا الطرفين.`,
      },
      {
        speaker: guestName,
        role: "guest",
        text: `هذه رؤية حكيمة ومريحة، شكراً لكِ أستاذة هبه.`,
      },
      {
        speaker: "هبه",
        role: "host",
        text: `أهلاً بك دائماً. ونتمنى لجميع عائلاتنا في السويد دوام الاستقرار والتفاهم والأمان.`,
      },
    ];
    summary = "الحوار الهادئ والاستفادة من خدمات الإرشاد الأسري في البلدية (Familjerådgivning) يحمي استقرار الأطفال ويحقق مصلحتهم الفضلى.";
    actionCall = "تواصل مع خدمة الإرشاد الأسري أو وحدة قانون الأسرة في بلديتك لحجز جلسة وساطة ودية وسرية.";
    reelsHook = `خلافات بعد الانفصال؟ كيف تحمي أطفالك وحقوقك بالقانون السويدي بدون توتر.`;
    reelsDialog = [
      { speaker: guestName, role: "guest", text: "كيف ندير اتفاقات الأطفال والحضانة بعد الخلاف دون الدخول في نزاعات؟" },
      { speaker: "هبه", role: "host", text: "جلسات التعاون (Samarbetssamtal) في بلديتك تساعدكما على وضع خطة ودية سرية تضمن راحة أطفالكما." },
    ];
  }

  const fullText = turns.map((t) => `${t.speaker}: ${t.text}`).join("\n\n");
  const reelsFullText = `${reelsHook}\n\n` +
    reelsDialog.map((t) => `${t.speaker}: ${t.text}`).join("\n\n") +
    `\n\nهبه: جسر الأسرة في السويد — نفهم معًا، ونبني الثقة.`;

  return {
    title,
    guestName,
    duration,
    tone,
    turns,
    fullText,
    summary,
    actionCall,
    reelsVersion: {
      hook: reelsHook,
      turns: reelsDialog,
      closing: "جسر الأسرة في السويد — نفهم معًا، ونبني الثقة.",
      fullText: reelsFullText,
    },
    disclaimer: "هذا المحتوى توعوي عام ولا يغني عن الاستشارة المتخصصة في الحالات الفردية أو الطارئة.",
  };
}

// Text to Speech endpoint using gemini-3.1-flash-tts-preview with graceful fallback
app.post("/api/tts", async (req, res) => {

  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "النص مطلوب للتحويل الصوتي (Text is required)" });
    }

    // Limit text length to reasonable size for TTS
    const trimmedText = text.slice(0, 1000);

    const ai = getGenAI();
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ fallback: true, message: "GEMINI_API_KEY is not configured, using browser voice." });
    }

    const voiceName = voice === "male" ? "Puck" : "Kore"; // 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'
    const prompt = `اقرأ النص التالي باللغة العربية بصوت دافئ وهادئ ومفهوم وواضح: ${trimmedText}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const audioPart = candidate?.content?.parts?.find((p) => p.inlineData && p.inlineData.data);

      if (audioPart && audioPart.inlineData?.data) {
        return res.json({
          audio: audioPart.inlineData.data,
          mimeType: audioPart.inlineData.mimeType || "audio/pcm;rate=24000",
          sampleRate: 24000,
        });
      }
    } catch (ttsErr: any) {
      console.warn("Gemini TTS service temporarily unavailable (503/high demand), delegating to client speech synthesis:", ttsErr?.message);
      return res.json({ fallback: true, message: "Gemini TTS unavailable, fallback to browser speech synthesis." });
    }

    return res.json({ fallback: true, message: "No audio stream returned, using browser voice." });
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    res.json({
      fallback: true,
      error: "تعذر توليد الصوت بالذكاء الاصطناعي، يتم الانتقال للقارئ الصوتي للمتصفح",
      details: error.message,
    });
  }
});

// Static / Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`جسر الأسرة في السويد - Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
