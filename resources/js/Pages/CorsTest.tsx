import React, { useState } from 'react';
import { ulid } from 'ulid';

const CorsTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('http://event.test/collector');
  const [preflightData, setPreflightData] = useState(() => {
    return JSON.stringify({ id: ulid(), test: 'data' });
  });

  const testSimpleRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      const data = await response.text();
      setResult(`Success! Response: ${data}`);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPreflightRequest = async () => {
    setLoading(true);
    setError(null);
    let bodyObj;
    try {
      bodyObj = JSON.parse(preflightData);
    } catch {
      setError('Preflight body must be valid JSON');
      setLoading(false);
      return;
    }
    // Always set a new random ULID for id
    bodyObj.id = ulid();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value'
        },
        body: JSON.stringify(bodyObj)
      });
      const data = await response.text();
      setResult(`Success! Response: ${data}`);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>CORS Test</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Target URL: </label>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{ width: '80%' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Preflight Request Body (JSON): </label>
        <input
          type="text"
          value={preflightData}
          onChange={e => setPreflightData(e.target.value)}
          style={{ width: '80%' }}
        />
      </div>
      <p>Testing CORS for: <code>{url}</code></p>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testSimpleRequest}
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Simple Request
        </button>
        <button
          onClick={testPreflightRequest}
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          Test Preflight Request
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffeeee', border: '1px solid #ff0000', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      {result && (
        <div style={{ padding: '10px', backgroundColor: '#eeffee', border: '1px solid #00ff00', borderRadius: '4px' }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default CorsTest;
