// api/paste.js
import { createClient } from '@supabase/supabase-js';
import md5 from 'crypto-js/md5';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // ============================================================
    //  POST: Crear un paste
    // ============================================================
    if (req.method === 'POST') {
        const { content, title, userId, public: isPublic } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const id = md5(content).toString();

        const { data, error } = await supabase
            .from('pastes')
            .insert({
                id,
                content,
                title: title || 'Untitled',
                user_id: isPublic ? null : userId,
                public: isPublic || false,
                created_at: new Date().toISOString()
            });

        if (error && error.code === '23505') {
            const fallbackId = generateFallbackId();
            const { data: retryData, error: retryError } = await supabase
                .from('pastes')
                .insert({
                    id: fallbackId,
                    content,
                    title: title || 'Untitled',
                    user_id: isPublic ? null : userId,
                    public: isPublic || false,
                    created_at: new Date().toISOString()
                });
            if (retryError) {
                console.error('Error al guardar en Supabase:', retryError);
                return res.status(500).json({ error: retryError.message });
            }
            return res.status(201).json({
                success: true,
                id: fallbackId,
                url: `${process.env.BASE_URL || 'https://oblivionhub.xyz'}/api/paste?id=${fallbackId}&raw=true`,
                title: title || 'Untitled',
                public: isPublic || false
            });
        }

        if (error) {
            console.error('Error al guardar en Supabase:', error);
            return res.status(500).json({ error: error.message });
        }

        const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';
        const url = `${baseUrl}/api/paste?id=${id}&raw=true`;

        return res.status(201).json({
            success: true,
            id,
            url,
            title: title || 'Untitled',
            public: isPublic || false
        });
    }

    // ============================================================
    //  GET: Obtener un paste
    // ============================================================
    if (req.method === 'GET') {
        const { id, raw } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        const { data, error } = await supabase
            .from('pastes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            // Si no existe el paste y es raw, devolver 404 con HTML personalizado
            if (raw === 'true') {
                const userAgent = req.headers['user-agent'] || '';
                const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(userAgent) && !/Roblox|luau/i.test(userAgent);
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
                    return;
                }
                // Si no es navegador, devolver texto plano
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Paste not found');
                return;
            }
            return res.status(404).json({ error: 'Paste not found' });
        }

        // Si se solicita raw
        if (raw === 'true') {
            const userAgent = req.headers['user-agent'] || '';
            const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge|Opera/i.test(userAgent) && !/Roblox|luau/i.test(userAgent);

            // Si es navegador, devolver 404 aunque el paste exista
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
                return;
            }

            // Si no es navegador, devolver contenido en texto plano
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.end(data.content);
            return;
        }

        // Si no es raw, devolver JSON normal
        return res.status(200).json(data);
    }

    // ============================================================
    //  DELETE: Eliminar un paste
    // ============================================================
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        const { error } = await supabase
            .from('pastes')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// ============================================================
//  Función de fallback (genera ID aleatorio de 32 caracteres)
// ============================================================
function generateFallbackId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
