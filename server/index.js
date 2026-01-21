const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mlRoutes = require('./routes/mlRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/ml', mlRoutes);

// Route de base
app.get('/', (req, res) => {
    res.json({ message: 'API Predictive Dashboard' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
