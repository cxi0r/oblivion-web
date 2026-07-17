// api/paste.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { content, title, userId, public: isPublic } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const id = generateShortId();

        // Guardar en memoria (para pruebas) o en base de datos
        if (!global.pastes) {
            global.pastes = new Map();
        }

        global.pastes.set(id, {
            id,
            content,
            title: title || 'Untitled',
            user_id: isPublic ? null : userId,
            public: isPublic || false,
            created_at: new Date().toISOString()
        });

        const url = `${process.env.BASE_URL || 'https://oblivionhub.xyz'}/p/${id}`;
        return res.status(201).json({ id, url, title: title || 'Untitled' });
    }

    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        const paste = global.pastes?.get(id);
        if (!paste) {
            return res.status(404).json({ error: 'Paste not found' });
        }

        // Si es privado, verificar el usuario (por simplicidad, solo devolvemos)
        return res.status(200).json(paste);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

function generateShortId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
