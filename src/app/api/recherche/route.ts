import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/database/products'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() || ''
  const page = Math.max(1, Number(url.searchParams.get('page') || 1) || 1)

  if (!query) {
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 1 })
  }

  try {
    const result = await getProducts({ search: query, page, per_page: 6 })
    return NextResponse.json({
      products: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.total_pages,
    })
  } catch {
    return NextResponse.json({ error: 'Recherche impossible pour le moment.' }, { status: 500 })
  }
}
