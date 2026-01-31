/**
 * LEGACY FIREBASE REDIRECT
 * Redirects all legacy identity calls to the Sovereign Local provider.
 */

import { 
  loginWithSovereignID, 
  logoutSovereignNode, 
  onSovereignStateChange, 
  isMockMode 
} from './authService';

export { 
  loginWithSovereignID, 
  logoutSovereignNode, 
  onSovereignStateChange, 
  isMockMode 
};

// Prevent Firebase SDK from triggering internal registry errors
// by ensuring no calls to getAuth() or initializeApp() are made.
console.log(`%c>>> BRAHAN TERMINAL: FIREBASE_SDK_OVERRIDE_ACTIVE.`, "color: #ef4444; font-weight: bold;");
