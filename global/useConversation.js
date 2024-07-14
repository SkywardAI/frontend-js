import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";
import useUser from "./useUser.js";

let currentConversation = {
    id: null,
    pending: false,
    history: []
};

const conversation_histories = {}

let currentUser;

const { onmount, remount, dismount, updateAll } = createHook();
const { addHistory } = useHistory(h=>{
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

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    function storeHistory() {
        const id = currentConversation.id;
        if(id) conversation_histories[id] = currentConversation.history;
    }

    async function startNewConversation() {
        storeHistory();
        const { sessionUuid } = await request('chat/seesionuuid');
        currentConversation = {
            pending: false, id: sessionUuid, history: []
        };
        addHistory({
            id: currentConversation.id,
            name: 'New Session',
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

    async function selectConversation(id) {
        let history;
        if(currentUser.logged_in) {
            history = await request(`chat/history/${id}`);
        } else {
            storeHistory();
            history = conversation_histories[id];
        }
        currentConversation = { id, history };
        updateAll(currentConversation);
    }

    updated && updated(currentConversation);

    return { 
        selectConversation, startNewConversation, sendMessage, togglePending,
        componetDismount:dismount(mount_key), componentReMount:remount(mount_key) 
    }
}