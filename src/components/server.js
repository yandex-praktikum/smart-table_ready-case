// serverApi.js
export const ServerApi = (baseUrl) => {
    const JSON_HEADERS = { 'Content-Type': 'application/json' };

    const fetchJson = async (url, options = {}) => {
        const response = await fetch(url, options);
        return response.json();
    };

    return {
        fetchSellers: () => fetchJson(`${baseUrl}/sellers`),
        fetchCustomers: () => fetchJson(`${baseUrl}/customers`),
        fetchRecords: (query) => {
            const queryString = new URLSearchParams(query).toString();
            return fetchJson(`${baseUrl}/records?${queryString}`);
        },
        createRecord: (data) =>
            fetchJson(`${baseUrl}/records`, {
                method: 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify(data),
            }),
        updateRecord: (id, data) =>
            fetchJson(`${baseUrl}/records/${id}`, {
                method: 'PUT',
                headers: JSON_HEADERS,
                body: JSON.stringify(data),
            }),
        deleteRecord: (id) =>
            fetchJson(`${baseUrl}/records/${id}`, { method: 'DELETE' }),
    };
};