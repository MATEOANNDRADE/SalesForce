const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const SALESFORCE_AUTH_URL = 'https://test.salesforce.com/services/oauth2/token';
const CLIENT_ID = '3MVG9oZtFCVWuSwNbU9py_ihvJu.3_bijzk_q3eNeJpwfImP9llxd..n_cpV.zHYliHfXGV2bpJ5C6z61JB4o';
const CLIENT_SECRET = '51CEBCF55CE78CFB2BF2D11DC483365DF38D9DFB23916A860FD5397FAE2E3CAD';
const USERNAME = 'integration@toyota.com.dev';
const PASSWORD = 'ATCT0y0@D3VP1#24*$vFmofL85D5vBOz0pFTvjgRMk';
async function authenticateSalesforce() {
    const body = new URLSearchParams({
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: USERNAME,
        password: PASSWORD,
    });

    try {
        const response = await fetch(SALESFORCE_AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!response.ok) {
            throw new Error(`Error al autenticar en Salesforce: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la autenticación con Salesforce:', error);
        throw error;
    }
}

module.exports = async (req, res) => {
    // Configurar encabezados CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://distoyota.com'); // Permitir solicitudes solo desde este origen
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Encabezados permitidos
 
    // Manejar preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Terminar preflight request
    }
 
    if (req.method === 'POST') {
        try {
            const authData = await authenticateSalesforce();
            const { access_token, instance_url } = authData;
 
            console.log('Acceso autorizado a Salesforce:');
            console.log('Token de acceso:', access_token);
            console.log('URL de la instancia:', instance_url);
 
            console.log('Datos enviados (req.body):', req.body);
 
            res.status(200).json({
                message: 'Datos procesados con éxito',
                access_token,
                instance_url,
                request_data: req.body
            });
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
    } else {
        res.status(405).json({ error: 'Método no permitido' });
    }
};
