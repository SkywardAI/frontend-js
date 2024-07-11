import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";

let currentConversation = {
    id: null,
    pending: false,
    history: []
};

const conversation_histories = {}

const { onmount, remount, dismount, updateAll } = createHook();
const { addHistory } = useHistory(null);

export default function useConversation(updated) {
    const mount_key = onmount(updated);

    function storeHistory() {
        const id = currentConversation.id;
        if(id) conversation_histories[id] = currentConversation.history;
    }

    async function startNewConversation() {
        storeHistory();
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

    function togglePending() {
        currentConversation.pending = !currentConversation.pending;
        updateAll(currentConversation);
    }

    function sendMessage(messages) {
        currentConversation.history.push(...messages);
        updateAll(currentConversation);
    }

    async function selectConversation(id) {
        // TODO: logged in user should query from backend

        // const conversation_history = [];
        // await (await request(`chat/history/${id}`))
        // .json().forEach(({type, message})=>{
        //     conversation_history.push({type, message});
        // })
        storeHistory();
        currentConversation = { id, history: conversation_histories[id] }
        updateAll(currentConversation);
    }

    updated && updated(currentConversation);

    return { 
        selectConversation, startNewConversation, sendMessage, togglePending,
        componetDismount:dismount(mount_key), componentReMount:remount(mount_key) 
    }
}