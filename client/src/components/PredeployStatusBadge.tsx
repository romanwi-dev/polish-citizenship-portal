import React, { useState, useEffect } from 'react';

interface PredeployStatus {
  ok: boolean | null;
  ts?: string;
  issuesCount?: number;
  notes?: string;
}

interface PredeployStatusBadgeProps {
  qaMode: boolean;
}

export function PredeployStatusBadge({ qaMode }: PredeployStatusBadgeProps) {
  const [status, setStatus] = useState<PredeployStatus>({ ok: null });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
      
      if (!adminToken) {
        console.warn('VITE_ADMIN_TOKEN not configured');
        setStatus({ ok: null });
        return;
      }

      const response = await fetch('/api/admin/predeploy/status', {
        headers: {
          'x-admin-token': adminToken
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch predeploy status:', error);
      setStatus({ ok: null });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!qaMode) return;

    // DISABLED AUTO-REFRESH - prevents constant refreshing
    // Poll every 60 seconds when QA_MODE is ON
    // const interval = setInterval(fetchStatus, 60000);
    // return () => clearInterval(interval);
  }, [qaMode]);

  // Don't show badge if QA_MODE is OFF
  if (!qaMode) {
    return null;
  }

  const getStatusDisplay = () => {
    if (isLoading) {
      return {
        color: '#9ca3af',
        text: 'Loading...'
      };
    }

    switch (status.ok) {
      case true:
        return {
          color: '#16a34a',
          text: 'Ready'
        };
      case false:
        return {
          color: '#dc2626',
          text: 'Issues'
        };
      default:
        return {
          color: '#9ca3af',
          text: 'Not run yet'
        };
    }
  };

  const { color, text } = getStatusDisplay();

  return (
    <span 
      className="inline-flex items-center gap-1.5" 
      style={{ fontSize: '14px' }}
      data-testid="predeploy-status-badge"
      title={status.notes || 'PREDEPLOY status'}
    >
      <div
        className="rounded-full"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: color
        }}
        data-testid="predeploy-status-circle"
      />
      <span data-testid="predeploy-status-text">{text}</span>
    </span>
  );
}