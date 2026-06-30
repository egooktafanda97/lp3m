import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb, logAktivitas } from "./db";
import { ROLES, SESSION_COOKIE } from "./constants";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "lp3m-uniks-dev-secret-change-in-production"
);

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    nama: user.nama,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;

  const user = getDb()
    .prepare(
      "SELECT id, nama, email, role, is_active, created_at FROM users WHERE id = ?"
    )
    .get(session.id);

  if (!user || !user.is_active) return null;
  return user;
}

export async function requireAuth(allowedRoles = null) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized", status: 401, user: null };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { error: "Forbidden", status: 403, user: null };
  }
  return { error: null, status: 200, user };
}

export function registerPeserta({ nama, email, password, nomor_identitas, prodi, no_hp }) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  const hash = bcrypt.hashSync(password, 10);
  const insertUser = db.prepare(
    "INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)"
  );
  const insertProfil = db.prepare(
    "INSERT INTO peserta_profil (user_id, nomor_identitas, prodi, no_hp) VALUES (?, ?, ?, ?)"
  );

  const tx = db.transaction(() => {
    const result = insertUser.run(nama, email, hash, ROLES.PESERTA);
    insertProfil.run(result.lastInsertRowid, nomor_identitas, prodi, no_hp);
    return result.lastInsertRowid;
  });

  const userId = tx();
  logAktivitas(userId, "registrasi_peserta", email);
  return { userId };
}

export function loginUser(email, password) {
  const db = getDb();
  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND is_active = 1")
    .get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { error: "Email atau password salah" };
  }

  logAktivitas(user.id, "login", user.role);
  return {
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    },
  };
}
