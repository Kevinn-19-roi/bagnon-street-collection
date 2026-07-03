import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(200),
  sku: z.string().min(2, 'SKU invalide').max(50),
  description: z.string().optional(),
  short_description: z.string().max(300).optional(),
  category_id: z.string().uuid('Catégorie invalide'),
  collection_id: z.string().uuid().optional().nullable(),
  price: z.coerce.number().positive('Prix invalide'),
  old_price: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  featured: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  on_sale: z.boolean().default(false),
  active: z.boolean().default(true),
  weight: z.coerce.number().positive().optional().nullable(),
  material: z.string().optional(),
  care_instructions: z.string().optional(),
})

export const CategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug invalide (lettres minuscules et tirets)'),
  description: z.string().optional(),
  active: z.boolean().default(true),
  display_order: z.coerce.number().int().min(0).default(0),
})

export const CollectionSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  active: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof ProductSchema>
export type CategoryInput = z.infer<typeof CategorySchema>
export type CollectionInput = z.infer<typeof CollectionSchema>
