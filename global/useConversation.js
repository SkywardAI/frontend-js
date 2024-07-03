const defaultConversationSetting = {
    id: null,
    temperature: '0.2',
    top_k: 40,
    top_p: 0.9,
    n_keep: null,
    n_predict: 128,
    history: []
}

let currentConversation = {
    ...defaultConversationSetting,
    history: [
        { type: 'out', message: 'hello world from me' },
        { type: 'in', message: 'hello world from bot' },
    ]
}
let updatesList = [];
function allUpdate() {
    updatesList.forEach(e=>e(currentConversation));
}

export default function useConversation(updated) {
    updatesList.push(updated);

    function addHistory(histories) {
        currentConversation.history.push(...histories);
        allUpdate();
    }

    function selectConversation(id, settings = null) {
        // TODO: query history by id
        const history = [];
        currentConversation = {
            ...(settings || defaultConversationSetting), id, history
        }
        allUpdate();
    }

    function updateSetting(setting) {
        currentConversation = {
            ...currentConversation,
            ...setting
        }
    }

    function componetDismount() {
        updatesList = updatesList.filter(e=>e!==updated);
    }

    return { addHistory, selectConversation, updateSetting, componetDismount }
}