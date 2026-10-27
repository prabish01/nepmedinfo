import type { Author, Category, EntryRow, Faq, Source, TranslationRow } from "@/lib/types";
import type { EntryType, Locale } from "@/lib/site";
import { countWords } from "@/lib/html";
import { enBodies } from "./content-en";
import { neBodies } from "./content-ne";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const demoAuthors: Author[] = [
  {
    id: id(1),
    slug: "editorial-team",
    name: { en: "Nepal Med Info Editorial Team", ne: "नेपाल मेड इन्फो सम्पादकीय टोली" },
    credentials: null,
    job_title: { en: "Health writers and editors", ne: "स्वास्थ्य लेखक तथा सम्पादक" },
    bio: {
      en: "Our editorial team researches and writes every page from current clinical guidance, then sends it for medical review before publishing.",
      ne: "हाम्रो सम्पादकीय टोलीले हालका चिकित्सकीय निर्देशिकाका आधारमा हरेक पृष्ठ अनुसन्धान गरी लेख्छ र प्रकाशनअघि चिकित्सकीय समीक्षामा पठाउँछ।",
    },
    avatar_url: null,
    avatar_alt: {},
    nmc_number: null,
    same_as: [],
    is_reviewer: false,
  },
];

export const demoCategories: Category[] = [
  { id: id(101), slug: "seasonal-health", name: { en: "Seasonal health", ne: "मौसमी स्वास्थ्य" }, description: { en: "Staying well through the monsoon, winter and festival seasons.", ne: "मनसुन, जाडो र चाडपर्वमा स्वस्थ रहने उपाय।" }, sort: 1 },
  { id: id(102), slug: "nutrition", name: { en: "Nutrition", ne: "पोषण" }, description: { en: "Eating well with everyday Nepali food.", ne: "दैनिक नेपाली खानाबाट राम्रो पोषण।" }, sort: 2 },
  { id: id(103), slug: "mother-and-child", name: { en: "Mother and child", ne: "आमा र बच्चा" }, description: { en: "Pregnancy, newborn care and child health.", ne: "गर्भावस्था, नवजात शिशु स्याहार र बाल स्वास्थ्य।" }, sort: 3 },
  { id: id(104), slug: "mental-health", name: { en: "Mental health", ne: "मानसिक स्वास्थ्य" }, description: { en: "Stress, mood and where to find support.", ne: "तनाव, मनस्थिति र सहयोग कहाँ पाइन्छ।" }, sort: 4 },
  { id: id(105), slug: "living-with-conditions", name: { en: "Living with conditions", ne: "दीर्घ रोगसँग जीवन" }, description: { en: "Managing long-term conditions day to day.", ne: "दीर्घ रोगहरूको दैनिक व्यवस्थापन।" }, sort: 5 },
];

const cat = (slug: string) => demoCategories.find((c) => c.slug === slug)!.id;

const covers = {
  aedes: { url: "/images/aedes.webp", w: 1600, h: 1076, credit: "James Gathany, CDC (public domain)" },
  water: { url: "/images/water-tap.webp", w: 1600, h: 1067, credit: "DFAT, CC BY 4.0, via Wikimedia Commons" },
  checkup: { url: "/images/checkup.webp", w: 1600, h: 1067, credit: "DFAT, CC BY 2.0, via Wikimedia Commons" },
  veg: { url: "/images/vegetables.webp", w: 1600, h: 1067, credit: "Everhard van Eimeren, CC BY-SA 4.0, via Wikimedia Commons" },
  immunisation: { url: "/images/immunisation.webp", w: 1600, h: 1067, credit: "DFAT, CC BY 4.0, via Wikimedia Commons" },
  pharmacist: { url: "/images/pharmacist.webp", w: 1600, h: 1067, credit: "DFAT, CC BY 4.0, via Wikimedia Commons" },
};

type Tr = Partial<TranslationRow> & Pick<TranslationRow, "title" | "excerpt" | "body_html">;

type DemoSpec = {
  n: number;
  type: EntryType;
  slug: string;
  category?: string;
  cover?: keyof typeof covers;
  featured?: boolean;
  published: string;
  reviewed?: string;
  sources?: Source[];
  tr: Partial<Record<Locale, Tr>>;
};

const WHO = (path: string, title: string): Source => ({ title, url: `https://www.who.int/news-room/fact-sheets/detail/${path}`, publisher: "World Health Organization" });

