"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const userModel_1 = __importDefault(require("../models/user/userModel"));
class UserRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return userModel_1.default.findOne({ email }).exec();
        });
    }
    findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return userModel_1.default.findOne({ userName: username }).exec();
        });
    }
    create(userDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new userModel_1.default(userDetails);
            return user.save();
        });
    }
}
exports.UserRepository = UserRepository;
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
