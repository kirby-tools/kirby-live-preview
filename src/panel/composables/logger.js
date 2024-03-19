import { createLogger } from "../utils/logger";

let instance;

export function useLogger() {
  return (instance ??= createLogger("preview"));
}
