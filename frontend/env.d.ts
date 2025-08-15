/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Element Plus 全局组件类型
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ElButton: typeof import('element-plus')['ElButton']
    ElCard: typeof import('element-plus')['ElCard']
    ElTable: typeof import('element-plus')['ElTable']
    ElTableColumn: typeof import('element-plus')['ElTableColumn']
    ElForm: typeof import('element-plus')['ElForm']
    ElFormItem: typeof import('element-plus')['ElFormItem']
    ElInput: typeof import('element-plus')['ElInput']
    ElSelect: typeof import('element-plus')['ElSelect']
    ElOption: typeof import('element-plus')['ElOption']
    ElDatePicker: typeof import('element-plus')['ElDatePicker']
    ElPagination: typeof import('element-plus')['ElPagination']
    ElMessage: typeof import('element-plus')['ElMessage']
    ElMessageBox: typeof import('element-plus')['ElMessageBox']
    ElTag: typeof import('element-plus')['ElTag']
    ElDialog: typeof import('element-plus')['ElDialog']
    ElCheckbox: typeof import('element-plus')['ElCheckbox']
    ElCheckboxGroup: typeof import('element-plus')['ElCheckboxGroup']
    ElImage: typeof import('element-plus')['ElImage']
    ElIcon: typeof import('element-plus')['ElIcon']
    ElMenu: typeof import('element-plus')['ElMenu']
    ElMenuItem: typeof import('element-plus')['ElMenuItem']
    ElSubMenu: typeof import('element-plus')['ElSubMenu']
    ElContainer: typeof import('element-plus')['ElContainer']
    ElHeader: typeof import('element-plus')['ElHeader']
    ElAside: typeof import('element-plus')['ElAside']
    ElMain: typeof import('element-plus')['ElMain']
    ElBreadcrumb: typeof import('element-plus')['ElBreadcrumb']
    ElBreadcrumbItem: typeof import('element-plus')['ElBreadcrumbItem']
    ElDropdown: typeof import('element-plus')['ElDropdown']
    ElDropdownMenu: typeof import('element-plus')['ElDropdownMenu']
    ElDropdownItem: typeof import('element-plus')['ElDropdownItem']
    ElAvatar: typeof import('element-plus')['ElAvatar']
    ElRow: typeof import('element-plus')['ElRow']
    ElCol: typeof import('element-plus')['ElCol']
    ElRadioGroup: typeof import('element-plus')['ElRadioGroup']
    ElRadioButton: typeof import('element-plus')['ElRadioButton']
  }
}
