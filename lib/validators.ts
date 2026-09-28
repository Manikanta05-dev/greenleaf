import {z} from 'zod';
export const registerSchema=z.object({name:z.string().min(2),email:z.string().email(),password:z.string().min(8),phone:z.string().optional()});
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(1)});
export const addressSchema=z.object({label:z.string().min(1),line1:z.string().min(3),line2:z.string().optional(),city:z.string().min(2),state:z.string().min(2),postalCode:z.string().min(4),country:z.string().min(2),phone:z.string().optional()});
export const checkoutSchema=z.object({items:z.array(z.object({productId:z.string(),quantity:z.number().int().min(1)})).min(1),addressId:z.string()});
