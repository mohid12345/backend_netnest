
// UserRepository with interface as IUserRepository
import { IUserRepository } from './IUserRepository';
import User from '../models/user/userModel';
import UserInterface from '../models/user/userTypes';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserInterface | null> {
    return User.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<UserInterface | null> {
    return User.findOne({ userName: username }).exec();
  }

  async create(userDetails: Partial<UserInterface>): Promise<UserInterface> {
    const user = new User(userDetails);
    return user.save();
  }
}






//working wiithout interface
//test 1
// userRepository.ts
// import User from "../models/user/userModel"; // Assume you have a User model defined

// export class UserRepository {
//   async findUserByEmail(email: string) {
//     return await User.findOne({ email }).exec();
//   }

//   async findUserByUsername(username: string) {
//     return await User.findOne({ userName: username }).exec();
//   }

//   async createUser(userDetails: any) {
//     const newUser = new User(userDetails);
//     return await newUser.save();
//   }
// }






// old

// import User from '../models/user/userModel';
// import Connections from '../models/connections/connectionModel';

// export const findUserByEmail = async (email: string) => {
//   return await User.findOne({ email });
// };

// export const findUserByUsername = async (userName: string) => {
//   return await User.findOne({ userName });
// };

// export const createUser = async (userData: any) => {
//   return await User.create(userData);
// };

// export const createConnection = async (userId: string) => {
//   return await Connections.create({ userId });
// };


