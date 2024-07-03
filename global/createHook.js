export default function createHook() {
    let updatesList = [];
    
    function onmount(callback) {
        updatesList.push(callback);
    }

    function dismount(callback) {
        return () => {
            updatesList = updatesList.filter(e=>e!==callback);
        }
    }

    function updateAll(value) {
        updatesList.forEach(e=>e(value));
    }

    return { onmount, dismount, updateAll }
}