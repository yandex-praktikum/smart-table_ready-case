// initData.js
export function initData(api) {
    let sellers, customers, lastResult, lastQuery;

    const transformRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount,
    }));

    const getIndexes = async () => {
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                api.fetchSellers(),
                api.fetchCustomers(),
            ]);
        }
        return { sellers, customers };
    };

    const getRecords = async (query = {}, forceUpdate = false) => {
        const queryString = new URLSearchParams(query).toString();
        if (lastQuery === queryString && !forceUpdate) {
            return lastResult;
        }
        const records = await api.fetchRecords(query);
        lastQuery = queryString;
        lastResult = {
            total: records.total,
            items: transformRecords(records.items),
        };
        return lastResult;
    };

    return {
        getIndexes,
        getRecords,
        createRecord: api.createRecord,
        updateRecord: api.updateRecord,
        deleteRecord: api.deleteRecord,
    };
}