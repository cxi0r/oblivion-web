// api/github.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { content, name } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }
    if (!name) {
        return res.status(400).json({ error: 'Script name is required' });
    }

    // Configuración desde variables de entorno
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        console.error('GitHub configuration missing:', {
            hasToken: !!GITHUB_TOKEN,
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO
        });
        return res.status(500).json({ error: 'GitHub configuration missing' });
    }

    // Sanitizar nombre (solo letras, números, guiones y guiones bajos)
    const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '');
    if (!sanitized) {
        return res.status(400).json({ error: 'Invalid script name' });
    }

    // Generar nombre único con timestamp
    const timestamp = Date.now();
    const fileName = `${sanitized}_${timestamp}.lua`;
    const path = `scripts/${fileName}`;

    // Codificar contenido a base64
    const encodedContent = Buffer.from(content).toString('base64');

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

    try {
        console.log(`[GitHub] Subiendo archivo: ${path}`);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Add script ${fileName}`,
                content: encodedContent,
                branch: GITHUB_BRANCH
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('GitHub API error:', errorData);
            return res.status(response.status).json({
                error: errorData.message || 'GitHub upload failed'
            });
        }

        const result = await response.json();

        // Construir URL raw
        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

        return res.status(200).json({
            success: true,
            id: fileName,
            rawUrl: rawUrl,
            path: path,
            sha: result.content?.sha || null
        });

    } catch (error) {
        console.error('Error en /api/github:', error);
        return res.status(500).json({ error: error.message });
    }
}
