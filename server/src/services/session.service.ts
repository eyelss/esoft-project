import { Session, User } from "../../generated/prisma";
import { InputJsonValue } from "../../generated/prisma/runtime/library";
import prisma from "../db";

const HOURS = 1;

export const createSession = async (owner: User, data: InputJsonValue = {}) => {
  const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * HOURS);

  return await prisma.session.create({
    data: {
      userId: owner.id,
      expiredAt,
      data,
    }
  });
}

export const verifySession = async (sessionId: Session['id']) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (session === null) {
    return null;
  }

  if (session.expiredAt < new Date()) {
    await destroySession(session.id);
    return null;
  }

  // if (session.userId !== user.id) {
  //   // Session id and user id are different
  //   // Probably unreachable code, right?
  //   return null;
  // }

  return session;
}

export const destroySession = async (sessionId: Session['id']) => {
  return await prisma.session.delete({
    where: { id: sessionId },
  })
}