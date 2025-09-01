import React from 'react';
import UserDeleteTest from './UserDeleteTest';

const SettingsSection = () => {
  return (
    <div className="settings-section">
      <h2>System Settings</h2>
      <div className="settings-grid">
        <div className="setting-card">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>Site Name</label>
            <input type="text" defaultValue="KrishiLink" />
          </div>
          <div className="setting-item">
            <label>Maintenance Mode</label>
            <input type="checkbox" />
          </div>
          <div className="setting-item">
            <label>Registration Enabled</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>Email Settings</h3>
          <div className="setting-item">
            <label>SMTP Server</label>
            <input type="text" defaultValue="smtp.gmail.com" />
          </div>
          <div className="setting-item">
            <label>SMTP Port</label>
            <input type="number" defaultValue="587" />
          </div>
          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>Security Settings</h3>
          <div className="setting-item">
            <label>Session Timeout (minutes)</label>
            <input type="number" defaultValue="30" />
          </div>
          <div className="setting-item">
            <label>Two-Factor Authentication</label>
            <input type="checkbox" />
          </div>
          <div className="setting-item">
            <label>Rate Limiting</label>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
        
        <div className="setting-card">
          <h3>Backup & Maintenance</h3>
          <button className="btn-backup">Create Backup</button>
          <button className="btn-cleanup">Cleanup Logs</button>
          <button className="btn-optimize">Optimize Database</button>
        </div>
      </div>

      {/* Security Testing Section */}
      <div className="security-testing-section">
        <UserDeleteTest />
      </div>
    </div>
  );
};

export default SettingsSection;
