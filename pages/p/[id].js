// api/p/[id].js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).send('ID is required');
    }

    try {
        const { data, error } = await supabase
            .from('pastes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).send('Paste not found');
        }

        // Devolver HTML con el script
        res.setHeader('Content-Type', 'text/html');
        return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title || 'Paste'}</title>
    <style>
        body {
            background: #050505;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            padding: 2rem;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1f1f1f;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        .title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #ffffff;
        }
        .badge {
            background: #0d0d0d;
            border: 1px solid #1f1f1f;
            border-radius: 20px;
            padding: 0.3rem 1rem;
            color: #888888;
            font-size: 0.8rem;
        }
        .script-container {
            background: #0d0d0d;
            border: 1px solid #1f1f1f;
            border-radius: 12px;
            padding: 1.5rem;
            overflow: auto;
            max-height: 70vh;
            box-shadow: 0 0 40px rgba(220, 38, 38, 0.05);
        }
        pre {
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 0.85rem;
            color: #e5e5e5;
            white-space: pre-wrap;
            word-break: break-word;
            margin: 0;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            color: #555555;
            font-size: 0.8rem;
            margin-top: 1.5rem;
        }
        .copy-btn {
            margin-top: 1rem;
            padding: 0.5rem 1.5rem;
            background: #dc2626;
            border: none;
            border-radius: 8px;
            color: #ffffff;
            font-weight: 600;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.2s;
        }
        .copy-btn:hover {
            background: #b91c1c;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="title">📄 ${data.title || 'Untitled'}</span>
            <span class="badge">${data.public ? '🌍 Público' : '🔒 Privado'}</span>
        </div>
        <div class="script-container">
            <pre id="scriptContent">${data.content}</pre>
        </div>
        <button class="copy-btn" onclick="copyScript()">📋 Copiar script</button>
        <div class="footer">
            Creado el ${new Date(data.created_at).toLocaleString()}
        </div>
    </div>
    <script>
        function copyScript() {
            const content = document.getElementById('scriptContent').textContent;
            navigator.clipboard.writeText(content).then(() => {
                alert('Script copiado al portapapeles');
            });
        }
    </script>
</body>
</html>
        `);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
}
