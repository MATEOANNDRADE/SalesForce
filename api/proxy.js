const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const SALESFORCE_AUTH_URL = 'https://login.salesforce.com/services/oauth2/token';
const CLIENT_ID = '3MVG9X4LnCkfEVVhdhBNpParSm5Nj7jZjvcRurY3Ty5fKYjJzzJ7zevxyQrJwP60mCpp2m3zbgcEZwJT114BI';
const CLIENT_SECRET = '47B30C4368E436B2890C0FA90026BCA2C9F10392A5B8454491EEA0FC6DD9515D';
const USERNAME = 'integration@toyota.com';
const PASSWORD = 'ATCT0y0@P1#24*$cZ6EdXgKlCjBxqW4tZa2aGfmF';
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
    res.setHeader('Access-Control-Allow-Origin', 'https://distoyota.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const authData = await authenticateSalesforce();
            const { access_token, instance_url } = authData;

            console.log('Acceso autorizado a Salesforce:');
            console.log('Token de acceso:', access_token);
            console.log('URL de la instancia:', instance_url);

            console.log('Datos enviados (req.body):', req.body);

            const salesforceEndpoint = `${instance_url}/services/data/v55.0/composite/sobjects/Lead`;
            const salesforceResponse = await fetch(salesforceEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                },
                body: JSON.stringify(req.body),
            });

            if (!salesforceResponse.ok) {
                const errorText = await salesforceResponse.text();
                throw new Error(`Error al enviar los datos a Salesforce: ${errorText}`);
            }

            const responseData = await salesforceResponse.json();
        
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
