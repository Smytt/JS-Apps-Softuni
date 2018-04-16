let entries = (() => {

    function getEntriesByReceiptId(receiptId) {
        const endpoint = `entries?query={"receiptId":"${receiptId}"}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }
    
    function createNewEntry(name, qty, price, receiptId) {
        let data = { type: name, qty, price, receiptId};
        return remote.post('appdata', 'entries', 'kinvey', data);

    }

    function deleteEntry(entryId) {
        const endpoint = `entries/${entryId}`;
        return remote.remove('appdata', endpoint, 'kinvey');
    }

    return {
        getEntriesByReceiptId,
        createNewEntry,
        deleteEntry
    }
})();