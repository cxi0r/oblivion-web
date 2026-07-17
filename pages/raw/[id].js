// pages/raw/[id].js
export default function RawHandler() {
    return null;
}

export async function getServerSideProps({ params, req, res }) {
    const { id } = params;
    const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';

    // Detectar si la solicitud viene de un navegador
    const userAgent = req.headers['user-agent'] || '';
    const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(userAgent) && !/Roblox|luau/i.test(userAgent);

    // Si es un navegador, devolver 404 sin importar si el paste existe
    if (isBrowser) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>404 - Not Found</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        background: #050505;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        font-family: system-ui, -apple-system, sans-serif;
                        color: #ffffff;
                        padding: 2rem;
                    }
                    .container {
                        text-align: center;
                        max-width: 500px;
                    }
                    h1 {
                        font-size: 5rem;
                        font-weight: 700;
                        color: #dc2626;
                        margin-bottom: 0.5rem;
                        text-shadow: 0 0 60px rgba(220, 38, 38, 0.2);
                    }
                    h2 {
                        font-size: 1.5rem;
                        font-weight: 600;
                        color: #ffffff;
                        margin-bottom: 1rem;
                    }
                    p {
                        color: #888888;
                        font-size: 1rem;
                        line-height: 1.6;
                        margin-bottom: 2rem;
                    }
                    a {
                        display: inline-block;
                        padding: 0.8rem 2rem;
                        background: #dc2626;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        transition: background 0.3s;
                    }
                    a:hover {
                        background: #b91c1c;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>404</h1>
                    <h2>You cannot access this information</h2>
                    <p>The requested paste does not exist or has been removed.</p>
                    <a href="/">Return to Home</a>
                </div>
            </body>
            </html>
        `);
        return { props: {} };
    }

    // Si NO es un navegador (ej: Roblox), intentar obtener el paste
    try {
        const response = await fetch(`${baseUrl}/api/paste?id=${id}`);

        if (!response.ok) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Paste not found');
            return { props: {} };
        }

        const paste = await response.json();

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.end(paste.content);
        return { props: {} };

    } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
        return { props: {} };
    }
}
