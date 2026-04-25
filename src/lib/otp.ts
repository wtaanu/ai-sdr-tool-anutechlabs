import { createHash, randomInt } from "crypto";

export function createOtp() {
  return String(randomInt(100000, 1000000));
}

export function hashOtp(email: string, otp: string) {
  return createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${otp}:${process.env.OTP_SECRET || "dev-otp-secret"}`)
    .digest("hex");
}
