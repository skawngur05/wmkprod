import React from 'react';

/**
 * Ultra-simplified static dashboard for Safari mobile compatibility
 * No state, no hooks, plain HTML structure
 */
export default function MobileDashboard() {
  // Using direct window.location navigation to avoid any router issues
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ 
        backgroundColor: '#4a6cf7', 
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        marginBottom: '20px',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>
        Wrap My Kitchen CRM
      </div>
      
      <div style={{ padding: '15px' }}>
        <div style={{
          display: 'grid',
          gridGap: '15px',
          marginBottom: '30px'
        }}>
          <a href="/leads" style={{
            backgroundColor: '#4a6cf7',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>Leads</a>
          
          <a href="/follow-up-management" style={{
            backgroundColor: '#4a6cf7',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>Follow-Ups</a>
          
          <a href="/bookings" style={{
            backgroundColor: '#4a6cf7',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>Bookings</a>
          
          <a href="/calendar" style={{
            backgroundColor: '#4a6cf7',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>Calendar</a>
          
          <a href="/campaigns" style={{
            backgroundColor: '#4a6cf7',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>Campaigns</a>
          
          <a href="/tasks" style={{
            backgroundColor: '#4a6cf7',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>Tasks</a>
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          color: '#777', 
          padding: '15px',
          textAlign: 'center',
          borderTop: '1px solid #eee',
          marginTop: '20px'
        }}>
          <div>Safari Mobile Compatible View v4.0</div>
          <div>Ultra-simplified navigation dashboard</div>
          <div>Using direct HTML links for maximum compatibility</div>
        </div>
      </div>
    </div>
  );
}
