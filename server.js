require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini with your free API key from https://aistudio.google.com/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

app.post('/api/tailor', async (req, res) => {
  try {
    const { jobDescription, resumeBullets } = req.body;
    if (!jobDescription || !resumeBullets) {
      return res.status(400).json({ error: 'Missing jobDescription or resumeBullets' });
    }

    const prompt = `You are an expert resume writer for the US job market. 
Given this job description:
"""
${jobDescription}
"""
And these original resume bullet points:
"""
${resumeBullets}
"""

Rewrite each bullet point to be more impactful, incorporating keywords from the job description, quantifiable achievements, and strong action verbs. Keep the same number of bullet points. Return ONLY the rewritten bullets separated by newlines, with no additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Split into array and clean up
    const bullets = text.split('\n').filter(line => line.trim() !== '');
    res.json({ tailoredBullets: bullets });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to tailor resume. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));