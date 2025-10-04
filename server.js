const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Agora o cors é uma função e pode ser executado
app.use(cors());

// Rota para o tracker de IP/Domínio (usando proxy para a API HTTP)
app.get('/api/tracker/:query', async (req, res) => {
    const query = req.params.query;
    const fieldsParam = '66846719'; // Parâmetro para retornar todos os detalhes
    const langParam = 'pt-BR';
    
    // O servidor (backend) fará a requisição HTTP insegura
    const targetUrl = `http://ip-api.com/json/${query}?fields=${fieldsParam}&lang=${langParam}`;
    
    console.log(`Proxying request for: ${query}`);

    try {
        // O servidor (backend) faz a requisição HTTP sem problemas de segurança
        const response = await axios.get(targetUrl);

        // Repassa o JSON da API diretamente para o Front-end
        res.status(200).json(response.data);

    } catch (error) {
        console.error('Erro no proxy ao chamar ip-api.com:', error.message);
        res.status(500).json({ status: 'error', message: 'Erro interno do servidor ao consultar a API de IP/Domínio.' });
    }
});

// Rota para consultas MAC (usando API que já suporta HTTPS)
app.get('/api/mac/:query', async (req, res) => {
    const query = req.params.query;
    const formattedMac = query.replace(/[:.-]/g, ''); 
    const targetUrl = `https://api.macvendors.com/${formattedMac}`;

    try {
        const response = await axios.get(targetUrl);
        
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
        
        console.error('Erro no proxy ao chamar macvendors.com:', error.message);
        res.status(500).json({ status: 'error', message: 'Erro interno do servidor ao consultar a API MAC.' });
    }
});


app.listen(PORT, () => {
    console.log(`Proxy rodando na porta ${PORT}`);
});
