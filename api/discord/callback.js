// api/discord/callback.js
export default async function handler(req, res) {
    // 1. Verificar que recibimos el código
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Missing code parameter');
    }

    // 2. Variables de entorno (deben estar configuradas en Vercel)
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const GUILD_ID = process.env.DISCORD_GUILD_ID;
    const FRONTEND_URL = process.env.FRONTEND_URL;

    // Validar que todas las variables existan
    if (!CLIENT_ID || !CLIENT_SECRET || !BOT_TOKEN || !GUILD_ID || !FRONTEND_URL) {
        console.error('Missing environment variables');
        return res.status(500).send('Server configuration error');
    }

    try {
        // 3. Intercambiar código por token de acceso
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange error:', errorData);
            return res.status(500).send('Failed to exchange token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 4. Obtener información del usuario
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            return res.status(500).send('Failed to get user info');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        const username = userData.username;

        // 5. Añadir usuario al servidor usando el Bot
        const addResponse = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_token: accessToken,
                nick: username,
            }),
        });

        if (!addResponse.ok) {
            const errorData = await addResponse.text();
            console.error('Failed to add user to guild:', errorData);
            // No fallamos la autenticación, solo avisamos
        }

        // 6. Redirigir al frontend con éxito
        const redirectUrl = new URL(FRONTEND_URL);
        redirectUrl.searchParams.set('auth', 'success');
        redirectUrl.searchParams.set('username', username);
        return res.redirect(redirectUrl.toString());

    } catch (error) {
        console.error('Error in callback:', error);
        return res.status(500).send('Internal server error');
    }
}
