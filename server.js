const express = require('express');
const axios = require = require('axios');
const cors = require = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Endpoint para IP/Domínio
app.get('/api/tracker/:query', async (req, res) => {
    const query = req.params.query;
    const fieldsParam = '66846719';
    const langParam = 'pt-BR';
    
    // O backend faz a requisição HTTP insegura
    const targetUrl = `http://ip-api.com/json/${query}?fields=${fieldsParam}&lang=${langParam}`;
    
    try {
        const response = await axios.get(targetUrl);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erro interno ao consultar a API de IP/Domínio.' });
    }
});

// Endpoint para MAC
app.get('/api/mac/:query', async (req, res) => {
    const query = req.params.query;
    const formattedMac = query.replace(/[:.-]/g, ''); 
    const targetUrl = `https://api.macvendors.com/${formattedMac}`;

    try {
        const response = await axios.get(targetUrl);
        // ... (lógica de formatação para MAC)
        const vendorName = response.data;
        res.status(200).json({
            status: 'success',
            mac_address: query,
            fabricante: vendorName,
            consulta_mac: true 
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
             return res.status(200).json({ status: 'error', message: 'Fabricante (Vendor) não encontrado para o endereço MAC.', mac_address: query });
        }
        res.status(500).json({ status: 'error', message: 'Erro interno ao consultar a API MAC.' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy rodando na porta ${PORT}`);
});