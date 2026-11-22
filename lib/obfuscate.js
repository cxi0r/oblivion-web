// All upload paths must complete obfuscation before persisting any script.
export async function obfuscateScript(script) {
    if (typeof script !== 'string' || !script.trim()) {
        throw new Error('Script is required');
    }

    const response = await fetch('https://wearedevs.net/api/obfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
        signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
        throw new Error('Obfuscation service is unavailable. No script was uploaded.');
    }

    const data = await response.json();
    if (
        data.success !== true ||
        typeof data.obfuscated !== 'string' ||
        !data.obfuscated.trim() ||
        data.obfuscated === script
    ) {
        throw new Error('Obfuscation failed. No script was uploaded.');
    }

    return data.obfuscated;
}
