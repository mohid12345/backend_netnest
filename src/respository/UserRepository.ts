
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


