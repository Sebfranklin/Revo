// File: /api/reviews.js
// Serverless function to handle fetching and creating reviews from Vercel Postgres.

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    // Handle CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Ensure tables exist. This is a good place to centralize schema setup.
        // Vercel Postgres is smart and won't re-create tables if they exist.
        await sql`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                text TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL, -- 'user' or 'model'
                parts JSONB NOT NULL, -- Stores the [{ "text": "..." }] structure
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        if (req.method === 'GET') {
            // Fetch all reviews with a rating of 3 or higher
            const { rows: reviews } = await sql`
                SELECT id, name, company, rating, text, created_at as "createdAt"
                FROM reviews
                WHERE rating >= 3
                ORDER BY created_at DESC;
            `;
            return res.status(200).json(reviews);
        }

        if (req.method === 'POST') {
            const { name, company, rating, text: reviewText } = req.body;

            // Validate required fields
            if (!name || !rating || !reviewText) {
                return res.status(400).json({ error: 'Name, rating, and review text are required.' });
            }

            // Insert the new review into the database
            await sql`
                INSERT INTO reviews (name, company, rating, text)
                VALUES (${name}, ${company}, ${rating}, ${reviewText});
            `;

            return res.status(201).json({ message: 'Thank you for your review! It has been submitted successfully.' });
        }

        // Handle unsupported methods
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error with reviews API:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
};