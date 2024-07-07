import useConversation from "../../global/useConversation.js";

let conversation = {}, main_elem, init = false;

const { componentDismount, sendMessage } = useConversation(c=>{
    console.log(c)
    conversation = c;
    if(conversation.id === null) {
        const conversation_main = document.getElementById('conversation-main');
        if(conversation_main) conversation_main.innerHTML = "<div class='greeting'>Hi, how can I help you today?</div>"
    }
    if(conversation.id !== 'not_selected') {
        buildForm();
    }
    updateConversation();
})

export default function createChatMain(main) {
    main.insertAdjacentHTML('beforeend', `
    <div id='chat-main'>
        <div id='conversation-main'><div class='greeting'>Please select a ticket or start a new conversation on left.</div></div>
        <form id='submit-chat' autocomplete="off"></form>
    </div>`)

    document.getElementById('submit-chat').onsubmit=submitContent;
    main_elem = document.getElementById('conversation-main');
    init = true;
    updateConversation();

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
    content && sendMessage(content);
    evt.target['send-content'].value = ''
}

function updateConversation() {
    if(!init || !conversation.history.length) return;

    main_elem.innerHTML = ''
    conversation.history.forEach(({type, message})=>{
        const block = createBlock(type, message);
        main_elem.appendChild(block)
    })

    if(conversation.history.slice(-1)[0].type === 'out') {
        main_elem.appendChild(createBlock('in'))
    }
}

function createBlock(type, message=null) {
    const block = document.createElement('div');
    block.className = `conversation-block sender-${type}`;

    block.innerHTML = `
    <div class='content'>
        <div class='sender-name'>
            From: ${type === 'in' ? 'AI' : 'You'}
        </div>
        <div class='message'>
            ${message || "<img class='loading' src='/medias/arrow-clockwise.svg'>"}
        </div>
    </div>`

    const avatar = `
    <div class='avatar'>
        ${type === 'in' ? '<img src="/medias/robot.svg">' : '<img src="/medias/person.svg">'}
    </div>`

    if(type === 'in') block.insertAdjacentHTML("afterbegin", avatar);
    else if(type === 'out') block.insertAdjacentHTML("beforeend", avatar);

    return block;
}