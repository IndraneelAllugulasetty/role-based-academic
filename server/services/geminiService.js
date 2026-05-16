import { GoogleGenAI } from "@google/genai";

export const analyzePerformance = async (studentData) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return mockAnalysis(studentData);
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `
            Analyze the following student academic data and provide a summary, risk category (Low, Medium, High), and improvement suggestions.
            Data: ${JSON.stringify(studentData)}
            Format the response as JSON with fields: summary, risk_category, suggestions (array).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        
        try {
            return JSON.parse(text);
        } catch (e) {
            // Extract JSON from text if parsing fails (fallback)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return mockAnalysis(studentData);
        }
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return mockAnalysis(studentData);
    }
};

const mockAnalysis = (data) => {
    const attendance = data.attendance_percentage || 0;
    const marks = data.average_marks || 0;
    
    let risk = "Low Risk";
    let suggestions = ["Keep up the good work!", "Maintain current study habits."];

    if (attendance < 75 || marks < 50) {
        risk = "High Risk";
        suggestions = ["Attend classes regularly.", "Seek extra help in weak subjects.", "Focus on internal assessments."];
    } else if (attendance < 85 || marks < 70) {
        risk = "Medium Risk";
        suggestions = ["Try to improve attendance.", "Review core concepts regularly.", "Participate more in class."];
    }

    return {
        summary: `Student has ${attendance}% attendance and ${marks}% average marks.`,
        risk_category: risk,
        suggestions: suggestions
    };
};
