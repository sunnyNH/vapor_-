// 用户相关类型
export interface User {
  id?: number
  name?: string
  phone: string
  avatar?: string
  age?: number
  gender?: number
  address?: string
  overview?: string
}

export interface UserInfo {
  name?: string
  avatar?: string
  phone?: string
  age?: number
  gender?: number
  address?: string
  overview?: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  status: boolean
  data: T
  error?: string
  reason?: string
}

// 内容相关类型
export interface ContentItem {
  id: number
  title: string
  creator: string
  publishTime: string
  tags: string[]
  contentType: string
  flowStatus: string
  cover: string
  contentStatus?: number[]
}

export interface FilterForm {
  dateRange: string
  tag: string
  contentType: string
}

// 创作者相关类型
export interface CreatorItem {
  id: string
  name: string
  avatar: string
  registerTime: string
  region: string
  attributes: string[]
  contentCount: number
  wordCount: string
  likes: string
  comments: string
}

// 分页数据类型
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 分发表单类型
export interface DistributeForm {
  channels: string[]
  time: string
}

// 日期快捷选项类型
export interface DateShortcut {
  text: string
  value: () => [Date, Date]
}

// 图表数据类型
export interface ChartData {
  name: string
  type: string
  data: number[]
  smooth?: boolean
  symbol?: string
  lineStyle?: any
  areaStyle?: any
}

// ECharts 配置类型
export interface ChartOption {
  tooltip?: any
  legend?: any
  grid?: any
  xAxis?: any
  yAxis?: any
  series?: ChartData[]
}
