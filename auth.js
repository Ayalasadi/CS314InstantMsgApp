//Aya Al-Asadi - auth.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const users = {}; //This should eventually be a database

export const register = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };
    return { username };
};

export const login = async (username, password) => {
    const user = users[username];
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username }, 'your-secret-key');
        return { token };
    }
    throw new Error('Invalid username or password');
};
