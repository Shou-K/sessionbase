"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faKey, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type FormData = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export default function ChangePasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<FormData>({ mode: "onChange" });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      const res = await fetch("/api/change_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        setError("root", { message: result.message });
      } else {
        setIsCompleted(true);
        reset();
      }
    });
  };

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faKey} className="mr-1.5" />
        パスワード変更
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-y-4"
      >
        <div>
          <label htmlFor="currentPassword" className="mb-2 block font-bold">
            現在のパスワード
          </label>
          <TextInputField
            {...register("currentPassword", { required: "必須です" })}
            id="currentPassword"
            placeholder="現在のパスワード"
            type="password"
            disabled={isPending || isCompleted}
            error={!!errors.currentPassword}
            autoComplete="current-password"
          />
          <ErrorMsgField msg={errors.currentPassword?.message} />
        </div>
        <div>
          <label htmlFor="newPassword" className="mb-2 block font-bold">
            新しいパスワード
          </label>
          <TextInputField
            {...register("newPassword", {
              required: "必須です",
              minLength: { value: 6, message: "6文字以上必須" },
            })}
            id="newPassword"
            placeholder="新しいパスワード"
            type="password"
            disabled={isPending || isCompleted}
            error={!!errors.newPassword}
            autoComplete="new-password"
          />
          <ErrorMsgField msg={errors.newPassword?.message} />
        </div>
        <div>
          <label htmlFor="newPasswordConfirm" className="mb-2 block font-bold">
            新しいパスワード（確認用）
          </label>
          <TextInputField
            {...register("newPasswordConfirm", {
              required: "必須です",
              validate: (value) =>
                value === newPassword || "新しいパスワードが一致しません",
            })}
            id="newPasswordConfirm"
            placeholder="もう一度入力"
            type="password"
            disabled={isPending || isCompleted}
            error={!!errors.newPasswordConfirm}
            autoComplete="new-password"
          />
          <ErrorMsgField msg={errors.newPasswordConfirm?.message} />
        </div>
        <ErrorMsgField msg={errors.root?.message} />
        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          disabled={!isValid || isSubmitting || isPending || isCompleted}
        >
          変更
        </Button>
      </form>
      {isCompleted && (
        <div className="mt-4 flex items-center gap-x-2">
          <FontAwesomeIcon icon={faSpinner} spin />
          <div>パスワードを変更しました。</div>
        </div>
      )}
    </main>
  );
}