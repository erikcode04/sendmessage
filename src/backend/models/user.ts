import { ObjectId } from 'mongodb';

export interface User {
    _id?: ObjectId;
    id?: string;
    fullname: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt?: Date;
    lastLoginAt?: Date;
    contacts: {
        id: string;
        name: string;
        phoneNumber: string;
        messages: {
            id: string;
            text: string;
            sentAt: Date;
            sentBy: 'user' | 'contact';
        }[];
    }[];
}

export interface CreateUserRequest {
    fullname: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        fullname: string;
        email: string;
    };
}