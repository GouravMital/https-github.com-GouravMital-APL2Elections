import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateInsights = async (data: string, targetLanguage: string = 'English') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following election data and provide 3 key insights. 
      Translate the response to ${targetLanguage}.
      Data: ${data}
      
      Output format:
      {
        "insights": ["insight 1", "insight 2", "insight 3"],
        "lang": "${targetLanguage}"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { insights: ["Unable to fetch insights at this time."], lang: targetLanguage };
  }
};

export const translateText = async (text: string, targetLanguage: string) => {
  if (targetLanguage === 'English') return text;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}. 
      Text: "${text}"
      Only return the translated string.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

export const generateSentimentAnalysis = async (electionTitle: string, lang: string = 'English') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the public sentiment and media coverage for the election: "${electionTitle}".
      Provide a summary of the general mood, key controversial topics, and media bias observations.
      Translate the response to ${lang}.
      
      Output format:
      {
        "sentimentMood": "Positive/Neutral/Negative",
        "score": 0-100,
        "summary": "Full analysis text here",
        "keyTopics": ["topic 1", "topic 2"]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Sentiment Error:", error);
    return { 
      sentimentMood: "Neutral", 
      score: 50, 
      summary: "Sentiment analysis unavailable.", 
      keyTopics: ["Data flow interrupted"] 
    };
  }
};

export const generateStockNews = async (stockName: string, lang: string = 'English') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 realistic, high-impact financial news headlines and summaries for the asset: "${stockName}". 
      Focus on market movements, institutional changes, or political fallout affecting the stock.
      Translate the results to ${lang}.
      
      Output format: 
      {
        "news": [
          { "title": "Headline", "summary": "Short summary", "date": "1h ago" },
          ...
        ]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text).news;
  } catch (error) {
    console.error("Stock News Error:", error);
    return [
      { title: `${stockName} Performance Analysis`, summary: "Standard market monitoring in progress for this asset.", date: "Now" }
    ];
  }
};
