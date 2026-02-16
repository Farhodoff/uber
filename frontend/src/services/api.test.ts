import { describe, it, expect } from 'vitest'
import api from './api'

describe('API Service', () => {
    it('should have a base URL configured', () => {
        expect(api.defaults.baseURL).toBeDefined()
    })

    it('should use environment variable for base URL', () => {
        const expectedURL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        expect(api.defaults.baseURL).toBe(expectedURL)
    })

    it('should have request interceptor for auth token', () => {
        expect(api.interceptors.request.handlers?.length).toBeGreaterThan(0)
    })

    it('should have response interceptor for error handling', () => {
        expect(api.interceptors.response.handlers?.length).toBeGreaterThan(0)
    })
})
