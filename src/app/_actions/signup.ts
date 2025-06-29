"use server";

import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs"; // bcryptjs でも OK（bcrypt よりビルドしやすい）
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import type { SignupRequest } from "@/app/_types/SignupRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ServerActionResponse } from "@/app/_types/ServerActionResponse";

// ユーザのサインアップのサーバアクション
export const signupServerAction = async (
  signupRequest: SignupRequest,
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    // 入力検証
    const payload = signupRequestSchema.parse(signupRequest);

    // 💡スパム登録対策（1秒遅延）
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 既に登録済みユーザのサインアップではないか確認
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      return {
        success: false,
        data: null,
        message: "このメールアドレスは既に使用されています。",
      };
    }

    // ✅ パスワードのハッシュ化（安全な保存）
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // ユーザの作成
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword, // ハッシュ化されたパスワードを保存
        name: payload.name,
      },
    });

    // レスポンス（不要な情報は含めない）
    const res: ServerActionResponse<UserProfile> = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: "",
    };
    return res;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    return {
      success: false,
      data: null,
      message: "サインアップのサーバサイドの処理に失敗しました。", // ✅ ユーザには安全なエラー表示
    };
  }
};
