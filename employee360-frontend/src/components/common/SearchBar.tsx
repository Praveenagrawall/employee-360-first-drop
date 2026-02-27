import { forwardRef, useState, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onSearch: (query: string) => void;
    isLoading?: boolean;
    debounceMs?: number;
    initialValue?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
    ({ className, onSearch, isLoading = false, debounceMs = 300, initialValue = '', ...props }, ref) => {
        const [query, setQuery] = useState(initialValue);

        useEffect(() => {
            const handler = setTimeout(() => {
                onSearch(query);
            }, debounceMs);

            return () => clearTimeout(handler);
        }, [query, debounceMs, onSearch]);

        const [prevInitial, setPrevInitial] = useState(initialValue);

        if (initialValue !== prevInitial) {
            setPrevInitial(initialValue);
            if (initialValue) {
                setQuery(initialValue);
            }
        }

        return (
            <div className={cn('relative w-full', className)}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 focus-within:text-primary transition-colors" />
                </div>

                <input
                    ref={ref}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={cn(
                        'block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm'
                    )}
                    {...props}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>
        );
    }
);

SearchBar.displayName = 'SearchBar';
