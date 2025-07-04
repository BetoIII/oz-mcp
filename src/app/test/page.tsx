'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<string>('Not connected');
  const [accessToken, setAccessToken] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);

  const testConnection = async () => {
    if (!accessToken) {
      setStatus('Please enter an access token');
      return;
    }

    try {
      setStatus('Connecting...');
      setMessages([]);

      const eventSource = new EventSource(`/mcp/sse`, {
        // Note: EventSource doesn't support custom headers, this is a limitation
        // For testing, we'll use a different approach
      });

      eventSource.onopen = () => {
        setStatus('Connected!');
        setMessages(prev => [...prev, 'SSE connection opened']);
      };

      eventSource.onmessage = (event) => {
        setMessages(prev => [...prev, `Message: ${event.data}`]);
      };

      eventSource.onerror = (error) => {
        setStatus('Connection error');
        setMessages(prev => [...prev, `Error: ${error}`]);
        eventSource.close();
      };

      // Clean up on component unmount
      return () => eventSource.close();
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const testWithFetch = async () => {
    if (!accessToken) {
      setStatus('Please enter an access token');
      return;
    }

    try {
      setStatus('Testing with fetch...');
      
      const response = await fetch('/mcp/sse', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'text/event-stream',
        }
      });

      setStatus(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const text = await response.text();
        setMessages([`Error response: ${text}`]);
      } else {
        setMessages(['Connection successful with authorization header']);
      }
    } catch (error) {
      setStatus(`Fetch error: ${error}`);
    }
  };

  const generateTestToken = async () => {
    try {
      setStatus('Getting test access token...');
      
      // First register a client
      const registerResponse = await fetch('/api/oauth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: 'Test Client',
          redirect_uris: ['http://localhost:3000/test']
        })
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register client');
      }

      const clientData = await registerResponse.json();
      setMessages(prev => [...prev, `Registered client: ${clientData.client_id}`]);

      // For a real OAuth flow, you'd need to go through the authorization process
      // This is just for testing purposes
      setStatus('Client registered. You need to complete OAuth flow to get an access token.');
      
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>MCP SSE Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status: {status}</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Access Token:
          <br />
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            style={{ width: '500px', padding: '8px' }}
            placeholder="Enter your access token here"
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testWithFetch} style={{ marginRight: '10px', padding: '10px' }}>
          Test Connection (Fetch)
        </button>
        <button onClick={testConnection} style={{ marginRight: '10px', padding: '10px' }}>
          Test SSE Connection
        </button>
        <button onClick={generateTestToken} style={{ padding: '10px' }}>
          Register Test Client
        </button>
      </div>

      <div>
        <h3>Messages:</h3>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          maxHeight: '300px', 
          overflow: 'auto',
          border: '1px solid #ddd'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#fffacd' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Register Test Client" to create a test OAuth client</li>
          <li>Complete the OAuth flow by visiting <a href="/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/test&response_type=code&scope=api:read">OAuth authorize endpoint</a></li>
          <li>Exchange the authorization code for an access token via the token endpoint</li>
          <li>Enter the access token above and test the connection</li>
        </ol>
        <p><strong>Note:</strong> The direct SSE connection won't work because EventSource doesn't support custom headers. Use the fetch test to verify authentication.</p>
      </div>
    </div>
  );
} 