const specs: DemoSpec[] = [
  {
    n: 201, type: "disease", slug: "dengue", cover: "aedes", featured: true, published: "2026-08-02T06:00:00Z", reviewed: "2026-08-01",
    sources: [WHO("dengue-and-severe-dengue", "Dengue and severe dengue"), { title: "Epidemiology and Disease Control Division", url: "https://edcd.gov.np/", publisher: "Government of Nepal" }],
    tr: {
      en: {
        title: "Dengue", excerpt: "Dengue is a mosquito-borne viral fever that now affects much of Nepal. Learn the symptoms, the warning signs of severe dengue, safe treatment at home and how to prevent it.",
        body_html: enBodies.dengue, also_known_as: ["Dengue fever", "Breakbone fever"],
        key_points: ["Spread by Aedes mosquitoes that bite during the day.", "Use paracetamol for fever. Avoid ibuprofen and aspirin.", "Watch closely in the days after the fever drops.", "Empty standing water around your home every week."],
        faqs: [
          { q: "Can dengue spread from one person to another?", a: "No. Dengue spreads only through the bite of an infected mosquito, not by touch, coughing or sharing food." },
          { q: "Should I eat papaya leaves for dengue?", a: "There is not enough evidence that papaya leaf raises platelets safely. Focus on fluids, rest and medical follow-up." },
          { q: "Can you get dengue more than once?", a: "Yes. There are four types of dengue virus. A second infection with a different type carries a higher risk of severe dengue." },
        ],
        meta_title: "Dengue in Nepal: Symptoms, Warning Signs and Treatment", meta_description: "Dengue symptoms to watch for, the warning signs of severe dengue, safe care at home and how families in Nepal can stop mosquitoes breeding.", focus_keyword: "dengue",
        cover_alt: "Close-up of an Aedes aegypti mosquito feeding on human skin",
      },
      ne: {
        title: "डेंगु", excerpt: "डेंगु लामखुट्टेबाट सर्ने भाइरल ज्वरो हो जुन अहिले नेपालका धेरै भागमा फैलिएको छ। यसका लक्षण, गम्भीर डेंगुका संकेत, घरमै सुरक्षित उपचार र रोकथामका उपाय जान्नुहोस्।",
        body_html: neBodies.dengue, also_known_as: ["डेंगी", "हड्डी भाँचिने ज्वरो"],
        key_points: ["दिउँसो टोक्ने एडिस लामखुट्टेबाट सर्छ।", "ज्वरोका लागि सिटामोल खानुहोस्। आइबुप्रोफेन र एस्पिरिन नखानुहोस्।", "ज्वरो घटेपछिका दिनमा राम्ररी निगरानी गर्नुहोस्।", "घरवरिपरि जमेको पानी हरेक हप्ता खाली गर्नुहोस्।"],
        faqs: [
          { q: "के डेंगु एक व्यक्तिबाट अर्कोमा सर्छ?", a: "सर्दैन। डेंगु संक्रमित लामखुट्टेको टोकाइबाट मात्र सर्छ, छुँदा, खोक्दा वा खाना बाँड्दा सर्दैन।" },
          { q: "डेंगुमा मेवाको पात खानुपर्छ?", a: "मेवाको पातले सुरक्षित रूपमा प्लेटलेट बढाउँछ भन्ने पर्याप्त प्रमाण छैन। झोल पदार्थ, आराम र स्वास्थ्य जाँचमा ध्यान दिनुहोस्।" },
          { q: "डेंगु एकभन्दा बढी पटक लाग्न सक्छ?", a: "सक्छ। डेंगु भाइरसका चार प्रकार छन्। फरक प्रकारबाट दोस्रो पटक संक्रमण हुँदा गम्भीर डेंगुको जोखिम बढी हुन्छ।" },
        ],
        meta_title: "नेपालमा डेंगु: लक्षण, खतराका संकेत र उपचार", meta_description: "डेंगुका लक्षण, गम्भीर डेंगुका संकेत, घरमै सुरक्षित स्याहार र नेपाली परिवारका लागि रोकथामका उपाय।", focus_keyword: "डेंगु",
        cover_alt: "मानिसको छालामा रगत चुस्दै गरेको एडिस इजिप्टाई लामखुट्टे",
      },
    },
  },
  {
    n: 202, type: "disease", slug: "typhoid-fever", cover: "water", published: "2026-07-18T06:00:00Z", reviewed: "2026-07-15",
    sources: [WHO("typhoid", "Typhoid")],
    tr: {
      en: {
        title: "Typhoid fever", excerpt: "Typhoid is a bacterial infection spread through contaminated food and water. Learn the symptoms, how it is diagnosed, why the full antibiotic course matters, and how to prevent it.",
        body_html: enBodies.typhoid, also_known_as: ["Enteric fever", "Typhoid"],
        key_points: ["Spread through contaminated food and water.", "Blood culture is more reliable than the Widal test.", "Finish the full course of antibiotics.", "A typhoid vaccine is part of Nepal's immunisation programme."],
        meta_title: "Typhoid Fever: Symptoms, Tests and Treatment in Nepal", meta_description: "Typhoid (enteric fever) symptoms, which tests are reliable, why the full antibiotic course matters, and prevention through safe water and vaccines.", focus_keyword: "typhoid",
        cover_alt: "A boy in Nepal drinking clean water from an outdoor tap",
      },
    },
  },
  {
    n: 203, type: "disease", slug: "high-blood-pressure", cover: "checkup", featured: true, published: "2026-09-05T06:00:00Z", reviewed: "2026-09-01",
    sources: [WHO("hypertension", "Hypertension"), WHO("salt-reduction", "Salt reduction")],
    tr: {
      en: {
        title: "High blood pressure (hypertension)", excerpt: "High blood pressure rarely causes symptoms but raises the risk of stroke, heart attack and kidney disease. Understand your reading and how to bring it down.",
        body_html: enBodies.hypertension, also_known_as: ["Hypertension", "High BP", "Pressure"],
        key_points: ["Usually causes no symptoms. Get it checked.", "140/90 or above on repeated checks is high.", "Keep salt under 5 g a day, about one teaspoon.", "Take prescribed medicine every day, even when well."],
        faqs: [{ q: "How often should I check my blood pressure?", a: "Adults should have it checked at least once a year, and more often if it has been high before or a health worker advises it." }],
        meta_title: "High Blood Pressure: Readings, Risks and Treatment", meta_description: "What blood pressure numbers mean, why hypertension is called silent, and practical ways to lower it, including salt, activity and medicine.", focus_keyword: "high blood pressure",
        cover_alt: "A health worker in Pokhara measuring a woman's blood pressure while she holds her child",
      },
      ne: {
        title: "उच्च रक्तचाप", excerpt: "उच्च रक्तचापले प्रायः लक्षण देखाउँदैन, तर पक्षाघात, हृदयाघात र मिर्गौला रोगको जोखिम बढाउँछ। आफ्नो नाप बुझ्नुहोस् र यसलाई घटाउने उपाय जान्नुहोस्।",
        body_html: neBodies.hypertension, also_known_as: ["हाइपरटेन्सन", "प्रेसर", "ब्लड प्रेसर"],
        key_points: ["प्रायः कुनै लक्षण हुँदैन। नियमित जाँच गराउनुहोस्।", "बारम्बार जाँच्दा १४०/९० वा बढी भए उच्च हो।", "दिनमा ५ ग्रामभन्दा कम नुन, करिब एक चिया चम्चा।", "सन्चो भए पनि तोकिएको औषधि हरेक दिन खानुहोस्।"],
        faqs: [{ q: "रक्तचाप कति पटक जाँच गर्नुपर्छ?", a: "वयस्कले वर्षमा कम्तीमा एक पटक जाँच गराउनुपर्छ। पहिले बढी देखिएको छ वा स्वास्थ्यकर्मीले भनेका छन् भने अझ धेरै पटक।" }],
        meta_title: "उच्च रक्तचाप: नाप, जोखिम र उपचार", meta_description: "रक्तचापको नापको अर्थ, उच्च रक्तचापलाई किन मौन रोग भनिन्छ, र नुन, व्यायाम तथा औषधिबाट यसलाई घटाउने व्यावहारिक उपाय।", focus_keyword: "उच्च रक्तचाप",
        cover_alt: "पोखरामा स्वास्थ्यकर्मीले बच्चा बोकेकी महिलाको रक्तचाप नाप्दै",
      },
    },
  },
  {
    n: 204, type: "disease", slug: "type-2-diabetes", published: "2026-06-20T06:00:00Z", reviewed: "2026-06-18",
    sources: [WHO("diabetes", "Diabetes")],
    tr: {
      en: {
        title: "Type 2 diabetes", excerpt: "Type 2 diabetes keeps blood sugar too high. Learn the symptoms, how it is diagnosed, and the daily habits that keep it under control.",
        body_html: enBodies.diabetes, also_known_as: ["Diabetes", "Sugar", "Diabetes mellitus"],
        meta_title: "Type 2 Diabetes: Symptoms, Diagnosis and Daily Care", meta_description: "Signs of type 2 diabetes, the blood tests used to diagnose it, and everyday steps to manage blood sugar in Nepal.", focus_keyword: "type 2 diabetes",
      },
    },
  },
  {
    n: 205, type: "disease", slug: "tuberculosis", published: "2026-05-11T06:00:00Z", reviewed: "2026-05-10",
    sources: [WHO("tuberculosis", "Tuberculosis"), { title: "National Tuberculosis Control Center", url: "https://nepalntp.gov.np/", publisher: "Government of Nepal" }],
    tr: {
      en: {
        title: "Tuberculosis (TB)", excerpt: "TB is a curable bacterial infection, usually of the lungs. Diagnosis and treatment are free in Nepal. Learn the symptoms and why every dose matters.",
        body_html: enBodies.tuberculosis, also_known_as: ["TB", "Tuberculosis", "Kshayarog"],
        meta_title: "Tuberculosis (TB): Symptoms, Free Testing and Treatment", meta_description: "TB symptoms, free testing and six-month treatment through Nepal's National Tuberculosis Programme, and how to protect your family.", focus_keyword: "tuberculosis",
      },
    },
  },
  {
    n: 206, type: "disease", slug: "acute-mountain-sickness", published: "2026-04-02T06:00:00Z", reviewed: "2026-04-01",
    sources: [{ title: "Wilderness Medical Society Clinical Practice Guidelines for the Prevention and Treatment of Acute Altitude Illness", url: "https://wms.org/", publisher: "Wilderness Medical Society" }],
    tr: {
      en: {
        title: "Acute mountain sickness (altitude sickness)", excerpt: "Altitude sickness can affect any trekker above 2,500 m. Know the symptoms, the danger signs of HACE and HAPE, and the ascent rules that prevent it.",
        body_html: enBodies.ams, also_known_as: ["Altitude sickness", "AMS", "HACE", "HAPE"],
        key_points: ["Can affect anyone above about 2,500 m.", "Never go higher with symptoms.", "Confusion or breathlessness at rest means descend now."],
        meta_title: "Altitude Sickness in Nepal: Symptoms, Danger Signs, Prevention", meta_description: "Acute mountain sickness on Nepal treks: early symptoms, HACE and HAPE danger signs, safe ascent rates and when to descend.", focus_keyword: "altitude sickness",
      },
    },
  },
  {
    n: 301, type: "drug", slug: "paracetamol", cover: "pharmacist", published: "2026-08-20T06:00:00Z", reviewed: "2026-08-18",
    sources: [{ title: "WHO Model List of Essential Medicines", url: "https://www.who.int/groups/expert-committee-on-selection-and-use-of-essential-medicines/essential-medicines-lists", publisher: "World Health Organization" }],
    tr: {
      en: {
        title: "Paracetamol", excerpt: "Paracetamol treats pain and fever. Learn the usual adult dose, the 4 g daily limit, children's dosing and how to avoid accidental overdose.",
        body_html: enBodies.paracetamol, also_known_as: ["Acetaminophen", "Cetamol"],
        key_points: ["Adults: no more than 4 g in 24 hours.", "Check cold remedies for hidden paracetamol.", "Overdose can damage the liver without early symptoms."],
        meta_title: "Paracetamol: Uses, Dose, Side Effects and Safety", meta_description: "How to take paracetamol safely for pain and fever: adult and child dosing, the daily maximum, and overdose warning signs.", focus_keyword: "paracetamol",
        cover_alt: "A pharmacist at a Pokhara health post choosing tablets from labelled medicine boxes",
      },
      ne: {
        title: "सिटामोल (पारासिटामोल)", excerpt: "सिटामोलले दुखाइ र ज्वरो कम गर्छ। वयस्कको सामान्य मात्रा, दैनिक ४ ग्रामको सीमा, बालबालिकाको मात्रा र धेरै खानबाट कसरी बच्ने भन्ने जान्नुहोस्।",
        body_html: neBodies.paracetamol, also_known_as: ["पारासिटामोल", "एसिटामिनोफेन"],
        key_points: ["वयस्कले २४ घण्टामा ४ ग्रामभन्दा बढी नखाने।", "रुघाखोकीका औषधिमा लुकेको सिटामोल जाँच गर्नुहोस्।", "धेरै खाँदा सुरुमा लक्षण नदेखाई कलेजो बिग्रन सक्छ।"],
        meta_title: "सिटामोल: प्रयोग, मात्रा, असर र सुरक्षा", meta_description: "दुखाइ र ज्वरोमा सिटामोल सुरक्षित रूपमा कसरी खाने: वयस्क र बालबालिकाको मात्रा, दैनिक सीमा र धेरै खाँदाका संकेत।", focus_keyword: "सिटामोल",
        cover_alt: "पोखराको स्वास्थ्य चौकीमा फार्मासिस्टले औषधिको बाकसबाट चक्की छान्दै",
      },
    },
  },
  {
    n: 302, type: "drug", slug: "oral-rehydration-salts", published: "2026-07-02T06:00:00Z", reviewed: "2026-07-01",
    sources: [{ title: "The treatment of diarrhoea: a manual for physicians and other senior health workers", url: "https://www.who.int/publications/i/item/9241593180", publisher: "World Health Organization" }],
    tr: {
      en: {
        title: "Oral rehydration salts (ORS, Jeevan Jal)", excerpt: "ORS replaces water and salts lost in diarrhoea. Learn how to mix Jeevan Jal correctly, how much to give, and the signs that need urgent care.",
        body_html: enBodies.ors, also_known_as: ["Jeevan Jal", "ORS", "Oral rehydration solution"],
        meta_title: "ORS (Jeevan Jal): How to Mix and Use It Correctly", meta_description: "Step-by-step guide to mixing ORS with 1 litre of clean water, how much to give in diarrhoea, and danger signs of dehydration.", focus_keyword: "ORS",
      },
    },
  },
  {
    n: 303, type: "drug", slug: "iron-and-folic-acid", published: "2026-06-04T06:00:00Z", reviewed: "2026-06-01",
    sources: [{ title: "Daily iron and folic acid supplementation during pregnancy", url: "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy", publisher: "World Health Organization" }],
    tr: {
      en: {
        title: "Iron and folic acid", excerpt: "Iron and folic acid tablets prevent anaemia and protect babies in pregnancy. Learn how to take them for best absorption and what side effects are normal.",
        body_html: enBodies.ironFolic, also_known_as: ["IFA", "Iron tablets", "Folic acid"],
        meta_title: "Iron and Folic Acid Tablets: Uses, How to Take, Side Effects", meta_description: "Why iron and folic acid matter in pregnancy and anaemia, how to take them with food, and which side effects are normal.", focus_keyword: "iron and folic acid",
      },
    },
  },
  {
    n: 304, type: "drug", slug: "zinc-for-diarrhoea", published: "2026-05-28T06:00:00Z", reviewed: "2026-05-25",
    sources: [{ title: "Zinc supplementation in the management of diarrhoea", url: "https://www.who.int/tools/elena/interventions/zinc-diarrhoea", publisher: "World Health Organization" }],
    tr: {
      en: {
        title: "Zinc for diarrhoea in children", excerpt: "Zinc given with ORS shortens diarrhoea in children and helps prevent the next episode. See the dose by age and how to give it.",
        body_html: enBodies.zinc, also_known_as: ["Zinc sulfate", "Zinc tablets"],
        meta_title: "Zinc for Childhood Diarrhoea: Dose by Age and How to Give It", meta_description: "Zinc dose for children with diarrhoea by age, how long to give it, and how it works alongside ORS.", focus_keyword: "zinc for diarrhoea",
      },
    },
  },
  {
    n: 401, type: "article", slug: "monsoon-health-nepal", category: "seasonal-health", cover: "water", featured: true, published: "2026-09-12T06:00:00Z", reviewed: "2026-09-10",
    sources: [WHO("drinking-water", "Drinking-water"), WHO("snakebite-envenoming", "Snakebite envenoming")],
    tr: {
      en: {
        title: "Monsoon health in Nepal: protecting your family from water and mosquito-borne illness", excerpt: "From June to September, cases of diarrhoea, typhoid, dengue and snakebite rise across Nepal. Five habits that prevent most of them.",
        body_html: enBodies.monsoon,
        meta_title: "Monsoon Health in Nepal: How to Protect Your Family", meta_description: "Practical monsoon health tips for Nepal: safe drinking water, handwashing, stopping dengue mosquitoes, snakebite first aid and dehydration signs.", focus_keyword: "monsoon health",
        cover_alt: "A boy cupping his hands under a village water tap in Nepal",
      },
      ne: {
        title: "मनसुनमा स्वास्थ्य: पानी र लामखुट्टेबाट सर्ने रोगबाट परिवारलाई कसरी जोगाउने", excerpt: "असारदेखि असोजसम्म नेपालभर झाडापखाला, टाइफाइड, डेंगु र सर्पदंश बढ्छ। धेरैजसो रोकथाम गर्ने पाँच बानी।",
        body_html: neBodies.monsoon,
        meta_title: "मनसुनमा स्वास्थ्य: परिवारलाई रोगबाट कसरी जोगाउने", meta_description: "नेपालमा मनसुनका लागि स्वास्थ्य सुझाव: सुरक्षित पानी, हात धुने बानी, डेंगु लामखुट्टे नियन्त्रण, सर्पदंशको प्राथमिक उपचार र जलवियोजनका संकेत।", focus_keyword: "मनसुन",
        cover_alt: "नेपालको गाउँमा धाराबाट हत्केलामा पानी थाप्दै गरेको बालक",
      },
    },
  },
  {
    n: 402, type: "article", slug: "nepali-diet-for-diabetes", category: "nutrition", cover: "veg", published: "2026-08-28T06:00:00Z", reviewed: "2026-08-25",
    sources: [WHO("healthy-diet", "Healthy diet")],
    tr: {
      en: {
        title: "Eating dal bhat with diabetes: a practical guide to the Nepali plate", excerpt: "You do not have to give up dal bhat. Change the balance of the plate, what you drink, and how you handle festival food.",
        body_html: enBodies.bloodSugarDiet,
        meta_title: "Nepali Diet for Diabetes: Eating Dal Bhat the Smart Way", meta_description: "A practical diabetes diet guide built around dal bhat: the plate method, sweet tea, festival food and walking after meals.", focus_keyword: "diet for diabetes",
        cover_alt: "A vegetable seller in Asan Bazaar, Kathmandu, with baskets of potatoes, onions, garlic and ginger",
      },
    },
  },
  {
    n: 403, type: "article", slug: "baby-vaccinations-nepal", category: "mother-and-child", cover: "immunisation", published: "2026-07-25T06:00:00Z", reviewed: "2026-07-22",
    sources: [{ title: "Family Welfare Division, Immunization Section", url: "https://fwd.gov.np/", publisher: "Government of Nepal" }, WHO("immunization-coverage", "Immunization coverage")],
    tr: {
      en: {
        title: "Getting ready for your baby's vaccinations in Nepal", excerpt: "All routine childhood vaccines are free in Nepal. What to bring, what is normal afterwards, and the rare signs that need a health worker.",
        body_html: enBodies.vaccines,
        meta_title: "Baby Vaccinations in Nepal: What Parents Need to Know", meta_description: "A parent's guide to free childhood vaccines in Nepal: the child health card, normal reactions, warning signs and catching up on missed doses.", focus_keyword: "baby vaccinations",
        cover_alt: "A nurse giving oral drops to a baby held by its mother at an immunisation clinic in Pokhara",
      },
    },
  },
];

