import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days