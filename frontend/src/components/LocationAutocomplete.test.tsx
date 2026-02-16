import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LocationAutocomplete from './LocationAutocomplete'

// Mock the API
vi.mock('@/services/api', () => ({
    default: {
        get: vi.fn(() => Promise.resolve({ data: [] }))
    }
}))

describe('LocationAutocomplete', () => {
    it('renders input field', () => {
        render(
            <LocationAutocomplete
                value=""
                onChange={() => { }}
                onSelect={() => { }}
                placeholder="Enter location"
            />
        )

        const input = screen.getByPlaceholderText('Enter location')
        expect(input).toBeInTheDocument()
    })

    it('displays the current value', () => {
        render(
            <LocationAutocomplete
                value="Tashkent City"
                onChange={() => { }}
                onSelect={() => { }}
                placeholder="Enter location"
            />
        )

        const input = screen.getByDisplayValue('Tashkent City')
        expect(input).toBeInTheDocument()
    })
})
