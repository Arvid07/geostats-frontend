export function getMonday() {
    const d = new Date()
    const day = d.getUTCDay()
    const diff = (day + 6) % 7
    d.setDate(d.getUTCDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
}

const modules = import.meta.glob<{ default: unknown }>("/src/data/*.json");

export async function getCountryData<T = unknown>(code: string): Promise<T> {
    const path = `/src/data/${code}.json`;
    const importer = modules[path];
    if (!importer) {
        throw new Error(`No JSON available for country code "${code}" in path "${path}"`);
    }
    const mod = await importer();
    return mod.default as T;
}

export async function getRegionData<T = unknown>(code: string): Promise<T | null> {
    const path = `/src/data/${code}-Regions.json`;
    const importer = modules[path];
    if (!importer) {
        return null;
    }
    const mod = await importer();
    return mod.default as T;
}