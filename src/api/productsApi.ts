import { get } from './client'
import type { ProductsData, ProductsParams } from './types'

export const productsApi = {
  getProducts: (params?: ProductsParams) =>
    get<ProductsData>('/api/products', params as Record<string, unknown>),

  getProductsByBrandCountry: (brand: string, country: string, params?: Omit<ProductsParams, 'brand' | 'country'>) =>
    get<ProductsData>(`/api/products/${brand}/${country}`, params as Record<string, unknown>),

  getBrands: () => get<string[]>('/api/brands'),

  getBrandsConfig: () => get<unknown>('/api/brands/config'),

  getCountries: (brand?: string) =>
    get<string[]>('/api/countries', brand ? { brand } : undefined)
}
