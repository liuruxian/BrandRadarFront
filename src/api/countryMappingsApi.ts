/**
 * 国家映射 API
 * 文档: 完整API接口文档.md - 第九章
 */
import { get, put } from './client'

// 国家映射类型 - 与后端对齐
export interface CountryDisplayOut {
  brand: string
  country_code: string
  country_name: string
  country_name_zh?: string
  country_name_en?: string
  region?: string
  is_enabled?: boolean
  locale?: string
  display_order?: number
}

export interface CountryDisplayListOut {
  items: CountryDisplayOut[]
  meta?: {
    count?: number
    page?: number
    page_size?: number
  }
}

export interface CountryMappingUpsertBody {
  display_name?: string
  locale_display_names?: Record<string, string>
}

export const countryMappingsApi = {
  // 获取品牌国家映射
  getMapping: (brand: string, locale?: string) => {
    const params = locale ? `?locale=${locale}` : ''
    return get<CountryDisplayListOut>(`/api/country-mappings/${encodeURIComponent(brand)}${params}`)
  },

  // 更新品牌国家映射
  updateMapping: (brand: string, countryCode: string, body: CountryMappingUpsertBody) => {
    return put<CountryDisplayListOut>(
      `/api/country-mappings/${encodeURIComponent(brand)}/${encodeURIComponent(countryCode)}`,
      body
    )
  },
}
