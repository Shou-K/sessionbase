import { prisma } from "@/libs/prisma";
import { cookies } from "next/headers";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs"; // bcryptによる比較処理を追加

// キャッシュを無効化して毎回最新情報を取得
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const result = loginRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res);
    }
    const loginRequest = result.data;

    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });
    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // ✅ bcryptでハッシュ検証
    const isValidPassword = await bcrypt.compare(loginRequest.password, user.password);
    if (!isValidPassword) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res);
    }

    // セッションIDの作成
    const sessionTokenMaxAge = 60 * 60 * 3; // 3時間

    // ※ 本来は複数端末のセッションを分離すべき。
    // 今は単純に削除（必要に応じてIPアドレス・User-Agentで識別）
    await prisma.session.deleteMany({ where: { userId: user.id } });

    const session = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() + sessionTokenMaxAge * 1000),
      },
    });
    
    const res: ApiResponse<UserProfile> = {
      success: true,
      payload: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: "",
    };
    
    const response = NextResponse.json(res);
    response.cookies.set("session_id", session.id, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: sessionTokenMaxAge,
      secure: false, // 本番環境では true に変更
    });
    return response;

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログインのサーバサイドの処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
