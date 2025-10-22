// File: /api/reviews.js
// Secure serverless function for handling, analyzing, and storing reviews.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
// In a real-world app, use a proper database (e.g., Vercel Postgres, Supabase).
// For this example, we'll use JSON files in a writable directory.
const DB_PATH = path.join('/tmp'); // Vercel's writable directory
const PUBLIC_REVIEWS_FILE = path.join(DB_PATH, 'public_reviews.json');
const PRIVATE_REVIEWS_FILE = path.join(DB_PATH, 'private_reviews.json');

// Initialize the Gemini AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Helper Functions ---

/**
 * Reads reviews from a JSON file, creating it if it doesn't exist.
 * @param {string} filePath The path to the JSON file.
 * @returns {Promise<Array>} A promise that resolves to an array of reviews.
 */
async function readReviews(filePath) {
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, return an empty array.
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error; // Re-throw other errors
    }
}

/**
 * Writes an array of reviews to a JSON file.
 * @param {string} filePath The path to the JSON file.
 * @param {Array} reviews The array of reviews to write.
 */
async function writeReviews(filePath, reviews) {
    await fs.writeFile(filePath, JSON.stringify(reviews, null, 2), 'utf-8');
}

/**
 * Uses AI to analyze the sentiment of a review.
 * @param {object} review The review object.
 * @returns {Promise<string>} The sentiment ('positive', 'neutral', 'negative').
 */
async function analyzeSentiment(review) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Analyze the sentiment of this customer review. The rating is ${review.rating} out of 5 stars. The comment is: "${review.text}". Based on the comment and rating, classify the overall sentiment as "positive", "neutral", or "negative". Return only one word.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const sentiment = response.text().trim().toLowerCase();

        // Basic validation to ensure the response is one of the expected values
        if (['positive', 'neutral', 'negative'].includes(sentiment)) {
            return sentiment;
        }
        // Fallback for unexpected AI responses
        return review.rating >= 4 ? 'positive' : (review.rating === 3 ? 'neutral' : 'negative');

    } catch (error) {
        console.error("AI Sentiment Analysis Error:", error);
        // Fallback to a simple rating-based logic if AI fails
        return review.rating >= 4 ? 'positive' : (review.rating === 3 ? 'neutral' : 'negative');
    }
}

// --- Main Serverless Function Handler ---

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // --- GET Request: Fetch public reviews ---
    if (req.method === 'GET') {
        try {
            const publicReviews = await readReviews(PUBLIC_REVIEWS_FILE);
            return res.status(200).json(publicReviews);
        } catch (error) {
            console.error('Error reading public reviews:', error);
            return res.status(500).json({ error: 'Could not retrieve reviews.' });
        }
    }

    // --- POST Request: Submit a new review ---
    if (req.method === 'POST') {
        try {
            const newReview = req.body;

            // Basic validation
            if (!newReview.rating || !newReview.name || !newReview.text) {
                return res.status(400).json({ error: 'Missing required review fields.' });
            }

            newReview.createdAt = new Date().toISOString();
            const sentiment = await analyzeSentiment(newReview);

            if (sentiment === 'positive' || sentiment === 'neutral') {
                const publicReviews = await readReviews(PUBLIC_REVIEWS_FILE);
                publicReviews.unshift(newReview); // Add to the beginning
                await writeReviews(PUBLIC_REVIEWS_FILE, publicReviews);
                return res.status(201).json({ message: 'Review submitted and published successfully!', review: newReview });
            } else { // Negative sentiment
                const privateReviews = await readReviews(PRIVATE_REVIEWS_FILE);
                privateReviews.unshift(newReview); // Add to the beginning
                await writeReviews(PRIVATE_REVIEWS_FILE, privateReviews);
                // In a real app, you would also trigger an email notification to yourself here.
                return res.status(201).json({ message: 'Thank you for your feedback. It has been submitted for internal review.' });
            }

        } catch (error) {
            console.error('Error processing new review:', error);
            return res.status(500).json({ error: 'An error occurred while submitting your review.' });
        }
    }

    // --- Fallback for other methods ---
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
};
