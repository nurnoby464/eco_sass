import jwt, { Secret } from "jsonwebtoken";
import mongoose, { ObjectId } from "mongoose";
import type { StringValue } from "ms";

export interface ITokenPayload {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  role: string;
  company_id: mongoose.Types.ObjectId | null;
  sessionId: string;
}
interface IGenerateToken {
  data: ITokenPayload;
  secret: Secret;
  expiresIn: StringValue;
}
interface IVerifyToken {
  token: string;
  secret: string;
}

const generateToken = (payload: IGenerateToken): string => {
  return jwt.sign(payload.data, payload.secret, {
    algorithm: "HS256",
    expiresIn: payload.expiresIn,
  });
};
const verifyToken = (payload: IVerifyToken) : ITokenPayload => {
  return jwt.verify(payload.token, payload.secret) as ITokenPayload;
};

export const JwtHelper = {
  generateToken,
  verifyToken,
};
