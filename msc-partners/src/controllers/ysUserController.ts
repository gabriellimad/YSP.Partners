import { Request, Response } from 'express';
import { generateRefreshToken, generateToken, sendPasswordResetEmail, verifyPassword, verifyRefreshToken, verifyResetToken } from '../service/ysAuthService';
import * as user from '../model/ysUserModel';
import {unauthorized, loginUserNotFound, passwordUserNotMatch, success, internalServerError, badRequest, created} from '../status/status';
import { User } from '../helpers/interfaces/ysUserObject';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
        const resultUser: User | null = await user.getUser(username);
        
        if (!resultUser) {
            res.status(unauthorized).json(loginUserNotFound);
            return;
        }

        const passwordMatch: boolean = await verifyPassword(password, resultUser.password_hash);
        
        if (!passwordMatch) {
            res.status(unauthorized).json(passwordUserNotMatch);
            return;
        }

        const token: string = generateToken(resultUser);
        const refreshToken = generateRefreshToken(resultUser);

        res.status(success).json({ 
            token,
            refreshToken, // Adiciona refreshToken na resposta
            user: {
                id: resultUser.id,
                username: resultUser.username,
                email: resultUser.email
            }
        });
    } catch (err) {
        console.error('Erro ao tentar fazer login:', err);
        res.status(internalServerError).json({ message: 'Erro ao tentar fazer login' });
    }
}

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(badRequest).json({ message: 'Refresh token é obrigatório' });
        return;
    }

    try {
        // Verifica se o refresh token é válido e obtém o usuário associado
        const userData = await verifyRefreshToken(refreshToken);

        if (!userData) {
            res.status(unauthorized).json({ message: 'Refresh token inválido ou expirado' });
            return;
        }

        // Gera um novo token de acesso
        const newAccessToken: string = generateToken(userData);

        res.status(success).json({ token: newAccessToken });
    } catch (err) {
        console.error('Erro ao tentar renovar o token:', err);
        res.status(internalServerError).json({ message: 'Erro ao tentar renovar o token' });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { masterKey } = req.params;
    const expectedMasterKey: string | undefined = process.env.MASTER_KEY;

    if (masterKey !== expectedMasterKey) {
        res.status(unauthorized).json({ message: 'Acesso negado: chave mestre inválida' });
        return;
    }

    const { username, password, email } = req.body;

    try {
        if (!username || !password || !email) {
            res.status(badRequest).json({ message: 'Todos os campos são obrigatórios' });
            return;
        }

        const newUser = await user.createUser(username, password, email);

        res.status(created).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            }
        });
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(internalServerError).json({ message: 'Erro ao cadastrar usuário' });
    }
}

export const requestPasswordReset = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
  
    try {
      await sendPasswordResetEmail(email);
      return res.status(200).json({ message: 'Email enviado com sucesso, verifique sua caixa de entrada.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao enviar o email. Tente novamente.' });
    }
  };
  
  export const resetPassword = async (req: Request, res: Response): Promise<any> => {
    const { token, newPassword } = req.body;
  
    try {
      await verifyResetToken(token, newPassword);
      return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }
  };

export default {
    login,
    createUser,
    requestPasswordReset,
    resetPassword
}
