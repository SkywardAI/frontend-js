import request from "../../tools/request.js";
import showMessage from "../../tools/message.js";
import useUser from "../../global/useUser.js";

const rag_modes = [
    { mode: 'on' },
    { mode: 'off' },
    { mode: 'hybrid', disabled: true },
]

let user_id = null;
useUser(user=>{
    user_id = user.id;
})

async function updateRAG(mode, element, id) {
    if(mode === 'on') {
        const { http_error } = await request('chat/session', {
            method: 'PATCH',
            body: {
                sessionUuid: id,
                type: 'rag'
            }
        })
        if(http_error) {
            showMessage("Set RAG mode failed!", { type: 'err' });
            return;
        }
    }
    showMessage(`This session will start with RAG ${mode}`);
    element.classList.add('completed');
    await new Promise(s=>setTimeout(s, 1000));
    element.insertAdjacentHTML(
        "beforebegin", 
        `<div class='greeting rag-info'>RAG <strong>${mode.toUpperCase()}</strong></div>`
    )
    element.remove();
}

export default function createRAGSelector(conversation) {
    if(conversation.type || user_id === null) {
        const rag_info = document.createElement('div');
        rag_info.className = 'greeting rag-info';
        rag_info.innerHTML = `RAG <strong>${
            conversation.type === 'rag' ? 'ON' :
            conversation.type === 'chat' || user_id === null ? 'OFF' : ''
        }</strong>`
        return rag_info;
    }
    const rag_select = document.createElement('div');
    rag_select.className = 'rag-select';

    rag_modes.forEach(({mode, disabled})=>{
        const option = document.createElement('div');
        option.className = 'option';
        if(disabled) {
            option.classList.add('disabled');
        } else {
            option.classList.add('clickable')
            option.onclick = () => {
                updateRAG(mode, rag_select, conversation.id)
            };
        }
        option.innerHTML = `Start session with RAG <strong>${mode}</strong>`;
        rag_select.appendChild(option);
    })
    return rag_select;
}