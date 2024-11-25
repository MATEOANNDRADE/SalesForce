const fetch = require('node-fetch'); // Si no tienes fetch, instálalo: npm install node-fetch

// Credenciales para autenticarte en Salesforce
const SALESFORCE_AUTH_URL = 'https://test.salesforce.com/services/oauth2/token';
const CLIENT_ID = '3MVG9oZtFCVWuSwNbU9py_ihvJu.3_bijzk_q3eNeJpwfImP9llxd..n_cpV.zHYliHfXGV2bpJ5C6z61JB4o'; // Reemplaza con tu client_id
const CLIENT_SECRET = '51CEBCF55CE78CFB2BF2D11DC483365DF38D9DFB23916A860FD5397FAE2E3CAD'; // Reemplaza con tu client_secret
const USERNAME = 'integration@toyota.com.dev'; // Reemplaza con tu username
const PASSWORD = 'ATCT0y0@D3VP1#24*$vFmofL85D5vBOz0pFTvjgRMk'; // Reemplaza con tu password (incluyendo el security token, si aplica)

// Función para obtener el token de acceso desde Salesforce
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
        return data; // Contiene access_token, instance_url, etc.
    } catch (error) {
        console.error('Error en la autenticación con Salesforce:', error);
        throw error;
    }
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            // Autenticación con Salesforce
            const authData = await authenticateSalesforce();
            const { access_token, instance_url } = authData;

            // Mostrar en consola la información obtenida
            console.log('Acceso autorizado a Salesforce:');
            console.log('Token de acceso:', access_token);
            console.log('URL de la instancia:', instance_url);

            // Aquí solo mostramos los datos, no enviamos nada a Salesforce
            // Si quieres ver cómo son los datos que se están enviando en el body de la solicitud:
            console.log('Datos enviados (req.body):', req.body);

            // Responder con los datos obtenidos para confirmar que todo está bien
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
        // Si el método no es POST, devolver un error
        res.status(405).json({ error: 'Método no permitido' });
    }
};
