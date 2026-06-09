import * as Sentry from '@sentry/react-native';

const sentryDsn = process.env.SENTRY_DSN || '';
const environment = process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry Error Tracking.
 * Call this function at the entry point of your mobile application (e.g., App.tsx / index.js).
 */
export function initSentry(): void {
  if (!sentryDsn) {
    console.warn('Sentry DSN is missing. Sentry will not capture errors.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: environment,
    debug: environment === 'development', // Enable debug output in local dev
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // In production, adjust this rate to a lower value (e.g., 0.1 or 0.2) to conserve quota.
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    
    // Catch native crashes (Android/iOS)
    enableNative: true,
    enableNativeCrashHandling: true,
  });
  
  if (environment !== 'development') {
    console.log('[Sentry] Initialized error and performance monitoring.');
  }
}

/**
 * Wrap the root component of your application to automatically capture component-level crashes.
 * Usage: export default Sentry.wrap(App);
 */
export function wrapRootComponent<T extends React.ComponentType<any>>(rootComponent: T): T {
  return Sentry.wrap(rootComponent);
}
