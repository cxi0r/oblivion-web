// pages/raw/[id].js
export default function RawHandler() {
    // Esta página solo se ejecuta en el servidor (getServerSideProps)
    return null;
}

export async function getServerSideProps({ params, res }) {
    const { id } = params;
    const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';

    try {
        // Obtener el paste de Supabase a través de la API interna
        const response = await fetch(`${baseUrl}/api/paste?id=${id}`);

        if (!response.ok) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Paste not found');
            return { props: {} };
        }

        const paste = await response.json();

        // Devolver el contenido en texto plano
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.end(paste.content);
        return { props: {} };

    } catch (error) {
        console.error('Error al obtener el paste raw:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
        return { props: {} };
    }
}
