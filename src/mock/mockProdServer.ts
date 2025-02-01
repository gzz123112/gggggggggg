import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'
import mockModules from './mock'

export function setupProdMockServer() {
  createProdMockServer([...mockModules])
} 