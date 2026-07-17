// pages/p/[id].js
export default function PastePage({ paste, error }) {
    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: '#050505',
                color: '#ffffff',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: '#dc2626' }}>❌ {error}</h1>
                    <p style={{ color: '#888888' }}>El paste no existe o ha sido eliminado.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: '#050505',
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            color: '#ffffff'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{ color: '#ffffff' }}>📄 {paste.title}</h1>
                    <span style={{
                        background: '#0d0d0d',
                        padding: '0.3rem 1rem',
                        borderRadius: '20px',
                        border: '1px solid #1f1f1f',
                        color: '#888888',
                        fontSize: '0.8rem'
                    }}>
                        {paste.public ? '🌍 Público' : '🔒 Privado'}
                    </span>
                </div>
                <div style={{
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderColor: '#dc2626',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    overflow: 'auto',
                    maxHeight: '70vh',
                    boxShadow: '0 0 40px rgba(220, 38, 38, 0.05)'
                }}>
                    <pre style={{
                        fontFamily: 'JetBrains Mono, Courier New, monospace',
                        fontSize: '0.85rem',
                        color: '#e5e5e5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        {paste.content}
                    </pre>
                </div>
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    color: '#555555',
                    fontSize: '0.8rem'
                }}>
                    Creado el {new Date(paste.created_at).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ params }) {
    const { id } = params;

    try {
        const baseUrl = process.env.BASE_URL || 'https://oblivionhub.xyz';
        const response = await fetch(`${baseUrl}/api/paste?id=${id}`);

        if (!response.ok) {
            return { props: { error: 'Paste no encontrado' } };
        }

        const paste = await response.json();
        return { props: { paste } };
    } catch (error) {
        return { props: { error: 'Error al cargar el paste' } };
    }
}
