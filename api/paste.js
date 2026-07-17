// api/paste.js
import { createClient } from '@supabase/supabase-js';

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

        const id = generateShortId();

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

        if (error) {
            console.error('Error al guardar en Supabase:', error);
            return res.status(500).json({ error: error.message });
        }

        const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';
        const url = `${baseUrl}/api/paste?id=${id}`;

        return res.status(201).json({
            success: true,
            id,
            url,
            title: title || 'Untitled',
            public: isPublic || false
        });
    }

    // ============================================================
    //  GET: Obtener un paste por ID (con soporte para raw)
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
            return res.status(404).json({ error: 'Paste not found' });
        }

        // Si se solicita raw, devolver texto plano
        if (raw === 'true') {
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            return res.status(200).send(data.content);
        }

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

function generateShortId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
