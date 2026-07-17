// pages/404.js
export default function Custom404() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#050505',
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div>
                <h1 style={{ fontSize: '5rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.5rem', textShadow: '0 0 60px rgba(220, 38, 38, 0.2)' }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>You cannot access this information</h2>
                <p style={{ color: '#888888', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    The requested page does not exist or has been removed.
                </p>
                <a href="/" style={{
                    display: 'inline-block',
                    padding: '0.8rem 2rem',
                    background: '#dc2626',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    transition: 'background 0.3s'
                }}>Return to Home</a>
            </div>
        </div>
    );
}
