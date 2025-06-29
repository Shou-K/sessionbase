import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/libs/prisma";

export const POST = async (req: NextRequest) => {
  const { currentPassword, newPassword, newPasswordConfirm } = await req.json();

  // クッキーからsession_idを取得
  const sessionId = req.cookies.get("session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }

  // セッションからユーザーIDを取得
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
  }
  const userId = session.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ success: false, message: "ユーザーが見つかりません" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ success: false, message: "現在のパスワードが正しくありません" }, { status: 400 });
  }

  if (newPassword !== newPasswordConfirm) {
    return NextResponse.json({ success: false, message: "新しいパスワードが一致しません" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return NextResponse.json({ success: true, message: "パスワードを変更しました" });
};