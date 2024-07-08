import useConversation from "../../global/useConversation.js";
import request from "../../tools/request.js";

let conversation = {}, main_elem;

const { 
    componetDismount, componentReMount, 
    sendMessage:appendConversationMessage 
} = useConversation(c=>{
    if(c.id === conversation.id) return;
    conversation = c;
    if(!conversation.id) return;

    updateConversation();
    buildForm();
})

export default function createChatMain(main) {
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

    if(componentReMount() && conversation.id) {
        updateConversation();
        buildForm();
    }

    return componetDismount;
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
        conversation.stream_response ? 
        sendMessageStream(content) : 
        sendMessageWaiting(content)
    )
    evt.target['send-content'].value = ''
}

async function sendMessage(message, send) {
    if(!conversation.history.length) {
        main_elem.innerHTML = ''
    }
    main_elem.appendChild(createBlock('out', message)[0]);
    const [bot_answer, bot_answer_message] = createBlock('in');
    main_elem.appendChild(bot_answer);
    bot_answer.focus();

    const response = await request('chat', {
        method: 'POST',
        body: { sessionUuid: conversation.id || "uuid", message }
    })

    const content = await send(response, bot_answer_message);

    appendConversationMessage([
        { type: 'out', message },
        { type: 'in', message: content}
    ], conversation.id)
}

function sendMessageWaiting(msg) {
    return sendMessage(msg, async (response, pending_elem) => {
        const { message } = await response.json();
        pending_elem.textContent = message;
        return message;
    })
}

async function sendMessageStream(msg) {
    return sendMessage(msg, async (response, pending_elem) => {
        let resp_content = ''
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let pending_content = ''
        while(true) {
            const {value, done} = await reader.read();
            if(done) break;
            pending_content += value;
            if(pending_content.includes('\n\n')) {
                const splitted_content = pending_content.split('\n\n')
                try {
                    const json = JSON.parse(splitted_content.shift().replace('data: ', ''))
                    resp_content += json.content;
                    pending_elem.textContent = resp_content;
                    pending_content = splitted_content.join('')
                    if(json.stop) break;
                } catch(error) {
                    console.error(error);
                }
            }
        }
    })
}

function updateConversation() {
    if(!conversation.history) return;
    if(!conversation.history.length && main_elem) {
        main_elem.innerHTML = "<div class='greeting'>Hi, how can I help you today?</div>"
        return;
    }

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