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
exports.UserService = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    registerUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userName, email, password } = userData;
            const existingEmail = yield this.userRepository.findByEmail(email);
            if (existingEmail) {
                throw new Error("Email already exists");
            }
            const existingUsername = yield this.userRepository.findByUsername(userName);
            if (existingUsername) {
                throw new Error("Username already exists");
            }
            const otp = speakeasy_1.default.totp({
                secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
                digits: 4,
            });
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(password, salt);
            const sessionData = {
                userDetails: Object.assign(Object.assign({}, userData), { password: hashedPassword }),
                otp,
                otpGeneratedTime: Date.now(),
            };
            return { otp, sessionData };
        });
    }
}
exports.UserService = UserService;
