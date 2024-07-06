import apiAddress from "../tools/apiAddress.js";
import createHook from "./createHook.js";
import useSessionId from "./useSessionId.js";

const history = [
    // {id: 0, name: 'New Conversation', createdAt: new Date().toUTCString()},
    // {id: 1, name: 'New Conversation', createdAt: new Date().toUTCString()},
];
let init = false;
let currentSession;

const { onmount, remount, dismount, updateAll } = createHook();
useSessionId(id=>{
    currentSession = id;
})

/**
 * Hook for sync history
 * @param {Function} updated callback function when history updated
 * @returns {Object} List of history operators
 */
export default function useHistory(updated) {
    const mount_key = onmount(updated)

    async function requestUpdateHistory() {
        const chat_history = await (await fetch(apiAddress('chat/'), {
            headers: {
                authenticated: currentSession
            }
        })).json();

        history.length = 0;
        chat_history.forEach(({sessionUuid, name, createdAt}) => {
            history.push({id: sessionUuid, name, createdAt});
        });
        updateAll(history);
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
        init = true;
        requestUpdateHistory();
    }

    // send history use callback function
    updated && updated(history);

    return { 
        requestUpdateHistory, addHistory, clearHistory, 
        componetDismount: dismount(mount_key), componentReMount:remount(mount_key) 
    }
}