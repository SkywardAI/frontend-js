import useConversation from "../../global/useConversation.js";
import request from "../../tools/request.js";

let conversation = {}, main_elem, init = false;

const { 
    componentDismount, componentReMount, 
    sendMessage:appendConversationMessage 
} = useConversation(c=>{
    if(c.id === conversation.id) return;
    conversation = {...c};
    if(conversation.id === 'not_selected') return;

    if(conversation.id === null) {
        const conversation_main = document.getElementById('conversation-main');
        if(conversation_main) conversation_main.innerHTML = "<div class='greeting'>Hi, how can I help you today?</div>"
    }
    buildForm();
    updateConversation();
})

export default function createChatMain(main) {
    componentReMount();

    main.insertAdjacentHTML('beforeend', `
    <div id='chat-main'>
        <div id='conversation-main'>
            <div class='greeting'>
                Please select a ticket or start a new conversation on left.
            </div>
        </div>
        <form id='submit-chat' autocomplete="off"></form>
    </div>`)

    document.getElementById('submit-chat').onsubmit=submitContent;
    main_elem = document.getElementById('conversation-main');
    init = true;

    return componentDismount;
}

function buildForm() {
    document.getElementById('submit-chat').innerHTML = `
    <input type='text' name='send-content' placeholder='Ask anything here!'>
    <div class='send'>
        <input type='submit' class='submit-btn clickable'>
        <img class='submit-icon' src='/medias/send.svg'>
    </div>`;
}

function submitContent(evt) {
    evt.preventDefault();

    const content = evt.target['send-content'].value;
    content && (
        conversation.streamResponse ? 
        sendMessageStream(content) : 
        sendMessageWaiting(content)
    )
    evt.target['send-content'].value = ''
}

async function sendMessage(message, handleResponse) {
    if(!conversation.history.length) {
        main_elem.innerHTML = ''
    }
    main_elem.appendChild(createBlock('out', message)[0]);
    const [bot_answer, bot_answer_message] = createBlock('in');
    main_elem.appendChild(bot_answer);

    const response = await request('chat', {
        method: 'POST',
        body: { sessionUuid: conversation.id || "uuid", message }
    })

    const content = await handleResponse(response, bot_answer_message);

    appendConversationMessage([
        { type: 'out', message },
        { type: 'in', message: content}
    ], conversation.id)
}

function sendMessageWaiting(msg) {
    return sendMessage(msg, async (response, pending_elem) => {
        const { sessionUuid, message } = await response.json();
        if(conversation.id === null) { conversation.id = sessionUuid; }
        pending_elem.textContent = message;
        return message;
    })
}

function sendMessageStream(msg) {
    return sendMessage(msg, async (response, pending_elem) => {
        const streamResponseReader = 
        response.body.pipeThrough(new TextDecoderStream()).getReader();
    
        let content = '';
    
        while(true) {
            const { value, done } = await streamResponseReader.read();
            if(done) break;
            const {sessionUuid, message} = JSON.parse(value);
            if(sessionUuid && conversation.id === null) {
                conversation.id = sessionUuid;
            }
            content += message;
            pending_elem.textContent = content;
        }
        
        return content;
    })

}

function updateConversation() {
    if(!init || !conversation.history.length) return;

    main_elem.innerHTML = ''
    conversation.history.forEach(({type, message})=>{
        main_elem.appendChild(createBlock(type, message)[0])
    })

    if(conversation.history.slice(-1)[0].type === 'out') {
        main_elem.appendChild(createBlock('in')[0])
    }
}

function createBlock(type, message=null) {
    const block = document.createElement('div');
    block.className = `conversation-block sender-${type}`;

    const content = document.createElement('div')
    content.className = 'content';
    content.innerHTML = `
    <div class='sender-name'>
        From: ${type === 'in' ? 'AI' : 'You'}
    </div>`

    const message_elem = document.createElement('div');
    message_elem.className = 'message';
    message_elem.innerHTML = message || "<img class='loading' src='/medias/arrow-clockwise.svg'>"

    content.insertAdjacentElement("beforeend", message_elem);
    block.appendChild(content);

    const avatar = `
    <div class='avatar'>
        ${type === 'in' ? '<img src="/medias/robot.svg">' : '<img src="/medias/person.svg">'}
    </div>`

    if(type === 'in') block.insertAdjacentHTML("afterbegin", avatar);
    else if(type === 'out') block.insertAdjacentHTML("beforeend", avatar);

    return [block, message_elem];
}