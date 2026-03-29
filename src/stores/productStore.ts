import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { productsApi } from '@/api/productsApi'
import type { Product, PaginationMeta, ProductsParams } from '@/api/types'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const brands = ref<string[]>([])
  const countries = ref<string[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = reactive({
    brand: undefined as string | undefined,
    country: undefined as string | undefined,
    status: undefined as 'on_sale' | 'discontinued' | undefined,
    page: 1 as number,
    page_size: 50 as number
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await productsApi.getProducts({ ...filters })
      if (res.success && res.data) {
        products.value = res.data.products
        meta.value = res.meta as PaginationMeta ?? null
      }
    } catch (e: unknown) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchBrands() {
    try {
      const res = await productsApi.getBrands()
      if (res.success && res.data) brands.value = res.data
    } catch {}
  }

  async function fetchCountries(brand?: string) {
    try {
      const res = await productsApi.getCountries(brand)
      if (res.success && res.data) countries.value = res.data
    } catch {}
  }

  function setFilter<K extends keyof ProductsParams>(key: K, value: ProductsParams[K]) {
    filters[key] = value
    if (key !== 'page') filters.page = 1
  }

  function resetFilters() {
    filters.brand = undefined
    filters.country = undefined
    filters.status = undefined
    filters.page = 1
    filters.page_size = 50
    countries.value = []
  }

  return { products, brands, countries, meta, loading, error, filters, fetchProducts, fetchBrands, fetchCountries, setFilter, resetFilters }
})
