export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const response = await fetch(
            'https://wearedevs.net/api/obfuscate',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
