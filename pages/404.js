// pages/404.js
export default function Custom404() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#050505',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ color: '#dc2626', fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>
          You cannot access this information
        </h2>
        <p style={{ color: '#888888', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          The requested paste does not exist or has been removed.
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '0.8rem 2rem',
            background: '#dc2626',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
          onMouseLeave={(e) => e.target.style.background = '#dc2626'}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
