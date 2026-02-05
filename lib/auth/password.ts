import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // The cost factor controls how much time is needed to calculate a single BCrypt hash.

export async function hashPassword(password: string){
    return await bcrypt.hash(password, SALT_ROUNDS);
}