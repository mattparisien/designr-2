import { Object } from "../core/object";

// Define once
export type OmitCreate<T> = Omit<T extends Object? T : never, "id" | "createdAt" | "updatedAt" | "createdBy">;
export type OmitUpdate<T> = Omit<T extends Object? T : never, "createdAt" | "updatedAt" | "createdBy">;

