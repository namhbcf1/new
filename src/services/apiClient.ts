export const API_URL = 'https://tp-pc-builder-api.bangachieu2.workers.dev';
export const DEFAULT_PASSWORD = 'namhbcf12';

export interface InventoryItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    cat: string;
    // Dynamic fields
    brand?: string;
    warranty?: string;
    condition?: string;
    image?: string;
    socket?: string;
    ddr?: string;
    memoryType?: string;
    [key: string]: any;
}

export interface ConfigItem {
    cpu_type: string;
    game: string;
    budget_key: string;
    payload: any;
}

export async function fetchInventory(): Promise<Record<string, Record<string, InventoryItem>>> {
    const res = await fetch(`${API_URL}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
}

export async function upsertInventoryItem(password: string, item: Partial<InventoryItem> & { cat: string, id: string }) {
    const res = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-edit-password': password
        },
        body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to upsert item');
    return res.json();
}

export async function deleteInventoryItem(password: string, cat: string, id: string) {
    const res = await fetch(`${API_URL}/inventory/${cat}/${id}`, {
        method: 'DELETE',
        headers: { 'x-edit-password': password }
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
}

export async function fetchConfigs(): Promise<Record<string, any>> {
    const res = await fetch(`${API_URL}/configs`);
    if (!res.ok) throw new Error('Failed to fetch configs');
    return res.json();
}

export async function upsertConfig(password: string, config: ConfigItem) {
    const res = await fetch(`${API_URL}/configs`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-edit-password': password
        },
        body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to upsert config');
    return res.json();
}

export async function deleteConfig(password: string, cpuType: string, game: string, budgetKey: string) {
    const res = await fetch(`${API_URL}/configs/${cpuType}/${game}/${budgetKey}`, {
        method: 'DELETE',
        headers: { 'x-edit-password': password }
    });
    if (!res.ok) throw new Error('Failed to delete config');
    return res.json();
}
