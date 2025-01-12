import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the QRReader component to avoid SSR issues
const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

const QRReader = () => {
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState('');

  const handleScan = (data) => {
    if (data) {
      setQrData(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('An error occurred while scanning. Please try again.');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>QR Code Reader</h1>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
      />
      {qrData && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Scanned Data:</h3>
          <p>{qrData}</p>
        </div>
      )}
      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default QRReader;
