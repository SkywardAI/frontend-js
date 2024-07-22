import request from "../tools/request.js";
import createHook from "./createHook.js";
import useSessionId from "./useSessionId.js";

const history = [
    // {id: 0, name: 'New Conversation', createdAt: new Date().toUTCString()},
    // {id: 1, name: 'New Conversation', createdAt: new Date().toUTCString()},
];
let currentSession;

const { onmount, remount, dismount, updateAll } = createHook();

async function requestUpdateHistory() {
    if(!currentSession) return;
    
    const response = await request('chat');

    if(!Array.isArray(response)) return;
    const chat_history = response.map(e=>{return {...e, createdAt: new Date(e.createdAt)}})
    console.log(chat_history)
    chat_history.sort((a, b)=>b.createdAt - a.createdAt);

    history.length = 0;
    chat_history.forEach(({sessionUuid, name, type, createdAt}) => {
        const parsedDate = `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString().padStart(11, '0')}`;
        history.push({id: sessionUuid, name, type, createdAt: parsedDate});
    });
    updateAll(history);
}

function addHistory(new_ticket) {
    history.unshift(new_ticket);
    updateAll(history);
}

async function updateHistoryName(id, name) {
    history[history.findIndex(h=>h.id === id)].name = name;
    const { http_error } = await request('chat/session', {
        method: 'PATCH',
        body: { sessionUuid: id, name }
    })
    const success = !http_error;
    if(success) updateAll(history);
    return success;
}

function getHistory(id) {
    return history.filter(e=>e.id === id).pop();
}
useSessionId(id=>{
    currentSession = id;
    requestUpdateHistory();
})

export default function useHistory(updated = null) {
    const mount_key = onmount(updated)

    function componentReMount() {
        return remount(mount_key)(history)
    }

    updated && updated(history);

    return { 
        requestUpdateHistory, addHistory, getHistory, updateHistoryName,
        componetDismount: dismount(mount_key), componentReMount
    }
}