/**
 * Admin Authentication Helper
 * Provides hardcoded credential authentication for admin panel
 * Uses sessionStorage for admin session management (isolated from user sessions)
 */

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123secure'
};

const ADMIN_SESSION_KEY = 'admin_session';

/**
 * Authenticate admin with hardcoded credentials
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export async function login(username, password) {
  // Simulate async operation (e.g., API call)
  await new Promise(resolve => setTimeout(resolve, 0));
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const session = {
      isAdmin: true,
      username: username,
      loginTime: new Date().toISOString()
    };
    
    // Store in sessionStorage (not localStorage) for isolation
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    }
    
    return { success: true };
  }
  
  return { success: false, error: 'Invalid admin credentials' };
}

/**
 * Logout admin and clear session
 */
export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

/**
 * Check if admin is authenticated
 * @returns {boolean} - True if admin session exists and is valid
 */
export function checkAuth() {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);
  
  if (!sessionData) {
    return false;
  }
  
  try {
    const session = JSON.parse(sessionData);
    return session.isAdmin === true;
  } catch (error) {
    console.error('Error parsing admin session:', error);
    return false;
  }
}

/**
 * Get current admin session data
 * @returns {Object|null} - Admin session object or null
 */
export function getSession() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);
  
  if (!sessionData) {
    return null;
  }
  
  try {
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error parsing admin session:', error);
    return null;
  }
}
