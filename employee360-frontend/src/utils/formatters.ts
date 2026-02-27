// ─── Date formatting ────────────────────────────────────────────────

export function formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '—';
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(isoDate));
}

export function formatDateTime(isoDateTime: string | null | undefined): string {
    if (!isoDateTime) return '—';
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(isoDateTime));
}

// ─── Initials ───────────────────────────────────────────────────────

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ─── Rating color ───────────────────────────────────────────────────

export function ratingColor(rating: number | null | undefined): string {
    if (!rating) return 'text-text-secondary';
    if (rating >= 4) return 'text-success';
    if (rating >= 3) return 'text-warning';
    return 'text-error';
}

// ─── Allocation color ───────────────────────────────────────────────

export function allocationColor(percent: number): string {
    if (percent >= 100) return 'text-error';
    if (percent >= 80) return 'text-warning';
    return 'text-success';
}

// ─── Truncate ───────────────────────────────────────────────────────

export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 1) + '…';
}
