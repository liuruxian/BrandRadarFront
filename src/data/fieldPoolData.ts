// 字段池共享数据 - FieldPool 和视图共用
import type { PivotDimension } from '@/api/idcApiTypes'

export interface FieldValue {
  value: string
  label: string
}

export interface FieldDefinition {
  value: PivotDimension
  label: string
  category: string
  group: string
  values?: FieldValue[]
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  // 时间
  { value: 'Year' as PivotDimension, label: 'Year', category: 'time', group: '时间', values: [
    { value: '2024', label: '2024' }, { value: '2023', label: '2023' }, { value: '2022', label: '2022' }, { value: '2021', label: '2021' }, { value: '2020', label: '2020' }, { value: '2019', label: '2019' }, { value: '2018', label: '2018' }, { value: '2017', label: '2017' },
  ]},
  { value: 'Half Year' as PivotDimension, label: 'Half Year', category: 'time', group: '时间', values: [
    { value: 'H1', label: 'H1' }, { value: 'H2', label: 'H2' },
  ]},
  { value: 'Quarter' as PivotDimension, label: 'Quarter', category: 'time', group: '时间', values: [
    { value: 'Q1', label: 'Q1' }, { value: 'Q2', label: 'Q2' }, { value: 'Q3', label: 'Q3' }, { value: 'Q4', label: 'Q4' },
  ]},
  { value: 'Month' as PivotDimension, label: 'Month', category: 'time', group: '时间', values: [
    { value: 'Jan', label: 'January' }, { value: 'Feb', label: 'February' }, { value: 'Mar', label: 'March' }, { value: 'Apr', label: 'April' }, { value: 'May', label: 'May' }, { value: 'Jun', label: 'June' }, { value: 'Jul', label: 'July' }, { value: 'Aug', label: 'August' }, { value: 'Sep', label: 'September' }, { value: 'Oct', label: 'October' }, { value: 'Nov', label: 'November' }, { value: 'Dec', label: 'December' },
  ]},
  // 地域
  { value: 'Global Region' as PivotDimension, label: 'Global Region', category: 'geo', group: '地域', values: [
    { value: 'Americas', label: 'Americas' }, { value: 'EMEA', label: 'EMEA' }, { value: 'APJ', label: 'APJ' },
  ]},
  { value: 'Region' as PivotDimension, label: 'Region', category: 'geo', group: '地域', values: [
    { value: 'NA', label: 'North America' }, { value: 'LA', label: 'Latin America' }, { value: 'WE', label: 'Western Europe' }, { value: 'CE', label: 'Central Europe' }, { value: 'MEA', label: 'Middle East & Africa' }, { value: 'CN', label: 'China' }, { value: 'AP', label: 'Asia Pacific' },
  ]},
  { value: 'Country' as PivotDimension, label: 'Country', category: 'geo', group: '地域', values: [
    { value: 'US', label: 'United States' }, { value: 'CN', label: 'China' }, { value: 'JP', label: 'Japan' }, { value: 'DE', label: 'Germany' }, { value: 'UK', label: 'United Kingdom' }, { value: 'FR', label: 'France' }, { value: 'BR', label: 'Brazil' }, { value: 'IN', label: 'India' }, { value: 'CA', label: 'Canada' }, { value: 'MX', label: 'Mexico' }, { value: 'AU', label: 'Australia' }, { value: 'KR', label: 'South Korea' },
  ]},
  // 厂商/品牌
  { value: 'Company' as PivotDimension, label: 'Company', category: 'brand', group: '厂商/品牌', values: [
    { value: 'HP Inc', label: 'HP Inc.' }, { value: 'Canon', label: 'Canon' }, { value: 'Epson', label: 'Epson' }, { value: 'Brother', label: 'Brother' }, { value: 'Xerox', label: 'Xerox' }, { value: 'Samsung', label: 'Samsung' }, { value: 'Kyocera', label: 'Kyocera' }, { value: 'Ricoh', label: 'Ricoh' }, { value: 'Lexmark', label: 'Lexmark' }, { value: 'Pantum', label: 'Pantum' }, { value: 'Fujifilm', label: 'Fujifilm' }, { value: 'Sharp', label: 'Sharp' }, { value: 'Konica Minolta', label: 'Konica Minolta' },
  ]},
  { value: 'Vendor' as PivotDimension, label: 'Vendor', category: 'brand', group: '厂商/品牌', values: [
    { value: 'HP Inc', label: 'HP Inc.' }, { value: 'Canon', label: 'Canon' }, { value: 'Epson', label: 'Epson' }, { value: 'Brother', label: 'Brother' }, { value: 'Xerox', label: 'Xerox' }, { value: 'Samsung', label: 'Samsung' }, { value: 'Kyocera', label: 'Kyocera' }, { value: 'Ricoh', label: 'Ricoh' }, { value: 'Lexmark', label: 'Lexmark' }, { value: 'Pantum', label: 'Pantum' }, { value: 'Dell', label: 'Dell' }, { value: 'Lenovo', label: 'Lenovo' }, { value: 'Oki', label: 'Oki' }, { value: 'Toshiba', label: 'Toshiba' }, { value: 'Zebra', label: 'Zebra' }, { value: 'Other', label: 'Other' },
  ]},
  { value: 'Brand' as PivotDimension, label: 'Brand', category: 'brand', group: '厂商/品牌', values: [
    { value: 'HP', label: 'HP' }, { value: 'Canon', label: 'Canon' }, { value: 'Epson', label: 'Epson' }, { value: 'Brother', label: 'Brother' }, { value: 'Xerox', label: 'Xerox' }, { value: 'Samsung', label: 'Samsung' }, { value: 'Kyocera', label: 'Kyocera' }, { value: 'Ricoh', label: 'Ricoh' }, { value: 'Lexmark', label: 'Lexmark' }, { value: 'Pantum', label: 'Pantum' }, { value: 'Dell', label: 'Dell' }, { value: 'Lenovo', label: 'Lenovo' }, { value: 'Oki', label: 'Oki' }, { value: 'Toshiba', label: 'Toshiba' }, { value: 'Zebra', label: 'Zebra' }, { value: 'Other', label: 'Other' },
  ]},
  { value: 'OEM' as PivotDimension, label: 'OEM', category: 'brand', group: '厂商/品牌', values: [
    { value: 'HP', label: 'HP OEM' }, { value: 'Canon', label: 'Canon OEM' }, { value: 'Lexmark', label: 'Lexmark OEM' }, { value: 'Brother', label: 'Brother OEM' }, { value: 'Ricoh', label: 'Ricoh OEM' }, { value: 'Xerox', label: 'Xerox OEM' }, { value: 'Kyocera', label: 'Kyocera OEM' }, { value: 'Other', label: 'Other OEM' },
  ]},
  // 产品线
  { value: 'Product Category' as PivotDimension, label: 'Product Category', category: 'product', group: '产品线', values: [
    { value: 'Laser', label: 'Laser' }, { value: 'Inkjet', label: 'Inkjet' },
  ]},
  { value: 'Product' as PivotDimension, label: 'Product', category: 'product', group: '产品线', values: [
    { value: 'Printer', label: 'Printer' }, { value: 'MFP', label: 'MFP (Multifunction)' }, { value: 'Copier', label: 'Copier' }, { value: 'Fax', label: 'Fax' }, { value: 'Scanner', label: 'Scanner' },
  ]},
  { value: 'Format' as PivotDimension, label: 'Format', category: 'product', group: '产品线', values: [
    { value: 'A4', label: 'A4' }, { value: 'A3', label: 'A3' }, { value: 'Letter', label: 'Letter' }, { value: 'Legal', label: 'Legal' }, { value: 'Tabloid', label: 'Tabloid' }, { value: 'A4/A3', label: 'A4/A3' }, { value: 'Wide Format', label: 'Wide Format' },
  ]},
  // 功能
  { value: 'ADF' as PivotDimension, label: 'ADF', category: 'function', group: '功能', values: [
    { value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' },
  ]},
  { value: 'Duplex' as PivotDimension, label: 'Duplex', category: 'function', group: '功能', values: [
    { value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' },
  ]},
  { value: 'Wireless' as PivotDimension, label: 'Wireless', category: 'function', group: '功能', values: [
    { value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' },
  ]},
  { value: 'Ink Tank/ Ink Cartridge' as PivotDimension, label: 'Ink Tank/ Ink Cartridge', category: 'function', group: '功能', values: [
    { value: 'Ink Tank', label: 'Ink Tank' }, { value: 'Ink Cartridge', label: 'Ink Cartridge' }, { value: 'Toner', label: 'Toner' },
  ]},
  // 渠道
  { value: 'Channel' as PivotDimension, label: 'Channel', category: 'channel', group: '渠道', values: [
    { value: 'Direct', label: 'Direct' }, { value: 'Distributor', label: 'Distributor' }, { value: 'Retail', label: 'Retail' }, { value: 'E-Commerce', label: 'E-Commerce' }, { value: 'VAR', label: 'VAR / System Integrator' }, { value: 'Dealer', label: 'Dealer' },
  ]},
  { value: 'Channel Group' as PivotDimension, label: 'Channel Group', category: 'channel', group: '渠道', values: [
    { value: 'Direct', label: 'Direct' }, { value: 'Indirect', label: 'Indirect' },
  ]},
  // 技术细分
  { value: 'Production Classification' as PivotDimension, label: 'Production Classification', category: 'business', group: '技术细分', values: [
    { value: 'Personal', label: 'Personal' }, { value: 'Small Workgroup', label: 'Small Workgroup' }, { value: 'Workgroup', label: 'Workgroup' }, { value: 'Department', label: 'Department' }, { value: 'Production', label: 'Production' },
  ]},
  { value: 'Business Inkjet Detail' as PivotDimension, label: 'Business Inkjet Detail', category: 'business', group: '技术细分', values: [
    { value: 'SOHO Inkjet', label: 'SOHO Inkjet' }, { value: 'Home Office Inkjet', label: 'Home Office Inkjet' }, { value: 'Business Inkjet', label: 'Business Inkjet' }, { value: 'Graphics Pro', label: 'Graphics Pro' }, { value: 'Large Format Inkjet', label: 'Large Format Inkjet' },
  ]},
  { value: 'Speed Range A4' as PivotDimension, label: 'Speed Range A4', category: 'speed', group: '技术细分', values: [
    { value: 's1', label: '< 20 ppm' }, { value: 's2', label: '20 - 40 ppm' }, { value: 's3', label: '40 - 60 ppm' }, { value: 's4', label: '60 - 80 ppm' }, { value: 's5', label: '> 80 ppm' },
  ]},
  { value: 'Speed Range Letter' as PivotDimension, label: 'Speed Range Letter', category: 'speed', group: '技术细分', values: [
    { value: 's1', label: '< 20 ipm' }, { value: 's2', label: '20 - 40 ipm' }, { value: 's3', label: '40 - 60 ipm' }, { value: 's4', label: '60 - 80 ipm' }, { value: 's5', label: '> 80 ipm' },
  ]},
]

export const FIELD_GROUP_ORDER = ['时间', '地域', '厂商/品牌', '产品线', '功能', '渠道', '技术细分']
