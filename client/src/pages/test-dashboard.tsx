function TestDashboard() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', textAlign: 'center', fontSize: '32px' }}>
        DASHBOARD IS WORKING
      </h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        maxWidth: '1000px',
        margin: '40px auto'
      }}>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #1976d2'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#1976d2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>1</div>
          <h3>Client Details</h3>
          <p>Enter your information</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #388e3c'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#388e3c',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>2</div>
          <h3>Document Upload</h3>
          <p>Upload files</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#f3e5f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #7b1fa2'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#7b1fa2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>3</div>
          <h3>Family Tree</h3>
          <p>Build genealogy</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #f57c00'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#f57c00',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>4</div>
          <h3>Generate PDFs</h3>
          <p>Create documents</p>
        </div>
      </div>
    </div>
  );
}

export default TestDashboard;