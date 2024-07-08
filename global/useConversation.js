import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";

const defaultConversationSetting = {
    id: null,
    temperature: 0.2,
    top_k: 40,
    top_p: 0.9,
    n_predict: 128,
    history: []
}

let currentConversation = {
    ...defaultConversationSetting,
    id: 'not_selected'
};


const { onmount, remount, dismount, updateAll } = createHook();
const { addHistory } = useHistory(null);

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    function startNewConversation() {
        currentConversation = {...defaultConversationSetting};
        updateAll(currentConversation);
    }

    async function sendMessage(messages, uuid) {
        if(currentConversation.id === null) {
            currentConversation.id = uuid;
            addHistory({
                id: currentConversation.id,
                name: 'New Conversation',
                createdAt: new Date().toUTCString()
            })
        }
        currentConversation.history.push(...messages);
        updateAll(currentConversation);
    }

    async function selectConversation(id, settings = null) {
        const conversation_history = [];
        await (await request(`chat/history/${id}`))
        .json().forEach(({type, message})=>{
            conversation_history.push({type, message});
        })
        currentConversation = {
            ...(settings || defaultConversationSetting), id, history
        }
        updateAll(currentConversation);
    }

    async function updateSetting(setting) {
        currentConversation = {
            ...currentConversation,
            ...setting
        }
        updateAll(currentConversation);
        return true;
    }

    updated && updated(currentConversation);

    return { 
        selectConversation, updateSetting, startNewConversation, sendMessage,
        componetDismount:dismount(mount_key), componentReMount:remount(mount_key) 
    }
}