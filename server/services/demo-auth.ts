// Demo auth service

const DEMO_USER_EMAIL = "demo@ecommerce-analytics.com";
const DEMO_USER_NAME = "Demo User";

export function isDemoUser(email: string): boolean {
  return email === DEMO_USER_EMAIL;
}

export function isDemoMode(env: Record<string, string>): boolean {
  return env.DEMO_MODE === "true" || env.DEMO_MODE === "1";
}

export function getDemoUserCredentials() {
  return {
    email: DEMO_USER_EMAIL,
    name: DEMO_USER_NAME,
  };
}
