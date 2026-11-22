import { obfuscateScript } from '../lib/obfuscate.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    if (typeof req.body?.script !== 'string' || !req.body.script.trim()) {
        return res.status(400).json({ success: false, error: 'Script is required' });
    }
    try {
        const obfuscated = await obfuscateScript(req.body.script);
        return res.status(200).json({ success: true, obfuscated });
    } catch (error) {
        return res.status(502).json({ success: false, error: error.message });
    }
}
