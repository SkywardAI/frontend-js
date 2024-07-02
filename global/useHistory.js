const history = [
    {name: 'New Conversation', createdAt: new Date().toUTCString()},
    {name: 'New Conversation', createdAt: new Date().toUTCString()},
    {name: 'New Conversation', createdAt: new Date().toUTCString()},
    {name: 'New Conversation', createdAt: new Date().toUTCString()},
    {name: 'New Conversation', createdAt: new Date().toUTCString()},
    {name: 'New Conversation', createdAt: new Date().toUTCString()},
    {name: 'New Conversation', createdAt: new Date().toUTCString()}
];
let init = false;
let updatesList = [];

function allUpdate() {
    updatesList.forEach(e=>e(history));
}

/**
 * Hook for sync history
 * @param {Function} updated callback function when history updated
 * @returns {Object} List of history operators
 */
export default function useHistory(updated) {
    updatesList.push(updated);

    async function requestUpdateHistory() {
        // fetch to update
        // if has callback then callback
    }

    function addHistory(new_ticket) {
        history.push(new_ticket);
        allUpdate();
    }

    function clearHistory() {
        history.length = 0;
        init = false;
    }

    function componentClear() {
        updatesList = updatesList.filter(e=>e!==updated);
    }

    if(!init) {
        requestUpdateHistory();
        init = true;
    }

    // send history use callback function
    updated(history);

    return { requestUpdateHistory, addHistory, clearHistory, componentClear }
}