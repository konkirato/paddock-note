// 観察入力・結果入力画面は画面下部に保存ボタンが固定され、ヘッダー右側も
// 別のボタンで埋まっているため、共通のナビ/ログアウトボタンは表示しない。
export function isImmersiveRoute(pathname: string) {
  return pathname.includes("/observe") || pathname.includes("/result");
}
