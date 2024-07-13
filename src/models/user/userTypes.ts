import {Document, Types} from "mongoose"

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
}

interface UserInterface extends Document {
    userName: string;
    name: string;
    email: string;
    phone?: string;
    password: string;
    profileImg?: string;
    bio?: string;
    gender?: string;
    isBlocked: boolean;
}

export default UserInterface