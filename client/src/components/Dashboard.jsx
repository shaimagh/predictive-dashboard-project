import React, { useState, useEffect } from 'react';
import { 
    Grid, Paper, Typography, Box, Card, CardContent,
    LinearProgress, Alert, Button, TextField, Select,
    MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import { mlService } from '../services/mlService';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [windowSize, setWindowSize] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await mlService.getSampleData();
            setData(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const runAnalysis = async () => {
        if (!data?.timeSeriesData) return;
        
        const timeSeriesValues = data.timeSeriesData.map(item => item.y);
        
        try {
            const response = await mlService.analyzeTimeSeries(
                timeSeriesValues, 
                windowSize
            );
            setAnalysis(response.data.analysis);
            
            // Créer les données pour le graphique de prédiction
            const predData = timeSeriesValues.slice(windowSize).map((value, index) => ({
                time: index + windowSize,
                actual: value,
                predicted: response.data.analysis.predictions[index] || 0
            }));
            setPredictions(predData);
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Tableau de Bord d'Analyse Prédictive
            </Typography>

            {/* Contrôles d'analyse */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Taille de fenêtre</InputLabel>
                            <Select
                                value={windowSize}
                                onChange={(e) => setWindowSize(e.target.value)}
                                label="Taille de fenêtre"
                            >
                                <MenuItem value={5}>5 périodes</MenuItem>
                                <MenuItem value={10}>10 périodes</MenuItem>
                                <MenuItem value={15}>15 périodes</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Button 
                            variant="contained" 
                            onClick={runAnalysis}
                            fullWidth
                        >
                            Exécuter l'analyse prédictive
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Métriques */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {data?.metrics && Object.entries(data.metrics).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                </Typography>
                                <Typography variant="h5">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                    {key.includes('Rate') && '%'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Graphiques */}
            <Grid container spacing={3}>
                {/* Graphique des ventes */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Données de Ventes Mensuelles
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data?.salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sales" fill="#8884d8" />
                                <Bar dataKey="revenue" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Graphique des prédictions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Analyse Prédictive - Série Temporelle
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={predictions}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="actual" 
                                    stroke="#8884d8" 
                                    name="Valeurs Réelles"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="predicted" 
                                    stroke="#82ca9d" 
                                    name="Prédictions"
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Résultats d'analyse */}
                {analysis && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Résultats de l'Analyse
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary">
                                                Tendance
                                            </Typography>
                                            <Typography variant="h5">
                                                {analysis.trend > 0 ? '↗' : '↘'} 
                                                {analysis.trend.toFixed(4)}
                                            </Typography>
                                            <Typography variant="body2">
                                                {analysis.trend > 0 ? 'Tendance positive' : 'Tendance négative'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary">
                                                Anomalies Détectées
                                            </Typography>
                                            <Typography variant="h5">
                                                {analysis.anomalies.length}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary">
                                                Score de Saisonnalité
                                            </Typography>
                                            <Typography variant="h5">
                                                {analysis.seasonality.length > 0 
                                                    ? Math.max(...analysis.seasonality.map(Math.abs)).toFixed(3)
                                                    : '0'
                                                }
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Liste des anomalies */}
                            {analysis.anomalies.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Points de données anormaux:
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {analysis.anomalies.slice(0, 5).map((anomaly, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <Alert severity="warning">
                                                    Index {anomaly.index}: Valeur {anomaly.value.toFixed(2)} 
                                                    (Z-score: {anomaly.zScore.toFixed(2)})
                                                </Alert>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default Dashboard;