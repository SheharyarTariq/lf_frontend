"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import apiCall from '@/components/common/utils/api-call'

interface SearchInputProps<T> {
    endpoint: string;
    searchKey: string;
    placeholder?: string;
    debounceMs?: number;
    onResults: (data: T | null) => void;
}

function SearchInput<T>({
    endpoint,
    searchKey,
    placeholder = "Search",
    debounceMs = 400,
    onResults,
}: SearchInputProps<T>) {
    const [query, setQuery] = useState('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        if (!query.trim()) {
            onResults(null)
            return
        }

        timerRef.current = setTimeout(async () => {
            const response = await apiCall<T>({
                endpoint,
                method: "GET",
                data: { [searchKey]: query.trim() },
            })
            if (response.success) {
                onResults(response.data)
            }
        }, debounceMs)

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [query])

    return (
        <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
                <Search size={24} color="#8F8F8F" />
            </div>
            <input
                className="py-4 px-6 pl-12 placeholder:font-[400] placeholder:text-[#C1C1C1] text-black border-muted border border-[1px] focus:outline-neutral rounded-[8px] w-full"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    )
}

export default SearchInput
