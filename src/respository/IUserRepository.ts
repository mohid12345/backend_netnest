import UserInterface from '../models/user/userTypes';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserInterface | null>;
  findByUsername(username: string): Promise<UserInterface | null>;
  create(userDetails: Partial<UserInterface>): Promise<UserInterface>;
}