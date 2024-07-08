import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";

const defaultConversationSetting = {
    id: null,
    stream_response: true,
    temperature: 0.2,
    top_k: 40,
    top_p: 0.9,
    n_predict: 128,
    history: []
}

let currentConversation = {
    ...defaultConversationSetting
};

const { onmount, remount, dismount, updateAll } = createHook();
const { addHistory } = useHistory(null);

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    async function startNewConversation() {
        const { sessionUuid } = await (await request('chat/seesionuuid')).json();
        currentConversation = {
            ...defaultConversationSetting,
            id: sessionUuid
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