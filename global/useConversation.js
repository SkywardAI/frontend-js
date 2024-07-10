import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";

let currentConversation = {
    id: null,
    history: []
};

const { onmount, remount, dismount, updateAll } = createHook();
const { addHistory } = useHistory(null);

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    async function startNewConversation() {
        const { sessionUuid } = await (await request('chat/seesionuuid')).json();
        currentConversation = {
            id: sessionUuid, history: []
        };
        addHistory({
            id: currentConversation.id,
            name: 'New Session',
            createdAt: new Date().toUTCString()
        })
        updateAll(currentConversation);
    }

    async function sendMessage(messages) {
        currentConversation.history.push(...messages);
        updateAll(currentConversation);
    }

    async function selectConversation(id) {
        const conversation_history = [];
        await (await request(`chat/history/${id}`))
        .json().forEach(({type, message})=>{
            conversation_history.push({type, message});
        })
        currentConversation = { id, history }
        updateAll(currentConversation);
    }

    updated && updated(currentConversation);

    return { 
        selectConversation, startNewConversation, sendMessage,
        componetDismount:dismount(mount_key), componentReMount:remount(mount_key) 
    }
}