import useConversation from "../../global/useConversation.js";

let conversation = {}, main_elem, init = false;

const { componentDismount } = useConversation(c=>{
    conversation = c;
    updateConversation();
})

export default function createChatMain(main) {
    main.insertAdjacentHTML('beforeend', `
    <div id='chat-main'>
        <div id='conversation-main'></div>
        <form id='submit-chat' autocomplete="off">
            <input type='text' name='send-content' placeholder='Ask anything here!'>
            <div class='send'>
                <input type='submit' class='submit-btn clickable'>
                <img class='submit-icon' src='/medias/send.svg'>
            </div>
        </form>
    </div>`)

    document.getElementById('submit-chat').onsubmit=submitContent;
    main_elem = document.getElementById('conversation-main');
    init = true;
    updateConversation();

    return componentDismount;
}

function submitContent(evt) {
    evt.preventDefault();

    const content = evt.target['send-content'].value;
    console.log(content);
    evt.target['send-content'].value = ''
}

function updateConversation() {
    if(!init) return;

    main_elem.innerHTML = ''
    conversation.history.forEach(({type, message})=>{
        let block = document.createElement('div');
        block.className = 'conversation-block';

        block.innerHTML = `
        <div class='avatar'>
            ${type === 'in' ? '<img src="/medias/robot.svg">' : ''}
        </div>
        <div class='content'>
            <div class='sender-name'>
                From: ${type === 'in' ? 'AI' : 'You'}
            </div>
            <div class='message'>
                ${message}
            </div>
        </div>`
        main_elem.appendChild(block)
    })
}