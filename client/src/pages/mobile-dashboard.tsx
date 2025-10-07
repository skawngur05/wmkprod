import React from 'react';
import { useAuth } from '@/contexts/auth-context';

/**
 * Static dashboard for Safari mobile compatibility
 * Zero state management, just static HTML
 */
export default function MobileDashboard() {
  const { user } = useAuth();
  
  // Directly navigate via window.location instead of React router
  const navigateToLeads = () => {
    window.location.href = '/leads';
  };
  
  const navigateToFollowups = () => {
    window.location.href = '/followups';
  };
  
  const navigateToAddLead = () => {
    window.location.href = '/add-lead';
  };
  
  const refreshPage = () => {
    window.location.reload();
  };
  
  // Static HTML-only approach for maximum compatibility
  return (
    <div>
      <table width="100%" cellPadding="10" cellSpacing="0" border="0">
        <tbody>
          <tr>
            <td colSpan={2} align="center" style={{backgroundColor: '#f0f0f0', padding: '10px'}}>
              <b>Mobile Dashboard</b>
              {user && <div>Welcome, {user.username}</div>}
            </td>
          </tr>
          <tr>
            <td colSpan={2} align="center">
              <button 
                onClick={refreshPage}
                style={{
                  margin: '10px 0',
                  padding: '5px 10px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc'
                }}
              >
                Refresh
              </button>
            </td>
          </tr>
          <tr>
            <td width="50%" align="center" style={{border: '1px solid #ccc', padding: '15px'}}>
              <button 
                onClick={navigateToLeads}
                style={{
                  width: '100%',
                  padding: '20px 0',
                  backgroundColor: '#0d6efd',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                View Leads
              </button>
            </td>
            <td width="50%" align="center" style={{border: '1px solid #ccc', padding: '15px'}}>
              <button 
                onClick={navigateToFollowups}
                style={{
                  width: '100%',
                  padding: '20px 0',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                View Followups
              </button>
            </td>
          </tr>
          <tr>
            <td colSpan={2} align="center" style={{padding: '15px'}}>
              <button 
                onClick={navigateToAddLead}
                style={{
                  width: '100%',
                  padding: '20px 0',
                  backgroundColor: '#198754',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Add New Lead
              </button>
            </td>
          </tr>
          <tr>
            <td colSpan={2} align="center" style={{fontSize: '12px', color: '#777', padding: '15px'}}>
              <div>Safari Mobile Compatible View v3.0</div>
              <div>This is a static navigation dashboard.</div>
              <div>No data is loaded for maximum compatibility.</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

  // Handle network issues for Safari
  useEffect(() => {
    const handleOnline = () => {
      console.log('Mobile Dashboard: Network is back online');
      // Auto-refresh when network comes back
      if (error.includes('network')) {
        refreshData();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [error]);

  // Simple fetch function without React Query
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Log before fetch
        console.log('Mobile Dashboard: Starting API fetch');
        
        // Fetch stats with explicit options for Safari
        const statsResponse = await fetch('/api/dashboard/stats', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Mobile Dashboard: Stats API response status:', statsResponse.status);
        
        if (!statsResponse.ok) {
          throw new Error(`HTTP error! status: ${statsResponse.status}`);
        }
        
        const statsData = await statsResponse.json();
        console.log('Dashboard stats loaded:', statsData);
        setStats(statsData);
        
        // Fetch recent leads
        const leadsResponse = await fetch('/api/leads?limit=5&sort=created_at:desc', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Mobile Dashboard: Leads API response status:', leadsResponse.status);
        
        if (!leadsResponse.ok) {
          throw new Error(`HTTP error! status: ${leadsResponse.status}`);
        }
        
        const leadsData = await leadsResponse.json();
        console.log('Recent leads loaded:', leadsData);
        setRecentLeads(leadsData.leads || []);
        
        setLastRefresh(new Date());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigation handlers
  const goToLeads = () => setLocation('/leads');
  const goToFollowups = () => setLocation('/followups');
  const goToSoldLeads = () => setLocation('/leads?status=sold');
  const goToNewLeads = () => setLocation('/leads?filter=today');
  
  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      console.log('Mobile Dashboard: Refreshing data');
      
      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Force fresh data
      });
      
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();
      console.log('Refreshed stats:', statsData);
      setStats(statsData);
      
      // Skip fetching leads on refresh to keep it lightweight
      
      setLastRefresh(new Date());
      setLoading(false);
      
      // Confirm refresh with visual feedback
      alert('Dashboard refreshed successfully!');
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError(`Failed to refresh data: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
      alert('Failed to refresh. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', backgroundColor: '#fff' }}>
      <div style={{ 
        marginBottom: '10px',
        backgroundColor: '#f1f5f9', 
        padding: '10px',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>
          Welcome, {user ? capitalizeFirst(user.username) : 'User'}
        </h1>
        <button 
          onClick={refreshData} 
          style={{
            backgroundColor: '#0d6efd',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Loading...
        </div>
      ) : error ? (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px' 
        }}>
          {error}
        </div>
      ) : (
        <>
          {/* Stats Cards - Super Simple */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            {/* Total Leads */}
            <div 
              onClick={goToLeads}
              style={{
                backgroundColor: '#e6f7ff',
                padding: '15px',
                borderRadius: '5px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '13px', marginBottom: '5px' }}>Total Leads</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{stats.totalLeads}</div>
            </div>
            
            {/* Sold Leads */}
            <div 
              onClick={goToSoldLeads}
              style={{
                backgroundColor: '#d4edda',
                padding: '15px',
                borderRadius: '5px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '13px', marginBottom: '5px' }}>Sold Leads</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{stats.soldLeads}</div>
            </div>
            
            {/* Today's Followups */}
            <div 
              onClick={goToFollowups}
              style={{
                backgroundColor: '#fff3cd',
                padding: '15px',
                borderRadius: '5px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '13px', marginBottom: '5px' }}>Today's Followups</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{stats.todayFollowups}</div>
            </div>
            
            {/* New Today */}
            <div 
              onClick={goToNewLeads}
              style={{
                backgroundColor: '#cfe2ff',
                padding: '15px',
                borderRadius: '5px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '13px', marginBottom: '5px' }}>New Today</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{stats.newToday}</div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setLocation('/add-lead')} 
                style={{
                  flex: 1,
                  backgroundColor: '#198754',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '5px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              >
                Add Lead
              </button>
              
              <button 
                onClick={goToFollowups} 
                style={{
                  flex: 1,
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '5px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              >
                Followups
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ 
            fontSize: '11px',
            color: '#6c757d',
            textAlign: 'center',
            padding: '10px',
            borderTop: '1px solid #dee2e6',
            marginTop: '20px'
          }}>
            <div>Mobile Dashboard v1.2</div>
            <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
          </div>
        </>
      )}
    </div>
  );
}