function translation(locale: Locale, slug: string, tr: Tr): TranslationRow {
  return {
    locale,
    slug,
    key_points: [],
    faqs: [] as Faq[],
    sources: [],
    also_known_as: [],
    meta_title: null,
    meta_description: null,
    focus_keyword: null,
    og_title: null,
    og_description: null,
    og_image_url: null,
    cover_alt: null,
    canonical_url: null,
    noindex: false,
    is_ready: true,
    ...tr,
    body_html: tr.body_html.trim(),
    word_count: countWords(tr.body_html),
  };
}

export type DemoEntry = EntryRow & { translations: TranslationRow[] };

export const demoEntries: DemoEntry[] = specs.map((s) => {
  const cover = s.cover ? covers[s.cover] : null;
  return {
    id: id(s.n),
    type: s.type,
    status: "published",
    category_id: s.category ? cat(s.category) : null,
    author_id: demoAuthors[0].id,
    reviewer_id: null,
    cover_url: cover?.url ?? null,
    cover_width: cover?.w ?? null,
    cover_height: cover?.h ?? null,
    cover_credit: cover?.credit ?? null,
    featured: Boolean(s.featured),
    published_at: s.published,
    reviewed_at: s.reviewed ?? null,
    created_at: s.published,
    updated_at: s.published,
    translations: (Object.entries(s.tr) as [Locale, Tr][]).map(([locale, tr]) =>
      translation(locale, s.slug, { ...tr, sources: tr.sources ?? s.sources ?? [] }),
    ),
  };
});
