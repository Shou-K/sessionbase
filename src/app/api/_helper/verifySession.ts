// /app/_libs/getValidUserIdFromSession.ts
import { cookies } from "next/headers";
import { prisma } from "@/libs/prisma";

/**
 * セッションID付きクッキーから userId を取得（期限延長あり）
 * 無効な場合はセッションもクッキーも削除する
 */
export const verifySession = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  const now = new Date();
  if (!session || session.expiresAt <= now) {
    // 無効なセッションは削除
    await prisma.session.deleteMany({ where: { id: sessionId } });
    cookieStore.set("session_id", "", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 0,
      secure: false, // 本番は true に
    });
    return null;
  }

  // セッションの有効期限を延長
  const sessionTokenMaxAge = 60 * 60 * 3; // 3時間
  const newExpiry = new Date(now.getTime() + sessionTokenMaxAge * 1000);
  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiry },
  });

  cookieStore.set("session_id", sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: sessionTokenMaxAge,
    secure: false,
  });

  return session.userId;
};
