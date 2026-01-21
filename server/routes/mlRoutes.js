const express = require('express');
const router = express.Router();
const PredictiveModel = require('../ml/predictiveModel');

const mlModel = new PredictiveModel();

// Route pour entraîner un modèle
router.post('/train', async (req, res) => {
    try {
        const { data, labels } = req.body;
        
        if (!data || !labels) {
            return res.status(400).json({ error: 'Données manquantes' });
        }
        
        mlModel.createRegressionModel(data[0].length);
        const history = await mlModel.trainModel(data, labels);
        
        res.json({
            success: true,
            history: history,
            message: 'Modèle entraîné avec succès'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour les prédictions
router.post('/predict', (req, res) => {
    try {
        const { data } = req.body;
        const predictions = mlModel.predict(data);
        
        res.json({
            success: true,
            predictions: Array.from(predictions)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour l'analyse de séries temporelles
router.post('/analyze-time-series', (req, res) => {
    try {
        const { data, windowSize } = req.body;
        const analysis = mlModel.analyzeTimeSeries(data, windowSize || 10);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour générer des données de démonstration
router.get('/sample-data', (req, res) => {
    // Génération de données de démonstration
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
                   'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const salesData = months.map((month, i) => ({
        month,
        sales: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.floor(Math.random() * 50000) + 20000,
        customers: Math.floor(Math.random() * 200) + 100
    }));
    
    // Données pour prédictions
    const timeSeriesData = Array.from({ length: 50 }, (_, i) => 
        100 + 5 * i + Math.sin(i * 0.5) * 20 + Math.random() * 10
    );
    
    res.json({
        salesData,
        timeSeriesData: timeSeriesData.map((val, i) => ({ x: i, y: val })),
        metrics: {
            totalRevenue: 450000,
            growthRate: 12.5,
            activeUsers: 12500,
            conversionRate: 3.2
        }
    });
});

module.exports = router;
