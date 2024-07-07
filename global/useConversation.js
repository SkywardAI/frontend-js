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
const { addHistory:addUserHistoryTicket } = useHistory(null);

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    function addHistory(histories) {
        currentConversation.history.push(...histories);
        updateAll(currentConversation);
    }

    function startNewConversation() {
        currentConversation.id = null;
        currentConversation.history = [];
        updateAll(currentConversation);
    }

    async function sendMessage(message) {
        addHistory([{ type: 'out', message }]);

        const { sessionUuid, message:botResponse } = 
        await (await request('chat', {
            method: 'POST',
            body: {
                sessionUuid: currentConversation.id || "uuid",
                message
            }
        })).json()

        if(currentConversation.id === null) {
            addUserHistoryTicket({
                id: sessionUuid, name: 'New Conversation', 
                createdAt: new Date().toUTCString()
            })
            currentConversation.id = sessionUuid;
        }
        addHistory([{type: 'in', message: botResponse}])
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