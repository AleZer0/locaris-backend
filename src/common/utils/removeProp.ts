export function removeProp<T, K extends keyof T>(data: T | T[], prop: K): Omit<T, K> | Omit<T, K>[] {
    if (Array.isArray(data)) {
        return data.map(item => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [prop]: _, ...rest } = item;
            return rest;
        });
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [prop]: _, ...rest } = data;
        return rest;
    }
}
