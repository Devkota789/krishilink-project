import React, { useState } from 'react';

const UserDeleteTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testUserDeletePermissions = async () => {
    setLoading(true);
    setTestResults([]);
    
    const results = [];
    
    try {
      // Test 1: Try to access admin delete endpoint
      results.push({ test: 'Admin Delete Endpoint', status: 'Testing...' });
      
      const { adminAPI } = await import('../../api/adminAPI');
      const testUserId = 'test-user-id-123';
      
      try {
        const response = await adminAPI.deleteUser(testUserId);
        results.push({ 
          test: 'Admin Delete Endpoint', 
          status: response.success ? '✅ Accessible' : '❌ Failed',
          details: response.error || 'Success'
        });
      } catch (error) {
        results.push({ 
          test: 'Admin Delete Endpoint', 
          status: '❌ Error',
          details: error.message
        });
      }

      // Test 2: Try to access regular user delete endpoint
      results.push({ test: 'Regular User Delete Endpoint', status: 'Testing...' });
      
      const { userAPI } = await import('../../api/api');
      
      try {
        const response = await userAPI.deleteUser(testUserId);
        results.push({ 
          test: 'Regular User Delete Endpoint', 
          status: response.success ? '⚠️ Accessible (Security Risk!)' : '✅ Properly Restricted',
          details: response.error || 'Success'
        });
      } catch (error) {
        results.push({ 
          test: 'Regular User Delete Endpoint', 
          status: '✅ Properly Restricted',
          details: error.message
        });
      }

      // Test 3: Check authentication status
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      results.push({ 
        test: 'Authentication Status', 
        status: user && token ? '✅ Authenticated' : '❌ Not Authenticated',
        details: user ? `User: ${JSON.parse(user).role || 'unknown'}` : 'No user data'
      });

    } catch (error) {
      results.push({ 
        test: 'Test Execution', 
        status: '❌ Error',
        details: error.message
      });
    }
    
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="user-delete-test">
      <h3>User Delete Permission Test</h3>
      <p>This test verifies that user deletion is properly secured and only accessible to admins.</p>
      
      <button 
        onClick={testUserDeletePermissions}
        disabled={loading}
        className="btn-test"
      >
        {loading ? 'Testing...' : 'Run Permission Test'}
      </button>

      {testResults.length > 0 && (
        <div className="test-results">
          <h4>Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className={`test-result ${result.status.includes('✅') ? 'success' : result.status.includes('❌') ? 'error' : 'warning'}`}>
              <strong>{result.test}:</strong> {result.status}
              {result.details && <div className="test-details">{result.details}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="security-recommendations">
        <h4>Security Recommendations:</h4>
        <ul>
          <li>✅ Admin delete endpoint should be accessible only to admin users</li>
          <li>❌ Regular user delete endpoint should be restricted to prevent unauthorized deletions</li>
          <li>✅ All delete operations should require proper authentication</li>
          <li>✅ Consider implementing soft delete instead of hard delete for data recovery</li>
          <li>✅ Log all delete operations for audit purposes</li>
        </ul>
      </div>
    </div>
  );
};

export default UserDeleteTest;

