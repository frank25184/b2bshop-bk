const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to get Google suggestions
async function getGoogleSuggestions(query) {
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(url);
        const suggestions = response.data[1];
        return suggestions;
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return null;
    }
}

// Route to handle search suggestions
app.get('/keywords/get', async (req, res) => {
    const { from, query } = req.query;

    if (from === 'google') {
        if (!query || !query.trim()) {
            return res.status(400).json({ error: 'Please enter a search query.' });
        }

        const suggestions = await getGoogleSuggestions(query);
        if (!suggestions) {
            return res.status(404).json({ error: 'No suggestions found.' });
        }

        return res.json({ suggestions });
    } else {
        return res.status(400).json({ error: 'Invalid source. Please use "google".' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});