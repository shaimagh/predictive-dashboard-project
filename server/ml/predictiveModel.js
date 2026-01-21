const tf = require('@tensorflow/tfjs');

class PredictiveModel {
    constructor() {
        this.model = null;
    }

    // Création d'un modèle de régression simple
    createRegressionModel(inputShape) {
        this.model = tf.sequential();
        
        this.model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [inputShape]
        }));
        
        this.model.add(tf.layers.dense({
            units: 32,
            activation: 'relu'
        }));
        
        this.model.add(tf.layers.dense({
            units: 1,
            activation: 'linear'
        }));
        
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mse']
        });
        
        return this.model;
    }

    // Entraînement du modèle
    async trainModel(data, labels, epochs = 100) {
        const xs = tf.tensor2d(data);
        const ys = tf.tensor2d(labels, [labels.length, 1]);
        
        const history = await this.model.fit(xs, ys, {
            epochs: epochs,
            batchSize: 32,
            validationSplit: 0.2,
            verbose: 0
        });
        
        return history.history;
    }

    // Prédiction
    predict(data) {
        const tensorData = tf.tensor2d(data);
        const predictions = this.model.predict(tensorData);
        return predictions.dataSync();
    }

    // Analyse de séries temporelles
    analyzeTimeSeries(data, windowSize = 10) {
        const results = {
            predictions: [],
            trend: this.calculateTrend(data),
            seasonality: this.detectSeasonality(data),
            anomalies: this.detectAnomalies(data)
        };
        
        // Prédictions simples (moyenne mobile)
        for (let i = windowSize; i < data.length; i++) {
            const window = data.slice(i - windowSize, i);
            const avg = window.reduce((a, b) => a + b, 0) / windowSize;
            results.predictions.push(avg);
        }
        
        return results;
    }

    calculateTrend(data) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumX2 += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    detectSeasonality(data) {
        // Détection simple de saisonnalité
        const autocorr = [];
        const mean = data.reduce((a, b) => a + b) / data.length;
        
        for (let lag = 1; lag < Math.min(20, data.length / 2); lag++) {
            let numerator = 0;
            let denominator = 0;
            
            for (let i = lag; i < data.length; i++) {
                numerator += (data[i] - mean) * (data[i - lag] - mean);
            }
            
            for (let i = 0; i < data.length; i++) {
                denominator += Math.pow(data[i] - mean, 2);
            }
            
            autocorr.push(numerator / denominator);
        }
        
        return autocorr;
    }

    detectAnomalies(data, threshold = 2) {
        const mean = data.reduce((a, b) => a + b) / data.length;
        const std = Math.sqrt(
            data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length
        );
        
        const anomalies = [];
        data.forEach((value, index) => {
            const zScore = Math.abs((value - mean) / std);
            if (zScore > threshold) {
                anomalies.push({ index, value, zScore });
            }
        });
        
        return anomalies;
    }
}

module.exports = PredictiveModel;