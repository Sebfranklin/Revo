// File: /api/chat.js
// Secure serverless function for handling AI chat requests via Google Gemini

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI Client with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    // Handle CORS for all origins (adjust in production if needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { history, system_prompt } = req.body;

        // Validate required fields
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: 'Valid conversation history is required.' });
        }

        if (!system_prompt) {
            return res.status(400).json({ error: 'System prompt is required.' });
        }

        // Initialize the Gemini model with system instruction
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: system_prompt,
        });

        // Start a chat session with the conversation history
        const chat = model.startChat({
            history: history.slice(0, -1), // All messages except the last one
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.9,
            },
        });

        // Get the last user message to send
        const lastMessage = history[history.length - 1];
        const userMessage = lastMessage.parts[0].text;

        // Send the message and get response
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        // Return the AI response
        res.status(200).json({ message: text });

    } catch (error) {
        console.error('Error with Gemini API:', error);
        
        // Provide helpful error messages
        if (error.message.includes('API_KEY')) {
            return res.status(500).json({ 
                error: 'API key configuration error. Please check server settings.' 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch AI response. Please try again.' 
        });
    }
};