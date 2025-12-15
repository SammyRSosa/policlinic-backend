export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`❌ Missing env var: ${name}`);
  }
  return value;
}

export function getEnvNumber(name: string, fallback?: number): number {
  const raw = process.env[name];
  if (raw === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`❌ Missing env var: ${name}`);
  }
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`❌ Env var ${name} must be a number`);
  }
  return value;
}
