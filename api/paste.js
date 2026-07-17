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

        // Generar ID usando MD5 del contenido (32 caracteres)
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

        // Si el ID ya existe (colisión), generar un fallback aleatorio
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
                url: `${process.env.BASE_URL || 'https://oblivionhub.xyz'}/raw/${fallbackId}`,
                title: title || 'Untitled',
                public: isPublic || false
            });
        }

        if (error) {
            console.error('Error al guardar en Supabase:', error);
            return res.status(500).json({ error: error.message });
        }

        const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';
        const url = `${baseUrl}/raw/${id}`;

        return res.status(201).json({
            success: true,
            id,
            url,
            title: title || 'Untitled',
            public: isPublic || false
        });
    }

    // ============================================================
    //  GET: Obtener un paste por ID (para la página de visualización)
    // ============================================================
    if (req.method === 'GET') {
        const { id } = req.query;
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
