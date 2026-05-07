export interface ElectionData {
  id: string;
  title: string;
  state: string;
  type: 'state' | 'central';
  year: number;
  results: { party: string; seats: number; votes: number }[];
  summary: string;
  date: string;
  status: 'official' | 'preliminary' | 'projected';
}

export interface EconomicMetric {
  id: string;
  category: 'stock' | 'good';
  itemName: string;
  price: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  relatedElectionId?: string;
  history?: { day: string; value: number }[];
}

export interface VerifiedUpdate {
  id: string;
  timestamp: string;
  content: string;
  source: string;
  isVerified: boolean;
}

export const MOCK_ELECTIONS: ElectionData[] = [
  {
    id: 'tn-2026',
    title: 'Tamil Nadu Assembly Election 2026',
    state: 'Tamil Nadu',
    type: 'state',
    year: 2026,
    date: '2026-05-02',
    status: 'projected',
    results: [
      { party: 'TVK+', seats: 108, votes: 42.5 },
      { party: 'DMK+', seats: 66, votes: 31.8 },
      { party: 'AIADMK+', seats: 47, votes: 19.2 },
      { party: 'Others', seats: 13, votes: 6.5 }
    ],
    summary: 'A historic hung assembly as the debutant TVK emerged as the single largest party, fundamentally disrupting the state\'s traditional bipolar politics.'
  },
  {
    id: 'wb-2026',
    title: 'West Bengal Assembly Election 2026',
    state: 'West Bengal',
    type: 'state',
    year: 2026,
    date: '2026-05-02',
    status: 'projected',
    results: [
      { party: 'BJP', seats: 206, votes: 46.5 },
      { party: 'AITC', seats: 81, votes: 38.2 },
      { party: 'INC', seats: 2, votes: 8.5 },
      { party: 'Others', seats: 5, votes: 6.8 }
    ],
    summary: 'A landmark victory for the BJP, forming government in West Bengal for the first time with a decisive majority, ending over a decade of TMC governance.'
  },
  {
    id: 'central-2024',
    title: 'General Election 2024',
    state: 'National',
    type: 'central',
    year: 2024,
    date: '2024-06-04',
    status: 'official',
    results: [
      { party: 'NDA', seats: 293, votes: 44.8 },
      { party: 'INDIA', seats: 234, votes: 40.6 },
      { party: 'Others', seats: 16, votes: 14.6 }
    ],
    summary: 'The NDA secured a strategic third term, though the INDIA bloc showed significant resurgence compared to previous cycles.'
  },
  {
    id: 'central-2019',
    title: 'General Election 2019',
    state: 'National',
    type: 'central',
    year: 2019,
    date: '2019-05-23',
    status: 'official',
    results: [
      { party: 'NDA', seats: 353, votes: 45.0 },
      { party: 'UPA+', seats: 91, votes: 26.5 },
      { party: 'Others', seats: 98, votes: 28.5 }
    ],
    summary: 'A historic "Pro-Incumbency" wave where the BJP independently crossed the 300-seat mark, a feat last achieved in 1984.'
  },
  {
    id: 'central-2014',
    title: 'General Election 2014',
    state: 'National',
    type: 'central',
    year: 2014,
    date: '2014-05-16',
    status: 'official',
    results: [
      { party: 'NDA', seats: 336, votes: 38.5 },
      { party: 'UPA', seats: 60, votes: 23.0 },
      { party: 'Others', seats: 147, votes: 38.5 }
    ],
    summary: 'A landmark shift in Indian politics, marking the first time a non-Congress party won a full majority on its own.'
  },
  {
    id: 'up-2022',
    title: 'Uttar Pradesh Assembly Election 2022',
    state: 'Uttar Pradesh',
    type: 'state',
    year: 2022,
    date: '2022-03-10',
    status: 'official',
    results: [
      { party: 'BJP+', seats: 273, votes: 41.3 },
      { party: 'SP+', seats: 125, votes: 32.1 },
      { party: 'BSP', seats: 1, votes: 12.9 }
    ],
    summary: 'The BJP became the first party in 37 years to return to power for a second consecutive term in UP with a full majority.'
  },
  {
    id: 'tn-2021',
    title: 'Tamil Nadu Assembly Election 2021',
    state: 'Tamil Nadu',
    type: 'state',
    year: 2021,
    date: '2021-05-02',
    status: 'official',
    results: [
      { party: 'DMK+', seats: 159, votes: 45.3 },
      { party: 'AIADMK+', seats: 75, votes: 39.7 },
      { party: 'Others', seats: 0, votes: 15.0 }
    ],
    summary: 'DMK returned to power after a decade with a convincing victory under M.K. Stalin.'
  },
  {
    id: 'wb-2021',
    title: 'West Bengal Assembly Election 2021',
    state: 'West Bengal',
    type: 'state',
    year: 2021,
    date: '2021-05-02',
    status: 'official',
    results: [
      { party: 'AITC', seats: 215, votes: 47.9 },
      { party: 'BJP', seats: 77, votes: 38.1 },
      { party: 'Others', seats: 2, votes: 14.0 }
    ],
    summary: 'TMC secured a massive third term despite a high-voltage campaign by the BJP, which emerged as the primary opposition.'
  }
];

