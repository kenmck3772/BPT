/**
 * BRAHAN SOVEREIGN IDENTITY PROVIDER
 * Pure Local Implementation - Zero External Dependencies
 */

const STORAGE_KEY = 'BRAHAN_AUTH_CONFIG';
const AUTH_KEY = 'BRAHAN_LOCAL_AUTH_USER';

export const isMockMode = true;

/**
 * SOVEREIGN AUTH ENGINE (LOCAL)
 * Standalone implementation to replace external SDKs.
 */
export const loginWithSovereignID = async () => {
  // Simulate network handshake
  await new Promise(r => setTimeout(r, 800));
  
  const ghostUser = {
    uid: "GHOST-NODE-ALPHA-" + Math.random().toString(36).substring(7).toUpperCase(),
    displayName: "Sovereign_Hunter",
    email: "hunter@brahan.seer",
    photoURL: "https://api.dicebear.com/7.x/identicon/svg?seed=brahan"
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(ghostUser));
  console.debug("SOVEREIGN_AUTH: Session established locally.");
  return ghostUser;
};

export const logoutSovereignNode = async () => {
  localStorage.removeItem(AUTH_KEY);
  window.location.reload();
};

/**
 * Observer for auth state changes.
 * Returns a cleanup function.
 */
export const onSovereignStateChange = (callback: (user: any | null) => void) => {
  const checkState = () => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      try {
        callback(JSON.parse(saved));
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
  };

  // Immediate check on subscription
  checkState();
  
  // No persistent socket/listener needed for pure local mock,
  // but we return a standard cleanup function for API compatibility.
  return () => {
    // No-op cleanup
  };
};

export const saveUplinkConfig = (newConfig: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  window.location.reload();
};

console.log(`%c>>> BRAHAN TERMINAL: SOVEREIGN IDENTITY LOCALIZED. [EXT_SDK_DISABLED]`, "color: #00FF41; font-weight: bold;");
