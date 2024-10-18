export function formatDate(date: string | Date | undefined): string | undefined {
    if (!date) {
        console.log('formatDate received undefined or null date');
        return undefined;
    }
    
    let d: Date;
    if (typeof date === 'string') {
        // Try to parse the string as an ISO 8601 date
        d = new Date(date);
        if (isNaN(d.getTime())) {
            // If parsing fails, it might be in a different format
            // Try to parse it as YYYY-MM-DD
            const parts = date.split('-');
            if (parts.length === 3) {
                d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
            } else {
                console.log(`formatDate failed to parse string date: ${date}`);
                return undefined;
            }
        }
    } else {
        d = date;
    }
    
    if (isNaN(d.getTime())) {
        console.log(`formatDate received invalid date: ${date}`);
        return undefined;
    }
    
    // Format as YYYY-MM-DD in UTC
    return d.toISOString().split('T')[0];
}