const generateHistory = (base: number) => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: `D-${6-i}`,
    value: base * (1 + (Math.random() * 0.05 - 0.025))
  }));
};

export const MOCK_ECONOMICS: EconomicMetric[] = [
  { id: 'nifty-1', category: 'stock', itemName: 'NIFTY 50', price: 22450.5, change: 1.25, trend: 'up', relatedElectionId: 'central-2024', history: generateHistory(22450) },
  { id: 'reliance-1', category: 'stock', itemName: 'Reliance Ind.', price: 2980.0, change: -0.45, trend: 'down', history: generateHistory(2980) },
  { id: 'tcs-1', category: 'stock', itemName: 'TCS', price: 3850.20, change: 0.85, trend: 'up', history: generateHistory(3850) },
  { id: 'fuel-1', category: 'good', itemName: 'Petrol (Delhi)', price: 94.72, change: 0.15, trend: 'up', history: generateHistory(94) },
  { id: 'diesel-1', category: 'good', itemName: 'Diesel (Delhi)', price: 87.62, change: 0.0, trend: 'stable', history: generateHistory(87) },
  { id: 'gas-1', category: 'good', itemName: 'LPG (14.2kg)', price: 803.0, change: -10.0, trend: 'down', history: generateHistory(803) },
  { id: 'wheat-1', category: 'good', itemName: 'Wheat (Avg)', price: 32.5, change: 0.05, trend: 'up', history: generateHistory(32) },
  { id: 'milk-1', category: 'good', itemName: 'Milk (1L)', price: 62.0, change: 0.0, trend: 'stable', history: generateHistory(62) },
  { id: 'onion-1', category: 'good', itemName: 'Onion (Kg)', price: 45.0, change: 5.5, trend: 'up', history: generateHistory(45) },
  { id: 'tomato-1', category: 'good', itemName: 'Tomato (Kg)', price: 38.0, change: -2.0, trend: 'down', history: generateHistory(38) },
  { id: 'potato-1', category: 'good', itemName: 'Potato (Kg)', price: 28.0, change: 12.4, trend: 'up', history: generateHistory(25) },
  { id: 'gold-1', category: 'good', itemName: 'Gold (24K/10g)', price: 72450.0, change: 1.1, trend: 'up', history: generateHistory(72450) }
];

