import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";
import useUser from "./useUser.js";

let currentConversation = {
    id: null,
    pending: false,
    name: '',
    history: []
};

const conversation_histories = {}

let currentUser;

const { onmount, remount, dismount, updateAll } = createHook();
const { addHistory, updateHistoryName } = useHistory(h=>{
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
    storeHistory();
    const { sessionUuid } = await request('chat/seesionuuid');
    currentConversation = {
        pending: false, id: sessionUuid, history: [], name: 'New Session'
    };
    addHistory({
        id: currentConversation.id,
        name: currentConversation.name,
        createdAt: new Date().toUTCString()
    })
    updateAll(currentConversation);
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

async function selectConversation(id, name) {
    let history;
    if(currentUser.logged_in) {
        history = await request(`chat/history/${id}`);
    } else {
        storeHistory();
        history = conversation_histories[id];
    }
    currentConversation = { id, history, pending: false, name };
    updateAll(currentConversation);
}

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    function componentReMount() {
        return remount(mount_key)(currentConversation)
    }

    updated && updated(currentConversation);

    return { 
        selectConversation, startNewConversation,
        sendMessage, togglePending, rename,
        componetDismount:dismount(mount_key), componentReMount
    }
}