import { Redirect } from 'expo-router';

/**
 * Root Index
 * 
 * In Expo Router, the root app/index.tsx is the entry point for the '/' route.
 * We use it to ensure the layout's redirect logic has a stable target to start from.
 * 
 * The actual redirection logic is handled in the root _layout.tsx based on Auth state.
 */
export default function RootIndex() {
  // We don't perform logic here to keep the Auth flow centralized in _layout.tsx
  // This just acts as a placeholder that gets "pushed" or "replaced" by the layout.
  return null;
}