export const MOCK_UPDATES: VerifiedUpdate[] = [
  { id: 'u5', timestamp: new Date().toISOString(), content: 'Market Analysis: RBI expects GDP growth to remain resilient following General Election results.', source: 'RBI Annual Report', isVerified: true },
  { id: 'u6', timestamp: new Date(Date.now() - 1800000).toISOString(), content: 'Historical Data Audit: Corrected parliamentary seat distribution for 2024 cycle verified by official records.', source: 'PIB Data Unit', isVerified: true },
  { id: 'u1', timestamp: new Date(Date.now() - 3600000).toISOString(), content: 'Reserve Bank of India maintains interest rates as volatility index drops following peaceful polling.', source: 'RBI', isVerified: true },
  { id: 'u2', timestamp: new Date(Date.now() - 7200000).toISOString(), content: 'Market analysts predict stability following recent poll results.', source: 'Reuters', isVerified: true },
  { id: 'u3', timestamp: new Date(Date.now() - 10800000).toISOString(), content: 'Post-election cabinet meetings discuss new economic subsidies for rural youth.', source: 'PIB India', isVerified: true }
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    dashboard: "Dashboard",
    dataCentric: "Data-Centric",
    simplifiedView: "Simplified View",
    verified: "Verified: Hourly Sync",
    equitySentiment: "Equity Sentiment",
    bullish: "BULLISH",
    bearish: "BEARISH",
    searchAssets: "SEARCH ASSETS OR TICKERS...",
    commodityIndex: "Commodity Index",
    volatilityGuard: "Volatility Guard",
    threshold: "Threshold",
    criticalDrift: "Critical Drift",
    noAnomalies: "No anomalies detected in current cycle",
    sentimentDynamics: "Sentiment Dynamics",
    yearFilter: "Year Filter",
    comparisonMode: "Comparison Mode",
    active: "ACTIVE",
    inactive: "INACTIVE",
    comparativeMetrics: "Comparative Metrics",
    correlationDelta: "Correlation Delta",
    comparisonInsight: "Comparison Insight",
    strategicInsights: "Strategic Insights",
    verifiedFlow: "Verified Flow",
    liveIntelligence: "Live Intelligence Feed",
    electionBasics: "Election Basics",
    essentialPricing: "Essential Pricing",
    officialVerification: "Official Verification",
    electoralRegistry: "Electoral Registry",
    historicalArchive: "Comprehensive Historical Archive",
    allYears: "All Years",
    allStates: "All States",
    navigation: "Navigation",
    access: "Access",
    subscribeBriefing: "Subscribe to our weekly high-conviction briefing.",
    emailPlaceholder: "EMAIL@INSTITUTION.COM",
    systemStatus: "System Status: Nominal",
    marketVolatility: "Market Volatility",
    verifiedNodes: "Verified Nodes",
    activeNodes: "Active",
    mission: "Excellence in political transparency and economic forecasting for the modern institutional viewer.",
    commodityVolatility: "Commodity Volatility Scatter",
    priceVsChange: "Price vs Change interaction matrix",
    auditedReport: "Audited Report: 2026-Q2",
    liveCorrelation: "Live Correlation Analysis",
    impactIndicators: "Impact Indicators",
    hourlyVerifications: "Hourly Verifications",
    realTimeVerification: "Real-time Verification",
    secureData: "SECURE DATA",
    comparativeMetrics: "Comparative Metrics",
    sideBySide: "Side-by-side electoral performance assessment",
    comparativeSwing: "Comparative Swing",
    consumerBasket: "Consumer Basket",
    totalSeats: "Total Seats",
    leadParty: "Lead Party",
    noAssets: "No matching assets identified",
    selectAsset: "Select an asset for deep intelligence",
    priceRise: "Price Rise ↑",
    costDrop: "Cost Drop ↓",
    unchanged: "Unchanged",
    exclusiveAccess: "Exclusive Access",
    stable: "Stable",
    marketIndex: "Index",
    electionCycles: "Election Cycles",
    economicIndicators: "Economic Indicators",
    verificationLogs: "Verification Logs",
    privacy: "Institutional Privacy",
    terms: "Terms of Engagement",
    allRights: "All Rights Reserved",
    sentimentPulse: "Sentiment Pulse"
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    dataCentric: "डेटा-केंद्रित",
    simplifiedView: "सरलीकृत दृश्य",
    verified: "सत्यापित: प्रति घंटा सिंक",
    equitySentiment: "इक्विटी भावना",
    bullish: "तेजी",
    bearish: "मंदी",
    searchAssets: "संपत्ति या टिकर खोजें...",
    commodityIndex: "वस्तु सूचकांक",
    volatilityGuard: "अस्थिरता गार्ड",
    threshold: "थ्रेसहोल्ड",
    criticalDrift: "महत्वपूर्ण बहाव",
    noAnomalies: "वर्तमान चक्र में कोई विसंगति नहीं मिली",
    sentimentDynamics: "भावना गतिशीलता",
    yearFilter: "वर्ष फ़िल्टर",
    comparisonMode: "तुलना मोड",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    comparativeMetrics: "तुलनात्मक मेट्रिक्स",
    correlationDelta: "सहसंबंध डेल्टा",
    comparisonInsight: "तुलना अंतर्दृष्टि",
    strategicInsights: "रणनीतिक अंतर्दृष्टि",
    verifiedFlow: "सत्यापित प्रवाह",
    liveIntelligence: "लाइव इंटेलिजेंस फीड",
    electionBasics: "चुनाव बुनियादी बातें",
    essentialPricing: "आवश्यक मूल्य निर्धारण",
    officialVerification: "आधिकारिक सत्यापन",
    electoralRegistry: "चुनावी रजिस्ट्री",
    historicalArchive: "व्यापक ऐतिहासिक संग्रह",
    allYears: "सभी वर्ष",
    allStates: "सभी राज्य",
    navigation: "नेविगेशन",
    access: "पहुंच",
    subscribeBriefing: "हमारे साप्ताहिक उच्च-दृढ़ता ब्रीफिंग की सदस्यता लें।",
    emailPlaceholder: "EMAIL@INSTITUTION.COM",
    systemStatus: "सिस्टम स्थिति: नाममात्र",
    marketVolatility: "बाजार अस्थिरता",
    verifiedNodes: "सत्यापित नोड्स",
    activeNodes: "सक्रिय",
    mission: "आधुनिक संस्थागत दर्शकों के लिए राजनीतिक पारदर्शिता और आर्थिक पूर्वानुमान में उत्कृष्टता।",
    commodityVolatility: "कमोडिटी अस्थिरता स्कैटर",
    priceVsChange: "मूल्य बनाम परिवर्तन इंटरेक्शन मैट्रिक्स",
    auditedReport: "ऑडिट रिपोर्ट: 2026-Q2",
    liveCorrelation: "लाइव सहसंबंध विश्लेषण",
    impactIndicators: "प्रभाव संकेतक",
    hourlyVerifications: "प्रति घंटा सत्यापन",
    realTimeVerification: "वास्तविक समय सत्यापन",
    secureData: "सुरक्षित डेटा",
    sideBySide: "अगल-बगल चुनावी प्रदर्शन मूल्यांकन",
    comparativeSwing: "तुलनात्मक स्विंग",
    consumerBasket: "उपभोक्ता टोकरी",
    totalSeats: "कुल सीटें",
    leadParty: "प्रमुख पार्टी",
    noAssets: "कोई मेल खाने वाली संपत्ति नहीं मिली",
    selectAsset: "गहन बुद्धिमत्ता के लिए एक संपत्ति चुनें",
    priceRise: "मूलय वृद्धि ↑",
    costDrop: "लागत में गिरावट ↓",
    unchanged: "अपरिवर्तित",
    exclusiveAccess: "अनन्य पहुंच",
    stable: "स्थिर",
    marketIndex: "सूचकांक",
    electionCycles: "चुनाव चक्र",
    economicIndicators: "आर्थिक संकेतक",
    verificationLogs: "सत्यापन लॉग",
    privacy: "संस्थागत गोपनीयता",
    terms: "जुड़ाव की शर्तें",
    allRights: "सर्वाधिकार सुरक्षित",
    sentimentPulse: "भावना पल्स"
  },
  Spanish: {
    dashboard: "Panel",
    dataCentric: "Centrado en datos",
    simplifiedView: "Vista simplificada",
    verified: "Verificado: Sincronización horaria",
    equitySentiment: "Sentimiento de renta variable",
    bullish: "ALCISTA",
    bearish: "BAJISTA",
    searchAssets: "BUSCAR ACTIVOS...",
    commodityIndex: "Índice de materias primas",
    volatilityGuard: "Guardia de volatilidad",
    threshold: "Umbral",
    criticalDrift: "Desviación crítica",
    noAnomalies: "No se detectaron anomalías",
    sentimentDynamics: "Dinámica de sentimientos",
    yearFilter: "Filtro de año",
    comparisonMode: "Modo de comparación",
    active: "ACTIVO",
    inactive: "INACTIVO",
    comparativeMetrics: "Métricas comparativas",
    correlationDelta: "Delta de correlación",
    comparisonInsight: "Información de comparación",
    strategicInsights: "Información estratégica",
    verifiedFlow: "Flujo verificado",
    liveIntelligence: "Feed de inteligencia en vivo",
    electionBasics: "Conceptos básicos electorales",
    essentialPricing: "Precios esenciales",
    officialVerification: "Verificación oficial",
    sentimentPulse: "Pulso de Sentimiento"
  },
  Tamil: {
    dashboard: "கட்டுப்பாட்டு அறை",
    dataCentric: "தரவு சார்ந்த",
    simplifiedView: "எளிமையான காட்சி",
    verified: "சரிபார்க்கப்பட்டது: மணிநேர ஒத்திசைவு",
    equitySentiment: "பங்குச் சந்தை உணர்வு",
    bullish: "ஏற்றம்",
    bearish: "வீழ்ச்சி",
    searchAssets: "சொத்துக்களைத் தேடுங்கள்...",
    commodityIndex: "பொருட்கள் குறியீடு",
    volatilityGuard: "நிலையற்ற பாதுகாப்பு",
    threshold: "வரம்பு",
    criticalDrift: "முக்கிய மாற்றம்",
    noAnomalies: "தற்போதைய சுழற்சியில் முரண்பாடுகள் இல்லை",
    sentimentDynamics: "உணர்வு இயக்கவியல்",
    yearFilter: "ஆண்டு வடிகட்டி",
    comparisonMode: "ஒப்பீட்டு முறை",
    active: "செயலில் உள்ளது",
    inactive: "செயலற்றது",
    comparativeMetrics: "ஒப்பீட்டு அளவீடுகள்",
    correlationDelta: "தொடர்பு டெல்டா",
    comparisonInsight: "ஒப்பீட்டு நுண்ணறிவு",
    strategicInsights: "மூலோபாய நுண்ணறிவு",
    verifiedFlow: "சரிபார்க்கப்பட்ட ஓட்டம்",
    liveIntelligence: "நேரடி நுண்ணறிவு ஊட்டம்",
    electionBasics: "தேர்தல் அடிப்படைகள்",
    essentialPricing: "அத்தியாவசிய விலையிடல்",
    officialVerification: "அதிகாரப்பூர்வ சரிபார்ப்பு",
    sentimentPulse: "உணர்வு துடிப்பு"
  }
};

export const LANGUAGES = [
  { label: 'English', code: 'English' },
  { label: 'Hindi', code: 'Hindi' },
  { label: 'Bengali', code: 'Bengali' },
  { label: 'Tamil', code: 'Tamil' },
  { label: 'Spanish', code: 'Spanish' },
  { label: 'French', code: 'French' }
];
