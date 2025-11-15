import bcrypt from 'bcrypt';
import connectAndQuery from './ysConnection';

type User = {
    id: string;
    username: string;
    password_hash: string;
    email: string;
};

export async function createUser(username: string, password: string, email: string): Promise<User> {
    const existingUserResult = await connectAndQuery<User>('SELECT * FROM users WHERE username = $1', [username]);

    if (existingUserResult.rows.length > 0) {
        throw new Error('Usuário já existe');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const sqlCommand = `
        INSERT INTO users (username, password_hash, email) 
        VALUES ($1, $2, $3) RETURNING id, username, password_hash, email
    `;
    const params = [username, passwordHash, email];

    const result = await connectAndQuery<User>(sqlCommand, params);

    if (result.rows.length === 0) {
        throw new Error('Erro ao criar o usuário');
    }

    return result.rows[0];
}

export async function getUser(username: string): Promise<User> {
    const sqlCommand = `SELECT * FROM users WHERE username = $1`;
    const userResult = await connectAndQuery<User>(sqlCommand, [username]);

    if (userResult.rows.length === 0) {
        throw new Error('Usuário não encontrado');
    }

    return userResult.rows[0]; // Retorna o usuário encontrado
}

export async function getUserById(id: string): Promise<User> {
    const sqlCommand = `SELECT * FROM users WHERE id = $1`;
    const userResult = await connectAndQuery<User>(sqlCommand, [id]);

    if (userResult.rows.length === 0) {
        throw new Error('Usuário não encontrado');
    }

    return userResult.rows[0]; // Retorna o usuário encontrado
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
    const fields = Object.keys(updates).map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = Object.values(updates);

    if (!fields) {
        throw new Error('Nenhum campo para atualizar');
    }

    const sqlCommand = `
        UPDATE users
        SET ${fields}
        WHERE id = $1
        RETURNING id, username, password_hash, email
    `;

    const params = [id, ...values];
    const result = await connectAndQuery<User>(sqlCommand, params);

    if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado ou não atualizado');
    }

    return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User> {
    const sqlCommand = `SELECT * FROM users WHERE email = $1`;
    const result = await connectAndQuery<User>(sqlCommand, [email]);

    if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
    }

    return result.rows[0];
}

export default {
    createUser,
    getUser
};
