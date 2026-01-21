import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ml';

export const mlService = {
    // Récupérer les données d'exemple
    async getSampleData() {
        return axios.get(`${API_URL}/sample-data`);
    },

    // Entraîner le modèle
    async trainModel(data, labels) {
        return axios.post(`${API_URL}/train`, { data, labels });
    },

    // Faire des prédictions
    async makePredictions(data) {
        return axios.post(`${API_URL}/predict`, { data });
    },

    // Analyser les séries temporelles
    async analyzeTimeSeries(data, windowSize) {
        return axios.post(`${API_URL}/analyze-time-series`, { 
            data, 
            windowSize 
        });
    }
};
