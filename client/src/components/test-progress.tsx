// Ultra-simple test component - WORKING
export function TestProgress() {
  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: '#e5e7eb',
        zIndex: 9999
      }}>
        <div style={{
          width: '30%',
          height: '100%',
          backgroundColor: '#2563eb'
        }} />
      </div>
      
      {/* Test navigation buttons - always visible */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          height: '48px',
          width: '48px',
          borderRadius: '50%',
          backgroundColor: '#4ade80',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}
      >
        ↑
      </button>
      
      <button
        onClick={() => window.history.back()}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 50,
          height: '48px',
          width: '48px',
          borderRadius: '50%',
          backgroundColor: '#4ade80',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}
      >
        ←
      </button>
    </>
  );
}