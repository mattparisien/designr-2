import mongoose from "mongoose";


// Recursively calls .toJSON() on Mongoose docs/arrays, otherwise returns value as-is
export function toJSONDeep(input: any): any {
  if (Array.isArray(input)) {
    return input.map(toJSONDeep);
  }
  if (input instanceof Date) {
    return input.toISOString(); // or just `return input;` if you want Date object
  }
  if (
    input &&
    typeof input === "object" &&
    typeof input.toJSON === "function" &&
    input.constructor?.name !== 'Object'
  ) {
    // Avoid re-processing plain objects
    return toJSONDeep(input.toJSON());
  }
  if (input && typeof input === "object") {
    const result: any = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key] = toJSONDeep(input[key]);
      }
    }
    return result;
  }
  return input;
}
