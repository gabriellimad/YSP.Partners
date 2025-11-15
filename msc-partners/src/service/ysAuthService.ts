import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendEmail } from './ysMailService';
import { getUserByEmail, getUserById, updateUser } from '../model/ysUserModel';

type User = {
  id: string;
  username: string;
};

const SECRET_KEY = process.env.JWT_SECRET as string;
const TOKEN_EXPIRATION = '1h'; // 1 hora

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: '12h' });
}

export async function verifyPassword(inputPassword: string, storedPasswordHash: string): Promise<boolean> {
  return await bcrypt.compare(inputPassword, storedPasswordHash);
}

// Enviar email de recuperação de senha
export const sendPasswordResetEmail = async (email: string) => {
  const user = await getUserByEmail( email );
  if (!user) throw new Error('Usuário não encontrado.');

  const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail(email, 'Recuperação de Senha', `Clique no link para redefinir sua senha: ${resetLink}`);
};

// Verificar token e redefinir senha
export const verifyResetToken = async (token: string, newPassword: string) => {
  let userId;

  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    userId = decoded.id;
  } catch (error) {
    throw new Error('Token inválido ou expirado.');
  }

  const user = await getUserById(userId);
  if (!user) throw new Error('Usuário não encontrado.');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password_hash = hashedPassword;
  await updateUser(userId, user);
};

export const verifyRefreshToken = async (refreshToken: string): Promise<any | null> => {
  try {
      const decoded: any = jwt.verify(refreshToken, SECRET_KEY);
      const foundUser = await getUserById(decoded.id);
      return foundUser ? decoded : null;
  } catch (error) {
      return null; // Token inválido ou expirado
  }
};

export const generateRefreshToken = (user: any): string => {
  return jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1d' });
};

export default {
  generateToken,
  verifyPassword,
};
