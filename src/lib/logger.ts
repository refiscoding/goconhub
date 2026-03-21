/**
 * Structured logger.
 *
 * - Production: JSON lines (for Vercel log drains / structured ingestion)
 * - Development: human-readable [LEVEL] message {context}
 * - Respects LOG_LEVEL env var (default: "info" in prod, "debug" in dev)
 */

type Level = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const LEVEL_ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const isProd = process.env.NODE_ENV === "production";

const MIN_LEVEL: Level =
  (process.env.LOG_LEVEL as Level | undefined) ?? (isProd ? "info" : "debug");

function shouldLog(level: Level): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function emit(level: Level, message: string, ctx?: LogContext) {
  if (!shouldLog(level)) return;

  const method = level === "debug" ? "log" : level;

  if (isProd) {
    const entry = { level, message, timestamp: new Date().toISOString(), ...ctx };
    console[method](JSON.stringify(entry));
  } else {
    const prefix = `[${level.toUpperCase()}]`;
    const extra = ctx ? ` ${JSON.stringify(ctx)}` : "";
    console[method](`${prefix} ${message}${extra}`);
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info:  (msg: string, ctx?: LogContext) => emit("info",  msg, ctx),
  warn:  (msg: string, ctx?: LogContext) => emit("warn",  msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
};
