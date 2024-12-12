"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id, role: "user" }, process.env.JWT_SECRET_KEY, {
        expiresIn: '2h'
    });
};
exports.default = generateToken;
// import jwt from "jsonwebtoken";
// // Generate Access Token (short-lived)
// const generateAccessToken = (id: string): string => {
//   return jwt.sign({ id, role: "user" }, process.env.JWT_SECRET_KEY as string, {
//     expiresIn: '15m', // Shorter lifespan for access token
//   });
// };
// // Generate Refresh Token (long-lived)
// const generateRefreshToken = (id: string): string => {
//   return jwt.sign({ id, role: "user" }, process.env.REFRESH_SECRET_KEY as string, {
//     expiresIn: '7d', // Longer lifespan for refresh token
//   });
// };
// export { generateAccessToken, generateRefreshToken };
