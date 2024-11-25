const fetch = require('node-fetch'); // Si no tienes fetch, instálalo: npm install node-fetch

// Credenciales para autenticarte en Salesforce
const SALESFORCE_AUTH_URL = 'https://test.salesforce.com/services/oauth2/token';
const CLIENT_ID = 'tu_client_id'; // Reemplaza con tu client_id
const CLIENT_SECRET = 'tu_client_secret'; // Reemplaza con tu client_secret
const USERNAME = 'tu_username'; // Reemplaza con tu username
const PASSWORD = 'tu_password'; // Reemplaza con tu password (incluyendo el security token, si aplica)

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

            // Endpoint de Salesforce al que se enviarán los datos
            const salesforceEndpoint = `${instance_url}/services/data/vXX.0/sobjects/ObjectName`; // Reemplaza "ObjectName" con el objeto al que deseas enviar datos.

            // Reenvío de datos al endpoint de Salesforce
            const response = await fetch(salesforceEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al enviar datos a Salesforce: ${errorText}`);
            }

            const data = await response.json();

            // Responder con éxito
            res.status(200).json({
                message: 'Datos enviados exitosamente a Salesforce',
                respuestaSalesforce: data,
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
