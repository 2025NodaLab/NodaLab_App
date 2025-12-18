// src/utils/devUser.js
export function setupDevUser() {
  if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", "student");
    localStorage.setItem("userName", "テスト生徒");
  }
}