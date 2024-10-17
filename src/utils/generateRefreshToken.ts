import jwt from "jsonwebtoken"

const generateRefreshToken = (id: string): string => {
  return jwt.sign({id, role: "user"}, process.env.JWT_REFRESH_SECRET_KEY as string, {
    expiresIn: '7d'
  })
}

export default generateRefreshToken