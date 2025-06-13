import prisma from "../db";
import argon2 from "argon2";
import { User } from "../../generated/prisma";

type CreateUserDto = {
  login: User['login'];
  password: string;
};

export const createUser = async (userData: CreateUserDto) => {
  return prisma.user.create({
    data: {
      login: userData.login,
      hashPassword: await argon2.hash(userData.password),
    }
  });
}

export const findUserById = async (id: User['id']) => {
  return prisma.user.findUnique({
    where: { id },
  });
}

export const findUserByLogin = async (login: User['login']) => {
  return prisma.user.findUnique({
    where: { login }
  });
}

type UpdateUserDto = Partial<CreateUserDto>;

export const updateUserById = async (id: User['id'], userData: UpdateUserDto) => {
  return prisma.user.update({
    where: { id },
    data: { ...userData },
  });
}

export const verifyUser = async (login: User['login'], password: string): Promise<User> => {
  const user = await prisma.user.findUnique({ where: { login }});

  if (user === null) {
    throw new Error('User is not found');
  }

  const verificationResult = await argon2.verify(user.hashPassword, password);
  
  if (!verificationResult) {
    throw new Error('Verification falied');
  }

  return user;
}

export const getUsers = async () => {
  return prisma.user.findMany();
}