import request from "../tools/request.js";
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
export default function useHistory(updated = null) {
    const mount_key = onmount(updated)

    async function requestUpdateHistory() {
        if(!currentSession) return;
        
        const chat_history = await request('chat');

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

    function updateHistoryName(id, name) {
        for(const index in history) {
            if(history[index].id === id) {
                history[index].name = name;
                // TODO: tell backend
            }
        }
        updateAll(history);
    }

    function getHistory(id) {
        return history.filter(e=>e.id === id).pop();
    }

    if(!init) {
        init = true;
        requestUpdateHistory();
    }

    // send history use callback function
    updated && updated(history);

    return { 
        requestUpdateHistory, addHistory, clearHistory, getHistory, updateHistoryName,
        componetDismount: dismount(mount_key), componentReMount:remount(mount_key) 
    }
}