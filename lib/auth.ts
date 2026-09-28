import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { db } from './db';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'development-secret-change-me');
export async function hashPassword(p:string){return bcrypt.hash(p,12)}
export async function verifyPassword(p:string,h:string){return bcrypt.compare(p,h)}
export async function setSession(user:{id:string;role:string}){const token=await new SignJWT({role:user.role}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(secret);(await cookies()).set('session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7})}
export async function clearSession(){(await cookies()).delete('session')}
export async function getSession(){const token=(await cookies()).get('session')?.value;if(!token)return null;try{const {payload}=await jwtVerify(token,secret);return payload.sub?{id:payload.sub,role:String(payload.role)}:null}catch{return null}}
export async function requireUser(){const s=await getSession();if(!s)throw new Error('UNAUTHORIZED');const user=await db.user.findUnique({where:{id:s.id}});if(!user)throw new Error('UNAUTHORIZED');return user}
export async function requireAdmin(){const u=await requireUser();if(u.role!=='ADMIN')throw new Error('FORBIDDEN');return u}
