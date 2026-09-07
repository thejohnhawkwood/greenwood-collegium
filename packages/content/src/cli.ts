import { loadBundledWorld } from "./load.js";
import { ContentValidationError } from "./validate.js";

try {
  const world = loadBundledWorld();
  const enemyCount = Object.keys(world.enemies).length;
  process.stdout.write(
    `loaded ${String(Object.keys(world.rooms).length)} rooms, ${String(Object.keys(world.items).length)} items, and ${String(enemyCount)} ${enemyCount === 1 ? "enemy" : "enemies"}\n`,
  );
} catch (error) {
  const message =
    error instanceof ContentValidationError ? error.message : "world content failed validation";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
