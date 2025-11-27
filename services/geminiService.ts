const getClient = () => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return apiKey;
};

export const analyzeSecurityRisk = async (purpose: string, location: string, visitorCount: number): Promise<string> => {
    try {
        const apiKey = getClient();
        const prompt = `
        You are a school security AI assistant. Analyze the following visitor application details:
        
        Purpose of Visit: "${purpose}"
        Location: "${location}"
        Number of Visitors: ${visitorCount}

        Assess the security risk. If the purpose seems legitimate (e.g., parent meeting, delivery, maintenance), reply with a "Low Risk" assessment and a brief, polite summary. 
        If there are red flags (e.g., vague reasons, aggressive language, unusual locations for visitors), label it "Medium" or "High Risk" and explain why.
        
        Keep the response under 50 words.
        `;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json() as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || "Unable to analyze risk.";
    } catch (error) {
        console.error("Gemini Analysis Failed", error);
        return "AI Analysis unavailable.";
    }
};
