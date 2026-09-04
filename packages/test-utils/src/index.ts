export function expectDefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("expected a defined value");
  }
  return value;
}
