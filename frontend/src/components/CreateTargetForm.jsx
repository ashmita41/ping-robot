/**
 * CreateTargetForm Component
 * 
 * Form to create a new HTTP target
 * Saves target to localStorage after creation
 */

import { useState } from 'react';
import { createTarget } from '../services/api';
import { saveTarget } from '../utils/storage';

export default function CreateTargetForm({ onTargetCreated }) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse headers if provided
      let parsedHeaders = null;
      if (headers.trim()) {
        try {
          parsedHeaders = JSON.parse(headers);
        } catch {
          // If not valid JSON, try to parse as key:value pairs
          const headerObj = {};
          headers.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              headerObj[key.trim()] = valueParts.join(':').trim();
            }
          });
          parsedHeaders = Object.keys(headerObj).length > 0 ? headerObj : null;
        }
      }

      // Create target via API
      // Always include body_template field (even if empty) for consistency
      const targetData = {
        url: url.trim(),
        method: method,
        ...(parsedHeaders && { headers: parsedHeaders }),
        body_template: bodyTemplate.trim() || null  // Always include, null if empty
      };

      const target = await createTarget(targetData);

      // Save to localStorage for later reference
      saveTarget(target);

      // Reset form
      setUrl('');
      setMethod('GET');
      setHeaders('');
      setBodyTemplate('');
      setSuccess(true);

      // Notify parent component
      if (onTargetCreated) {
        onTargetCreated(target);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create target');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-target-form">
      <h2>Create Target</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">URL *</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/api/endpoint"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="method">HTTP Method</label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={loading}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="headers">Headers (JSON or key:value format)</label>
          <textarea
            id="headers"
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"Authorization": "Bearer token"} or Authorization: Bearer token'
            rows="3"
            disabled={loading}
          />
          <small>Optional: JSON object or key:value pairs (one per line)</small>
        </div>

        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <div className="form-group">
            <label htmlFor="bodyTemplate">Request Body</label>
            <textarea
              id="bodyTemplate"
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              placeholder='{"key": "value"}'
              rows="4"
              disabled={loading}
            />
            <small>Optional: Request body template</small>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            Target created successfully!
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Target'}
        </button>
      </form>
    </div>
  );
}
