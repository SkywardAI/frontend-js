import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";
import useUser from "./useUser.js";

let currentConversation = {
    id: null,
    pending: false,
    name: '',
    session_type: '',
    dataset_name: '',
    history: []
};

const conversation_histories = {}

let currentUser;

const { onmount, remount, dismount, updateAll } = createHook();
const { addHistory, removeHistory, updateHistoryName } = useHistory(h=>{
    if(currentConversation.id) {
        if(!h.filter(e=>e.id === currentConversation.id).length) {
            currentConversation = {
                id: null, pending: false, history: []
            };
            updateAll(currentConversation);
        }
    }
});
useUser(user=>currentUser = user);

function storeHistory() {
    const id = currentConversation.id;
    if(id) conversation_histories[id] = currentConversation.history;
}

async function rename(name) {
    currentConversation.name = name;
    return await updateHistoryName(currentConversation.id, name);
}

async function startNewConversation() {
    !currentUser.logged_in && storeHistory();
    const { sessionUuid } = await request('chat/seesionuuid');
    currentConversation = {
        pending: false, id: sessionUuid, 
        history: [], name: 'New Session', session_type: ''
    };
    addHistory({
        id: currentConversation.id,
        name: currentConversation.name,
        createdAt: new Date()
    })
    updateAll(currentConversation);
}

async function deleteConversation() {
    const { http_error } = await request(`chat/session/${currentConversation.id}`, {
        method: 'DELETE'
    })
    if(!http_error) {
        removeHistory(currentConversation.id);
        currentConversation = {
            id: null,
            pending: false,
            name: '',
            session_type: '',
            dataset_name: '',
            history: []
        }
        updateAll(currentConversation);
    }
    return !http_error;
}

function togglePending() {
    currentConversation.pending = !currentConversation.pending;
    updateAll(currentConversation);
}

async function sendMessage(messages) {
    await request('chat/save', {
        method: 'POST',
        body: {
            sessionUuid: currentConversation.id,
            chats: messages
        }
    })
    currentConversation.history.push(...messages);
    updateAll(currentConversation);
}

async function selectConversation(id, name, session_type, dataset_name) {
    let history;
    if(currentUser.logged_in) {
        history = await request(`chat/history/${id}`);
    } else {
        storeHistory();
        history = conversation_histories[id];
    }
    currentConversation = { id, history, pending: false, name, session_type, dataset_name };
    updateAll(currentConversation);
}

function updateConversationInfo(key, value) {
    currentConversation[key] = value;
    updateAll(currentConversation);
}

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    function componentReMount() {
        return remount(mount_key)(currentConversation)
    }

    updated && updated(currentConversation);

    return { 
        selectConversation, startNewConversation, deleteConversation,
        sendMessage, togglePending, rename, updateConversationInfo,
        componetDismount:dismount(mount_key), componentReMount
    }
}