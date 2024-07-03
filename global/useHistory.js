import createHook from "./createHook.js";

const history = [
    {id: 0, name: 'New Conversation', createdAt: new Date().toUTCString()},
    {id: 1, name: 'New Conversation', createdAt: new Date().toUTCString()},
];
let init = false;

const { onmount, dismount, updateAll } = createHook();

/**
 * Hook for sync history
 * @param {Function} updated callback function when history updated
 * @returns {Object} List of history operators
 */
export default function useHistory(updated) {
    onmount(updated)

    async function requestUpdateHistory() {
        // fetch to update
        // if has callback then callback
    }

    function addHistory(new_ticket) {
        history.push(new_ticket);
        updateAll(history);
    }

    function clearHistory() {
        history.length = 0;
        init = false;
    }

    if(!init) {
        requestUpdateHistory();
        init = true;
    }

    // send history use callback function
    updated(history);

    return { requestUpdateHistory, addHistory, clearHistory, componetDismount: dismount(updated) }
}