// userService.ts
import { UserRepository } from "../respository/UserRepository";
import speakeasy from "speakeasy";
import bcrypt from "bcrypt";
import { IUserDetails } from "../models/user/userTypez";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(userData: IUserDetails): Promise<{ otp: string; sessionData: any }> {
    const { userName, email, password } = userData;

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const existingUsername = await this.userRepository.findByUsername(userName);
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sessionData = {
      userDetails: { ...userData, password: hashedPassword },
      otp,
      otpGeneratedTime: Date.now(),
    };

    return { otp, sessionData };
  }
}
