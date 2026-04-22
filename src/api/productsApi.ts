import { get } from './client'
import type { ProductsData, ProductsParams, SpecsProductList, SpecsProduct } from './types'

export const productsApi = {
  getProducts: (params?: ProductsParams) =>
    get<ProductsData>('/api/products', params as Record<string, unknown>),

  getProductsByBrandCountry: (brand: string, country: string, params?: Omit<ProductsParams, 'brand' | 'country'>) =>
    get<ProductsData>(`/api/products/${brand}/${country}`, params as Record<string, unknown>),

  getBrands: () => get<string[]>('/api/brands'),

  getBrandsConfig: () => get<unknown>('/api/brands/config'),

  getCountries: (brand?: string) =>
    get<string[]>('/api/countries', brand ? { brand } : undefined),

  // 已采集规格的产品 ID 列表 - 文档 5.6
  getSpecsList: (brand: string, country: string) =>
    get<SpecsProductList>(`/api/specs/${encodeURIComponent(brand)}/${encodeURIComponent(country)}`),

  // 单个产品规格 - 文档 5.7
  getSpecs: (brand: string, country: string, productId: string, lang: 'both' | 'original' | 'en' = 'both') =>
    get<SpecsProduct>(
      `/api/specs/${encodeURIComponent(brand)}/${encodeURIComponent(country)}/${encodeURIComponent(productId)}`,
      { lang }
    ),
}
