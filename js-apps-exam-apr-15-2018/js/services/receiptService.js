let receipts = (() => {

    function getActiveReceipt(userId) {
        const endpoint = `receipts?query={"_acl.creator":"${userId}","active":"true"}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }

    function createNewReceipt() {
        let data = { active: true, productCount: 0, total: 0};
        return remote.post('appdata', 'receipts', 'kinvey', data);
    }

    function checkOutReceipt(receipt) {
        const endpoint = `receipts/${receipt._id}`;
        return remote.update('appdata', endpoint, 'kinvey', receipt);
    }

    function getAllReceipts(userId) {
        const endpoint = `receipts?query={"_acl.creator":"${userId}","active":"false"}`;
        return remote.get('appdata', endpoint, 'kinvey');
    }

    function getOneReceipt(receiptId) {
        const endpoint = `receipts/${receiptId}`;
        return remote.get('appdata', endpoint, 'kinvey');
    }

    return {
        getActiveReceipt,
        createNewReceipt,
        checkOutReceipt,
        getAllReceipts,
        getOneReceipt
    }
})();