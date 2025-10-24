// File: /api/chat.js
// Secure serverless function for handling AI chat requests via Google Gemini

const { sql } = require('@vercel/postgres');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI Client with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash";

module.exports = async (req, res) => {
    // Handle CORS for all origins (adjust in production if needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // --- GET: Fetch conversation history ---
    if (req.method === 'GET') {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        try {
            const { rows } = await sql`
                SELECT role, parts
                FROM conversations
                WHERE user_id = ${userId}
                ORDER BY created_at ASC;
            `;
            // The parts are stored as stringified JSON, so we need to parse them.
            const history = rows.map(row => ({
                role: row.role,
                parts: JSON.parse(row.parts)
            }));
            return res.status(200).json({ history });
        } catch (error) {
            console.error('Error fetching conversation history:', error);
            // If the table doesn't exist, return an empty history instead of erroring.
            if (error.code === '42P01') { 
                return res.status(200).json({ history: [] });
            }
            return res.status(500).json({ error: 'Failed to fetch conversation history.' });
        }
    }

    // --- DELETE: Clear conversation history ---
    if (req.method === 'DELETE') {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        try {
            await sql`
                DELETE FROM conversations
                WHERE user_id = ${userId};
            `;
            return res.status(200).json({ message: 'Conversation history cleared.' });
        } catch (error) {
            console.error('Error clearing conversation history:', error);
            return res.status(500).json({ error: 'Failed to clear conversation history.' });
        }
    }

    // --- POST: Send a message ---
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Helper to save a message to the DB
    const saveMessage = async (userId, role, parts) => {
        if (!userId) return; // Don't save if no userId is provided
        try {
            // `parts` is an array of objects, so we stringify it for the JSONB column.
            const partsJson = JSON.stringify(parts);
            await sql`
                INSERT INTO conversations (user_id, role, parts)
                VALUES (${userId}, ${role}, ${partsJson});
            `;
        } catch (error) {
            // Log the error but don't block the chat response
            console.error('Failed to save message to DB:', error);
        }
    };

    try {
        const { history, system_prompt, userId } = req.body;

        // Validate required fields
        if (!history || !Array.isArray(history)) {
            return res.status(400).json({ error: 'Valid conversation history is required.' });
        }

        if (!system_prompt) {
            return res.status(400).json({ error: 'System prompt is required.' });
        }

        // Initialize the Gemini model with system instruction
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
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
        const lastUserMessage = history[history.length - 1];
        const userMessageContent = lastUserMessage.parts[0].text;

        // Save user message to DB
        await saveMessage(userId, lastUserMessage.role, lastUserMessage.parts);

        // Send the message and get response
        const result = await chat.sendMessage(userMessageContent);
        const response = await result.response;
        const text = response.text();

        // Save AI response to DB
        await saveMessage(userId, 'model', [{ text }]);

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