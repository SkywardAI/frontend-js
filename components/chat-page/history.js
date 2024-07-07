import useConversation from "../../global/useConversation.js";
import useHistory from "../../global/useHistory.js";

let history = [], history_elem = null, last_selected_id;

const { componetDismount:historyDismount, componentReMount: historyRemount } = useHistory(h=>{
    history = h;
    updateHistoryList();
})

const { 
    selectConversation, startNewConversation,
    componetDismount:conversationDismount, componentReMount: conversationRemount 
} = useConversation(c=>{
    if(c.id === 'not_selected' || c.id === null || c.id === last_selected_id) return;
    last_selected_id = c.id;
    
    const last_selected = document.querySelector('#chat-history .tickets-list .ticket.selected')
    last_selected && last_selected.classList.remove('selected');
    document.getElementById(`history-ticket-${c.id}`).classList.add('selected')
})

export default function createChatHistory(main) {
    history_elem = document.createElement('div');
    history_elem.id = 'chat-history';
    main.insertAdjacentElement('beforeend', history_elem);

    // re-mount update listeners
    historyRemount();
    conversationRemount();

    updateHistoryList();
    return () => {
        historyDismount();
        conversationDismount();
    };
}

function updateHistoryList() {
    if(!history_elem) return;

    if(!history_elem.textContent) {
        const new_conversation = document.createElement('div')
        new_conversation.className = 'new-conversation clickable'
        new_conversation.innerHTML="<div class='title'>Start a new conversation</div>"
        new_conversation.onclick = startNewConversation;
        history_elem.appendChild(new_conversation);
    } else {
        history_elem.lastChild.remove();
    }

    const tickets_list = document.createElement('div')
    tickets_list.className='tickets-list'

    history.forEach(({id, name, createdAt}) => {
        const ticket = document.createElement('div')
        ticket.className = 'ticket clickable'
        id === last_selected_id && ticket.classList.add('selected')
        ticket.id = `history-ticket-${id}`
        ticket.innerHTML = 
        `<div class='title'>${name}</div>
        <div class='datetime'>${createdAt}</div>
        <div class='preview'>this is a preview</div>`

        ticket.onclick = () => {
            selectConversation(id);
        }

        tickets_list.appendChild(ticket)
    });
    history_elem.appendChild(tickets_list);
}