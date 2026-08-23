/**
 * Instrumentation hook for Next.js 16.
 * Runs when the server starts — used for error monitoring setup.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Sentry or other error monitoring can be initialized here
    // Example:
    // await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    // await import('./sentry.edge.config');
  }
}

export const onRequestError = (
  err: { digest: string } & Error,
  request: { digest: string; path: string; method: string },
  context: { routerKind: string; routeType: string }
) => {
  // Report request-level errors to your error tracking service
  console.error(`[RequestError] ${request.method} ${request.path}:`, err.message);
  
  // In production, send to Sentry/Datadog/etc:
  // Sentry.captureException(err, { contexts: { request, context } });
};
