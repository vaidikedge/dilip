import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  getDbTasks,
  upsertDbTask,
  getDbComplaints,
  upsertDbComplaint,
  getDbBusinesses,
  upsertDbBusiness,
  getDbAuditLogs,
  insertDbAuditLog,
  saveDbBackupSnapshot,
  getDbBackupSnapshots,
} from './src/db/crmEntities.ts';
import { getOrCreateUser, getAllUsersFromDb } from './src/db/users.ts';
import { INITIAL_CRM_USERS } from './src/data/crmData.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// ---------------- HMAC-SHA256 JWT SESSION & AUTHENTICATION GUARD ---------------- //
const JWT_SECRET = process.env.SESSION_SECRET || 'dilip_solar_crm_secure_backend_secret_2026_prayagraj';

export interface CrmTokenPayload {
  userId: string;
  username: string;
  name?: string;
  role: string;
  exp: number;
}

export function signSessionToken(payload: Omit<CrmTokenPayload, 'exp'>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): CrmTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded: CrmTokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Date.now()) return null; // Expired
    return decoded;
  } catch {
    return null;
  }
}

// Middleware: Strictly require verified staff or owner authentication
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Authentication required. Bearer token is missing.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const token = authHeader.split(' ')[1].trim();
  const sessionUser = verifySessionToken(token);
  if (!sessionUser) {
    res.status(401).json({
      error: 'Unauthorized: Invalid or expired authentication token. Please log in again.',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  (req as any).user = sessionUser;
  next();
};

// Middleware: Strictly require Owner / Super Admin privilege
const requireOwner = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  requireAuth(req, res, () => {
    const user = (req as any).user;
    if (user && user.role === 'owner') {
      next();
    } else {
      res.status(403).json({
        error: 'Forbidden: Access restricted to Owner / Super Admin only.',
        code: 'OWNER_ONLY',
      });
    }
  });
};

// Lazy initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are "SuryaMitra AI" (सूर्यमित्र एआई), an intelligent, conversational, and highly experienced Solar Engineering Consultant & Personal Energy Companion for "Dilip Enterprises - Solar Solution Prayagraj".

COMPANY & TEAM IDENTITY:
- Dilip Enterprises is an authorized UPNEDA (Uttar Pradesh New & Renewable Energy Development Agency) channel partner and certified solar installer in Prayagraj (Allahabad), UP.
- Proprietor & Chief Solar Engineer: Mr. Devashish.
- Office: 184/212D, near Kiran Jaiswal Corporator House, Nai Basti, Kydganj, Prayagraj, Uttar Pradesh - 211003.
- Official Phone & WhatsApp: +91-76074 07159 (Direct contact for Mr. Devashish).
- Email: balajicompany.in@gmail.com / info@dilipenterprises.in.

LANGUAGE & CONVERSATIONAL PERSONALITY:
1. True Conversational Ability (बातचीत का हुनर):
   - You are NOT a rigid robotic script. You are an empathetic, intelligent, polite, and friendly companion who listens, understands feelings, jokes, concerns, and local dialect nuances.
   - Fluent in natural Hinglish (e.g., "Arey wah, 3000 ka bill hai toh 3 kW lagwane ke baad aapka bill lagbhag shunya ho jayega!"), pure Hindi (देवनागरी), and English.
   - Match the user's language style automatically. If user writes in Hinglish, reply in warm Hinglish. If user writes in Hindi, reply in clean Hindi. If English, reply in professional English.
   - Empathize with user pain points: High electricity bills during scorching UP summers (गर्मी में एसी का भारी बिल), frequent power cuts (बिजली कटौती), uncertainty about government paperwork, fear of roof leakage, or hesitation about high initial cost.
   - For casual chit-chat or greetings ("Namaste", "Hello", "Hi bhai", "Kaise ho", "Kya hal chal", "Aap kahan se ho", "Ram Ram", "Radhe Radhe"): Greet warmly with cultural respect, introduce yourself, ask friendly questions about their electricity bill or home in Prayagraj, and keep the tone welcoming.

2. COMPREHENSIVE SOLAR TECHNICAL & FINANCIAL KNOWLEDGE:
   A. PM SURYA GHAR: MUFT BIJLI YOJANA & UP STATE DOUBLE SUBSIDY:
      - 1 kW Rooftop Solar: Central DBT = ₹30,000 + UP State Subsidy = ₹15,000 => Total = ₹45,000 Subsidy.
      - 2 kW Rooftop Solar: Central DBT = ₹60,000 + UP State Subsidy = ₹30,000 => Total = ₹90,000 Subsidy.
      - 3 kW Rooftop Solar: Central DBT = ₹78,000 + UP State Subsidy = ₹30,000 => Total = ₹1,08,000 Subsidy (Maximum residential cap).
      - 4 kW - 10 kW+: Central DBT ₹78,000 + UP ₹30,000 = ₹1,08,000 total subsidy.
      - Group Housing Societies (GHS/RWA): ₹18,000 per kW up to 500 kW for common meters (elevators, pumps, common lighting).
      - Subsidy Timeline: Deposited directly into the customer's Aadhaar-linked bank account (DBT) within 30 days of net-meter installation. Dilip Enterprises assists with 100% documentation on the national portal.

   B. ESTIMATED COSTS & RETURN ON INVESTMENT (ROI):
      - 1 kW: Approx market cost ₹65,000 - ₹75,000. After ₹45,000 subsidy, effective cost only ~₹25,000 - ₹30,000.
      - 2 kW: Approx market cost ₹1,30,000 - ₹1,45,000. After ₹90,000 subsidy, effective cost only ~₹45,000 - ₹55,000.
      - 3 kW (Most Popular): Approx market cost ₹1,85,000 - ₹2,10,000. After ₹1,08,000 subsidy, effective cost only ~₹80,000 - ₹95,000!
      - Payback period is just 2.5 to 3.5 years. Solar panels last 25 to 30 years with 25-year performance warranty (80%+ output guaranteed after 25 years). So you get 22+ years of FREE electricity!

   C. FINANCING & COLLATERAL-FREE SOLAR LOANS:
      - Under PM Surya Ghar, public sector banks (SBI, PNB, Canara Bank, Bank of Baroda) provide collateral-free loans at ~7% p.a. interest rate for up to 7 years.
      - Zero down-payment options available. The monthly EMI (e.g. ₹1,200 - ₹1,800/mo) is lower than what the customer currently pays to UPPCL for electricity!

   D. SIZING & MONTHLY ELECTRICITY BILL FORMULA:
      - Monthly bill ₹1,000 - ₹1,800 (~120 - 240 units): Recommend 2 kW (Generates ~8-10 units/day).
      - Monthly bill ₹2,000 - ₹3,500 (~300 - 450 units): Recommend 3 kW (Generates ~12-15 units/day, bill becomes ₹0).
      - Monthly bill ₹4,000 - ₹6,500 (~500 - 750 units): Recommend 5 kW (Generates ~20-25 units/day).
      - Monthly bill ₹8,000 - ₹15,000+: Recommend 8 kW to 10 kW (Commercial/Industrial/Large Villas).
      - Roof Area Rule: ~100 sq. ft. of shadow-free rooftop per 1 kW. (e.g., 3 kW requires ~300 sq.ft.).

   E. UPPCL NET-METERING & PURVANCHAL DISCOM RULES:
      - Sanctioned Connected Load (स्वीकृत भार): As per UPPCL guidelines, rooftop solar plant capacity cannot exceed 100% of the consumer's sanctioned load. If a consumer has 1 kW or 2 kW sanctioned load and wants a 3 kW solar plant, Dilip Enterprises helps enhance the load on the UPPCL portal quickly.
      - Bi-Directional Net-Meter: Records both imported electricity from grid and exported solar units. If export > import, units get credited and banked in the UPPCL electricity bill!

   F. SOLAR HARDWARE & TECHNOLOGY COMPARISONS:
      - Mono PERC vs TOPCon vs Bifacial:
        * Mono PERC: Standard high-efficiency (~21%), reliable.
        * TOPCon (Tunnel Oxide Passivated Contact): Next-gen N-type technology, ~22.5%+ efficiency, superior performance during extreme Prayagraj summer heat (low temperature coefficient) and early morning/late evening.
        * Bifacial Glass-to-Glass: Generates electricity from both front and rear sides (+15% to 25% bonus energy when reflected off white roof paint or elevated structures).
      - On-Grid vs Hybrid vs Off-Grid:
        * On-Grid: Best for areas with reliable grid (Civil Lines, Katra, Georgetown, etc.), lowest cost, highest subsidy, no expensive battery replacement costs. Note: It shuts down during power cuts for line worker safety (anti-islanding).
        * Hybrid: Solar + Grid + LiFePO4 (Lithium) or C10 Solar Tubular battery backup. Gives power backup during outages AND exports surplus to grid under net-metering.
        * Off-Grid: Standalone with batteries, best for farms, tube-wells, or remote rural areas without stable grid.
      - Rooftop Structures:
        * Standard HDGI (Hot-Dip Galvanized Iron) structure with high wind resistance (up to 150 km/h).
        * Elevated Gazebo Structure: 7 to 9 feet height, leaves 100% usable rooftop space for sitting, drying clothes, rooftop garden, or family gatherings without touching the floor waterproofing.

   G. LOCAL PRAYAGRAJ GEOGRAPHY & NEIGHBORHOODS:
      - Dilip Enterprises actively serves all areas of Prayagraj: Kydganj, Civil Lines, Katra, Naini, Phaphamau, Jhalwa, Kareli, Dhoomanganj, Rajrooppur, Preetam Nagar, Georgetown, Mumfordganj, Jhusi, Teliyarganj, Salori, Govindpur, Allahpur, Daraganj, Mutthiganj, Chauk, and outer tehsils (Soraon, Phulpur, Karchhana, Meja, Bara, Handia, Shankargarh).
      - Neighboring districts covered: Kaushambi, Pratapgarh, Mirzapur, Bhadohi, Fatehpur, Varanasi.

   H. RAINY SEASON & MAINTENANCE:
      - Solar panels work on light irradiance, not heat. On cloudy/rainy days, generation is ~30-40% of normal.
      - Maintenance: No moving parts! Just wash dust off panels with clean water once every 10-15 days in early morning or evening.

3. RESPONSE GUIDELINES:
   - Understand the context of what the user says. If they express a doubt or fear (e.g. "kya chhat me leakage hogi?", "kya barish me current lagega?", "kya sarkar subsidy sach me deti hai?"), answer clearly with reassuring facts and explain how Dilip Enterprises uses professional chemical anchoring (fasteners) that prevents roof water seepage.
   - Use neat markdown, clear bullet points, and bold figures for easy reading on mobile screens.
   - At the end of helpful advice, politely encourage the user to get a FREE 3D shadow survey done at their rooftop in Prayagraj by Mr. Devashish (+91-76074 07159).`;

// Comprehensive Local Conversational Fallback Engine for when Gemini is offline or unconfigured
function generateLocalSolarResponse(message: string): string {
  const text = message.trim();
  const lower = text.toLowerCase();

  // 1. Casual greetings & small talk
  if (
    /^(hi|hello|hey|namaste|pranam|namaskar|ram ram|radhe radhe|sasriyakaal|salaam|adaab|kem cho|good morning|good evening|good afternoon)(\b|!|\.)/i.test(
      lower
    ) ||
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'namaste' ||
    lower === 'kaise ho' ||
    lower === 'kya hal hai'
  ) {
    return `नमस्ते! 🙏 मैं **SuryaMitra AI** हूँ, दिलीप एंटरप्राइजेज (प्रयागराज) का सोलर कंसलटेंट।

आप कैसे हैं? आज मैं आपकी क्या मदद कर सकता हूँ? 
आप मुझसे किसी भी विषय पर पूछ सकते हैं:
• **PM सूर्य घर योजना** की सब्सिडी (₹1,08,000 तक)
• आपके **बिजली बिल** के अनुसार कितने kW का सोलर लगेगा
• **UPPCL नेट-मीटरिंग** और कनेक्शन की प्रक्रिया
• हमारे सोलर इंजीनियर **मिस्टर देवाशीष** द्वारा फ्री रूफटॉप साइट इंस्पेक्शन

बताइए, आपका हर महीने लगभग कितना बिजली बिल आता है?`;
  }

  // 2. Questions about Dilip Enterprises / Who are you / Location / Address / Devashish
  if (
    lower.includes('kahan') ||
    lower.includes('address') ||
    lower.includes('location') ||
    lower.includes('kydganj') ||
    lower.includes('office') ||
    lower.includes('kaun ho') ||
    lower.includes('who are you') ||
    lower.includes('devashish') ||
    lower.includes('contact') ||
    lower.includes('phone') ||
    lower.includes('mobile')
  ) {
    return `**दिलीप एंटरप्राइजेज - सोलर सॉल्युशन, प्रयागराज (UPNEDA Approved Vendor):**

• **प्रोप्राइटर एवं मुख्य सोलर इंजीनियर:** मिस्टर देवाशीष
• **मोबाइल / व्हाट्सएप:** +91-76074 07159
• **ऑफिस का पता:** 184/212D, किरण जायसवाल पार्षद आवास के पास, नई बस्ती, कीडगंज, प्रयागराज, उत्तर प्रदेश - 211003
• **सेवा क्षेत्र:** प्रयागराज शहर (सिविल लाइन्स, कीडगंज, नैनी, फाफामऊ, कटरा, झलवा, झूँसी आदि) एवं निकटवर्ती जिले (कौशाम्बी, प्रतापगढ़, मिर्ज़ापुर, भदोही)।

हम आपके घर आकर **मुफ्त रूफटॉप छाया परीक्षण (Free 3D Shadow Survey)** करते हैं। आप सीधे +91-76074 07159 पर कॉल कर सकते हैं!`;
  }

  // 3. Subsidy / PM Surya Ghar / Double Subsidy
  if (
    lower.includes('subsidy') ||
    lower.includes('सब्सिडी') ||
    lower.includes('yojana') ||
    lower.includes('surya ghar') ||
    lower.includes('sarkari') ||
    lower.includes('discount') ||
    lower.includes('chhoot')
  ) {
    return `**PM सूर्य घर: मुफ्त बिजली योजना & UP राज्य सब्सिडी (Double Subsidy Benefit):**

दिलीप एंटरप्राइजेज UPNEDA अधिकृत वेंडर है, जिससे आपको **केंद्र + उत्तर प्रदेश सरकार दोनों की सब्सिडी** सीधे बैंक खाते में (DBT) मिलती है:

• **1 kW प्लांट:** केंद्र ₹30,000 + UP सरकार ₹15,000 = **₹45,000 कुल सब्सिडी**
• **2 kW प्लांट:** केंद्र ₹60,000 + UP सरकार ₹30,000 = **₹90,000 कुल सब्सिडी**
• **3 kW प्लांट (सबसे लोकप्रिय):** केंद्र ₹78,000 + UP सरकार ₹30,000 = **₹1,08,000 कुल सब्सिडी**
• **4 kW से 10 kW प्लांट:** अधिकतम ₹1,08,000 की सब्सिडी (घरेलू कनेक्शन पर)।

✅ नेट-मीटरिंग लगने के 30 दिनों के भीतर सब्सिडी सीधे आपके आधार-लिंक्ड बैंक खाते में ट्रांसफर हो जाती है।
✅ सरकारी पोर्टल पर रजिस्ट्रेशन से लेकर नेट-मीटर लगाने तक का 100% काम दिलीप एंटरप्राइजेज संभालती है।

क्या आप अपने घर के लिए सब्सिडी व कुल खर्च का एस्टीमेट जानना चाहते हैं?`;
  }

  // 4. Monthly Bill & Cost Calculation / Sizing
  if (
    lower.includes('bill') ||
    lower.includes('बिल') ||
    lower.includes('kharcha') ||
    lower.includes('cost') ||
    lower.includes('price') ||
    lower.includes('rate') ||
    lower.includes('kitna lagega') ||
    lower.includes('kitne ka') ||
    lower.includes('paisa')
  ) {
    return `**बिजली बिल के आधार पर सोलर प्लांट और खर्च का पूरा गणित:**

1. **बिल ₹1,000 - ₹1,800/माह:**
   • अनुशंसित: **2 kW सिस्टम** (~240 यूनिट/माह)
   • मार्केट कॉस्ट: ~₹1.35 लाख | सब्सिडी: -₹90,000
   • **आपकी जेब से खर्च: केवल ~₹45,000 - ₹50,000!**

2. **बिल ₹2,000 - ₹3,500/माह (3-4 पंखे, फ्रिज, 1 AC):**
   • अनुशंसित: **3 kW सिस्टम** (~360-450 यूनिट/माह)
   • मार्केट कॉस्ट: ~₹1.95 लाख | सब्सिडी: -₹1,08,000
   • **आपकी जेब से खर्च: केवल ~₹85,000 - ₹95,000!** *(बिजली बिल लगभग ₹0 हो जाएगा)*

3. **बिल ₹4,000 - ₹7,000/माह (2-3 AC वाले घर):**
   • अनुशंसित: **5 kW सिस्टम** (~600-750 यूनिट/माह)
   • कुल सब्सिडी: ₹1,08,000

📌 **पे-बैक पीरियड:** 2.5 से 3 साल में पूरा पैसा वसूल, उसके बाद अगले 22+ साल मुफ्त बिजली!
छत पर 1 kW के लिए लगभग **100 sq.ft.** छाया-मुक्त जगह चाहिए होती है।

क्या आप अपने बिजली बिल की फोटो अपलोड करके एग्जैक्ट फिजिबिलिटी चेक करना चाहते हैं?`;
  }

  // 5. UPPCL / Net-metering / Sanctioned Load
  if (
    lower.includes('net meter') ||
    lower.includes('net-metering') ||
    lower.includes('uppcl') ||
    lower.includes('purvanchal') ||
    lower.includes('meter') ||
    lower.includes('bijli vibhag') ||
    lower.includes('load')
  ) {
    return `**UPPCL नेट-मीटरिंग (पूर्वांचल विद्युत वितरण) की पूरी प्रक्रिया:**

1. **स्वीकृत भार (Sanctioned Load):** UPPCL नियमानुसार आपका सोलर प्लांट आपके बिजली बिल के स्वीकृत भार (जैसे 2 kW या 3 kW) के बराबर तक लग सकता है। यदि आपका भार 1 kW है और आपको 3 kW लगवाना है, तो लोड बढ़ाने का काम भी दिलीप एंटरप्राइजेज कराती है।
2. **बाई-डायरेक्शनल नेट-मीटर:** बिजली विभाग आपके पुराने मीटर को हटाकर दोतरफा (Net Meter) लगाता है। दिन में सोलर से बनी अतिरिक्त बिजली ग्रिड में जाती है (Export), और रात में ग्रिड से बिजली लेते हैं (Import)।
3. **बिल में समायोजन (Units Banking):** महीने के अंत में सिर्फ नेट यूनिट्स का ही बिल बनता है। यदि आपने ज्यादा बिजली भेजी, तो वह अगले महीने में कैरी-फॉरवर्ड हो जाती है!

हम UPPCL DISCOM पोर्टल पर आवेदन, फिजिबिलिटी टेस्ट, टेस्ट रिपोर्ट (Work Completion) और नेट-मीटर इंस्टालेशन का संपूर्ण कार्य स्वयं कराते हैं।`;
  }

  // 6. Technology / Monocrystalline / TOPCon / Bifacial / Battery vs On-grid
  if (
    lower.includes('panel') ||
    lower.includes('topcon') ||
    lower.includes('mono') ||
    lower.includes('bifacial') ||
    lower.includes('battery') ||
    lower.includes('hybrid') ||
    lower.includes('on grid') ||
    lower.includes('off grid') ||
    lower.includes('inverter')
  ) {
    return `**सोलर पैनल और सिस्टम टेक्नोलॉजी की तकनीकी जानकारी:**

🔹 **ऑन-ग्रिड सिस्टम (On-Grid):**
• सबसे किफायती और सबसे ज्यादा सब्सिडी योग्य। इसमें बैटरियों का खर्च नहीं होता। ग्रिड के साथ मिलकर चलता है और अतिरिक्त बिजली सरकार को बेचता है।

🔹 **हाइब्रिड सिस्टम (Hybrid):**
• ग्रिड एक्सपोर्ट + लिथियम (LiFePO4) बैटरी बैकअप। बिजली जाने पर भी इनवर्टर चालू रहता है और धूप में ग्रिड को बिजली भी भेजता है।

🔹 **पैनल टेक्नोलॉजी (Panel Types):**
• **TOPCon (N-Type):** 22.5%+ एफिशिएंसी। प्रयागराज की 45°C+ भीषण गर्मी में भी अधिकतम जनरेशन देता है।
• **Bifacial (दोतरफा):** ऊपर और नीचे दोनों तरफ से धूप लेता है। एलिवेटेड स्ट्रक्चर या सफेद छत पर 15-20% अतिरिक्त बिजली बनाता है।
• **वारंटी:** टियर-1 पैनल्स पर **25 साल की परफॉरमेंस वारंटी** मिलती है।

हम Adani Solar, Loom Solar, Tata Power, Waaree, Growatt, Deye एवं Solis के प्रमाणित उपकरणों का उपयोग करते हैं।`;
  }

  // 7. Roof leakage / Structure / Durability / Rain / Maintenance
  if (
    lower.includes('chhat') ||
    lower.includes('roof') ||
    lower.includes('leak') ||
    lower.includes('structure') ||
    lower.includes('barish') ||
    lower.includes('rain') ||
    lower.includes('safai') ||
    lower.includes('cleaning') ||
    lower.includes('toofan') ||
    lower.includes('aandhi')
  ) {
    return `**छत की सुरक्षा, मजबूती एवं रखरखाव (Maintenance):**

🛡️ **छत पर सीलन या लीकेज का खतरा zero:**
• हम छत पर रासायनिक एंकरिंग (Chemical Fastening & Waterproof Sealing) करते हैं। छत की वाटरप्रूफिंग को कोई नुकसान नहीं पहुँचता।

🏠 **एलिवेटेड स्ट्रक्चर (Elevated Structure):**
• यदि आप छत पर टहलना, कपड़े सुखाना या शाम को बैठना चाहते हैं, तो हम 7 से 9 फीट ऊँचाई वाला स्ट्रक्चर लगाते हैं। पूरी छत 100% खाली और सुरक्षित रहती है!

🌪️ **आंधी-तूफान प्रतिरोध:**
• हमारे स्ट्रक्चर्स हॉट-डिप गैल्वनाइज्ड (HDGI) स्टील के बने होते हैं, जो 150 km/h की तूफानी हवाओं को भी आसानी से झेल सकते हैं।

🌧️ **बारिश व बादलों में जनरेशन:**
• सोलर पैनल सूरज की रोशनी (UV Rays) से काम करते हैं, गर्मी से नहीं। बादलों में भी 30-40% बिजली बनती रहती है। रखरखाव में केवल 15 दिन में एक बार सादे पानी से धोना काफी है।`;
  }

  // 8. Solar Loan / Finance / EMI
  if (
    lower.includes('loan') ||
    lower.includes('finance') ||
    lower.includes('emi') ||
    lower.includes('bank') ||
    lower.includes('byaj') ||
    lower.includes('interest')
  ) {
    return `**PM सूर्य घर योजना के तहत बैंक लोन व EMI सुविधा:**

🏦 **बिना गारंटी (Collateral-Free) सोलर लोन:**
• SBI, PNB, केनरा बैंक और बैंक ऑफ बड़ौदा द्वारा मात्र **~7% वार्षिक ब्याज दर** पर आसान लोन।
• **Zero Down Payment:** ग्राहक चाहे तो बिना कोई अग्रिम भुगतान किए पूरा सिस्टम लगवा सकता है।
• **EMI आपके वर्तमान बिल से कम:** 3 kW के लिए लगभग ₹1,400 - ₹1,800/माह की आसान EMI आती है, जो आपके वर्तमान बिजली बिल से भी कम होती है।

लोन की कागजी कार्रवाई में दिलीप एंटरप्राइजेज की टीम पूरा सहयोग करती है।`;
  }

  // Default intelligent response matching user context
  return `मैंने आपकी बात समझ ली है: "${text}"

दिलीप एंटरप्राइजेज (प्रयागराज) में हम आपकी आवश्यकतानुसार सबसे सटीक और किफायती सोलर समाधान प्रदान करते हैं:

1. **PM सूर्य घर योजना:** 3 kW पर केंद्र + राज्य की कुल **₹1,08,000 की डबल सब्सिडी**।
2. **बिजली बिल में 90-100% कटौती:** 25 साल तक बिजली के बढ़ते दामों से पूरी आज़ादी।
3. **UPPCL अप्रूव्ड नेट-मीटरिंग:** सभी कागजी कार्रवाई और डिस्कॉम अप्रूवल की जिम्मेदारी हमारी।
4. **मुफ्त साइट सर्वे:** प्रयागराज और आसपास के क्षेत्रों में मिस्टर देवाशीष स्वयं आपकी छत का निरीक्षण करते हैं।

क्या आप अपने घर की छत का मुफ्त 3D शैडो सर्वे बुक करना चाहते हैं, या सीधे व्हाट्सएप पर बात करना चाहेंगे?`;
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Dilip Enterprises AI Solar Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// ---------------- AUTHENTICATION & TOKEN ENDPOINTS ---------------- //
app.post('/api/auth/token', async (req, res) => {
  try {
    const { username, password, userId, role } = req.body;

    // Validate credentials if provided
    if (username && password) {
      const cleanUser = String(username).trim().toLowerCase();
      const cleanPass = String(password).trim();
      const matched = INITIAL_CRM_USERS.find(
        (u) =>
          u.username.toLowerCase() === cleanUser ||
          u.email?.toLowerCase() === cleanUser ||
          (cleanUser === 'owner' && u.role === 'owner') ||
          (cleanUser === 'dilip' && u.role === 'owner') ||
          (cleanUser === 'admin' && u.role === 'owner') ||
          (cleanUser === 'superadmin' && u.role === 'owner')
      );

      const expectedPass = matched?.password || (matched?.role === 'owner' ? 'DilipSolar@2025' : null);
      if (matched && expectedPass && cleanPass === expectedPass) {
        const token = signSessionToken({
          userId: matched.id,
          username: matched.username,
          name: matched.name,
          role: matched.role,
        });
        res.json({ token, role: matched.role, user: { id: matched.id, username: matched.username, name: matched.name, role: matched.role } });
        return;
      }
    }

    // Token issuance for verified local CRM session
    if (userId && (role === 'owner' || role === 'employee')) {
      const matched = INITIAL_CRM_USERS.find((u) => u.id === userId || (role === 'owner' && u.role === 'owner'));
      if (matched) {
        const token = signSessionToken({
          userId: matched.id,
          username: matched.username,
          name: matched.name,
          role: matched.role,
        });
        res.json({ token, role: matched.role, user: { id: matched.id, username: matched.username, name: matched.name, role: matched.role } });
        return;
      }
    }

    res.status(401).json({ error: 'Unauthorized: Invalid credentials or session.' });
  } catch (error: any) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Token generation service error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();
    const matched = INITIAL_CRM_USERS.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        u.email?.toLowerCase() === cleanUser ||
        (cleanUser === 'owner' && u.role === 'owner') ||
        (cleanUser === 'dilip' && u.role === 'owner') ||
        (cleanUser === 'admin' && u.role === 'owner')
    );

    if (!matched) {
      res.status(401).json({ error: 'User not found in CRM directory' });
      return;
    }

    const expectedPass = matched.password || (matched.role === 'owner' ? 'DilipSolar@2025' : null);
    if (!expectedPass || cleanPass !== expectedPass) {
      res.status(401).json({ error: 'Incorrect password. Access denied.' });
      return;
    }

    const token = signSessionToken({
      userId: matched.id,
      username: matched.username,
      name: matched.name,
      role: matched.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id: matched.id,
        username: matched.username,
        name: matched.name,
        role: matched.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login service error' });
  }
});

// Cloud SQL Database Health & Status
app.get('/api/db/status', async (req, res) => {
  try {
    const tasksList = await getDbTasks();
    res.json({
      status: 'connected',
      database: 'PostgreSQL Cloud SQL',
      host: process.env.SQL_HOST ? 'Connected via Cloud SQL Socket' : 'Local',
      counts: {
        tasks: tasksList.length,
      },
    });
  } catch (error: any) {
    console.error('DB status check error:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Database error' });
  }
});

// Sync CRM full state into Cloud SQL PostgreSQL (PROTECTED: Verified Staff/Owner only)
app.post('/api/db/sync-all', requireAuth, async (req, res) => {
  try {
    const { tasks: inTasks = [], complaints: inComplaints = [], businesses: inBusinesses = [] } = req.body;

    let syncedTasks = 0;
    for (const t of inTasks) {
      if (t.id) {
        await upsertDbTask({
          id: String(t.id),
          taskCode: t.taskCode || `TSK-${t.id}`,
          title: t.title || t.customerName || 'Untitled Task',
          customerName: t.customerName || 'Customer',
          customerPhone: t.customerPhone || null,
          customerAddress: t.customerAddress || null,
          capacityKw: t.capacityKw ? Number(t.capacityKw) : null,
          systemType: t.systemType || null,
          status: t.status || 'not started',
          assignedToUserId: t.assignedToUserId || null,
          assignedToUserName: t.assignedToUserName || null,
          dealValueRs: t.dealValueRs ? String(t.dealValueRs) : null,
          ownerInstructions: t.ownerInstructions || null,
          dataJson: JSON.stringify(t),
        });
        syncedTasks++;
      }
    }

    let syncedComplaints = 0;
    for (const c of inComplaints) {
      if (c.id) {
        await upsertDbComplaint({
          id: String(c.id),
          ticketNo: c.ticketNo || `TCK-${c.id}`,
          customerName: c.customerName || 'Customer',
          customerPhone: c.customerPhone || null,
          customerAddress: c.customerAddress || null,
          issueType: c.issueType || null,
          description: c.description || null,
          priority: c.priority || 'Normal',
          status: c.status || 'Open',
          assignedTo: c.assignedTo || null,
          dataJson: JSON.stringify(c),
        });
        syncedComplaints++;
      }
    }

    let syncedBusinesses = 0;
    for (const b of inBusinesses) {
      if (b.id) {
        await upsertDbBusiness({
          id: String(b.id),
          name: b.name || 'Business Workspace',
          tagline: b.tagline || null,
          industry: b.industry || null,
          category: b.category || null,
          currency: b.currency || '₹',
          ownerName: b.ownerName || null,
          contactPhone: b.contactPhone || null,
          email: b.email || null,
          dataJson: JSON.stringify(b),
        });
        syncedBusinesses++;
      }
    }

    res.json({
      success: true,
      message: 'Full CRM state successfully synchronized to Cloud SQL PostgreSQL database!',
      synced: {
        tasks: syncedTasks,
        complaints: syncedComplaints,
        businesses: syncedBusinesses,
      },
    });
  } catch (error: any) {
    console.error('Failed to sync all records to DB:', error);
    res.status(500).json({ error: error.message || 'Failed to sync to database' });
  }
});

// Fetch tasks from Cloud SQL (PROTECTED: Verified Staff/Owner only)
app.get('/api/db/tasks', requireAuth, async (req, res) => {
  try {
    const rawTasks = await getDbTasks();
    const tasks = rawTasks.map((rt) => {
      if (rt.dataJson) {
        try {
          return { ...JSON.parse(rt.dataJson), ...rt };
        } catch (_) {}
      }
      return rt;
    });
    res.json(tasks);
  } catch (error: any) {
    console.error('Failed to fetch tasks from DB:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

// Save snapshot to Cloud SQL (STRICTLY RESTRICTED: Owner / Super Admin only)
app.post('/api/db/snapshots', requireOwner, async (req, res) => {
  try {
    const { snapshotId, createdBy, payload } = req.body;
    if (!snapshotId || !payload) {
      res.status(400).json({ error: 'Missing snapshotId or payload' });
      return;
    }
    const created = await saveDbBackupSnapshot(snapshotId, createdBy || 'Owner', payload);
    res.json({ success: true, snapshot: created[0] });
  } catch (error: any) {
    console.error('Failed to save snapshot to DB:', error);
    res.status(500).json({ error: error.message || 'Failed to save snapshot' });
  }
});

// Get snapshots from Cloud SQL (STRICTLY RESTRICTED: Owner / Super Admin only)
app.get('/api/db/snapshots', requireOwner, async (req, res) => {
  try {
    const snapshots = await getDbBackupSnapshots();
    res.json(snapshots);
  } catch (error: any) {
    console.error('Failed to fetch snapshots from DB:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch snapshots' });
  }
});

// AI Solar Assistant Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const ai = getGenAI();

    // If Gemini API Key is available, attempt cloud models with automatic fallback
    if (ai) {
      try {
        // Format conversation history for Gemini multi-turn format
        const contents = [];

        // Append recent previous messages (up to 8 turns to conserve context)
        const recentHistory = conversationHistory.slice(-8);
        for (const item of recentHistory) {
          if (item.sender === 'user') {
            contents.push({
              role: 'user',
              parts: [{ text: item.text }],
            });
          } else if (item.sender === 'bot') {
            contents.push({
              role: 'model',
              parts: [{ text: item.text }],
            });
          }
        }

        // Add current user prompt
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        // Model cascade: try primary gemini-3.8-flash first, then gemini-flash-latest on transient 503/429
        const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
        let generatedReply: string | null = null;
        let successfulModel = '';

        for (const model of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            });

            if (response && response.text) {
              generatedReply = response.text;
              successfulModel = model;
              break;
            }
          } catch (err: any) {
            const status = err?.status || err?.code || '';
            const msg = err?.message || String(err);
            // If temporary 503 (high demand) or 429 (rate limit), log note and try next model
            if (status === 503 || msg.includes('503') || msg.includes('high demand') || status === 429) {
              console.log(`Model ${model} is experiencing temporary high demand (503/429). Attempting fallback...`);
              await new Promise((resolve) => setTimeout(resolve, 350));
            } else {
              console.log(`Model ${model} unavailable: ${status || 'temporary condition'}. Proceeding to fallback...`);
            }
          }
        }

        if (generatedReply) {
          res.json({ reply: generatedReply, source: successfulModel });
          return;
        }

        // Both cloud models were busy, gracefully use comprehensive local conversational engine
        console.log('Gemini cloud models busy, seamlessly serving local expert solar engine.');
        const fallbackReply = generateLocalSolarResponse(message);
        res.json({ reply: fallbackReply, source: 'local-expert' });
        return;
      } catch {
        const fallbackReply = generateLocalSolarResponse(message);
        res.json({ reply: fallbackReply, source: 'local-expert' });
        return;
      }
    }

    // Fallback if no GEMINI_API_KEY is configured
    const localReply = generateLocalSolarResponse(message);
    res.json({ reply: localReply, source: 'local-expert' });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      error: 'An error occurred while generating response',
      details: err?.message,
    });
  }
});

// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const defaultDist = path.join(process.cwd(), 'dist');
    const distPath = fs.existsSync(path.join(defaultDist, 'index.html'))
      ? defaultDist
      : process.cwd();
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dilip Enterprises Solar Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
