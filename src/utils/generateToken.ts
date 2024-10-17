import jwt from "jsonwebtoken"

const generateToken = (id: string): string => {
  return jwt.sign({id, role: "user"}, process.env.JWT_SECRET_KEY as string, {
    expiresIn: '2h'
  })
}

export default generateToken

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
