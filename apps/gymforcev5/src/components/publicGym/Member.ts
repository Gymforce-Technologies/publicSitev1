export function getMemberToken() {
  return localStorage.getItem("member_token");
}

export function setMemberToken(token: string) {
  localStorage.setItem("member_token", token);
}
