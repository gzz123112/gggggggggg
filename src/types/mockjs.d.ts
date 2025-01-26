declare module 'mockjs' {
  interface MockjsConfig {
    [key: string]: any
  }

  interface MockJS {
    mock<T>(url: string, type: string, template: any): void
    Random: any
    setup(settings: MockjsConfig): void
  }

  const mockjs: MockJS
  export default mockjs
} 