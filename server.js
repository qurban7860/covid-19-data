const express = require('express');
const axios = require('axios'); // Import Axios for making HTTP requests
const path = require('path');
const app = express();

// Serve static files from the 'public' directory
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/owid-covid-latest.csv', (req, res) => {
    // Make a GET request to fetch the file
    axios.get('http://localhost:8081/static/owid-covid-codebook.csv')
        .then(response => {
    
            res.send(response.data);
        })
        .catch(error => {
            console.error('Error fetching file:', error);
            res.status(500).send('Internal Server Error');
        });
});

// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
