import { loadBundledWorld } from "./load.js";
import { ContentValidationError } from "./validate.js";

try {
  const world = loadBundledWorld();
  process.stdout.write(`loaded ${String(Object.keys(world.rooms).length)} rooms\n`);
} catch (error) {
  const message =
    error instanceof ContentValidationError ? error.message : "world content failed validation";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
