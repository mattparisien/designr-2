import mongoose from "mongoose";

export const mapMongoDocument = <T extends mongoose.Document,S>(response: T): S => {
  // Map the response as needed
  return response as unknown as S;
}