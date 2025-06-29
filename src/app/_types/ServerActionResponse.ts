export interface ServerActionResponse<T> {
  success: boolean;
  data: T;
  message: string; // 主にエラーメッセージなど
  metadata?: string; // JSON形式のメタ情報
}
