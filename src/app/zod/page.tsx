"use client";
import React from "react";
import { userSeedSchema } from "@/app/_types/UserSeed";
import { Role } from "@/app/_types/Role";

const Page: React.FC = () => {
  // 検証対象のデータ01
  const unsafeUserSeed_01 = {
    name: "",
    password: "123",
    email: "hoge hoge",
    role: "Admin",
  };

  // 検証対象のデータ02
  const unsafeUserSeed_02 = {
    name: "寝屋川 タヌキ",
    password: "12345",
    email: "tanuki@example.com",
    role: Role.ADMIN,
    age: 8, // 余分なプロパティ（フィールド）
  };

  const unsafeUserSeed = unsafeUserSeed_01; // 01 or 02

  // 検証 (バリデーション)
  const result = userSeedSchema.safeParse(unsafeUserSeed);
  if (!result.success) {
    console.log("▼ Validation NG ▼");
    console.log(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  }
  const userSeed = result.data ?? null;
  if (userSeed) {
    console.log("▼ Validation OK ▼");
    console.log(JSON.stringify(userSeed, null, 2));
  }
  // 👆 開発モードでは同じ処理が2回走るためログが重複します（Reactの特性）。

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">zod</div>
      <div className="mt-4 text-sm text-slate-600">
        <p>
          ※
          開発者ツールの「コンソール」から検証結果（バリデーション結果）を確認してください。
        </p>
      </div>
    </main>
  );
};

export default Page;
