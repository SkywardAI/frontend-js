import useConversation from "../../global/useConversation.js";
import useModelSettings from "../../global/useModelSettings.js";
import request from "../../tools/request.js";
import getSVG from "../../tools/svgs.js";

let conversation = {}, model_settings = {}, main_elem, stream_response=true;

const { 
    componetDismount: conversationDismount, 
    componentReMount: conversationReMount, 
    sendMessage:appendConversationMessage 
} = useConversation(c=>{
    if(c.id === conversation.id) return;
    conversation = c;
    if(!conversation.id) return;

    updateConversation();
    buildForm();
})

const {
    componetDismount: modelSettingsDismount,
    componentReMount: modelSettingsRemount
} = useModelSettings(s=>{
    model_settings = s;
})

export default function createChatMain(main, toggleExpand) {
    main.insertAdjacentHTML('beforeend', `
    <div class='chat-outer-main'>
        <div id='toggle-sidebar-expand' class='clickable'>
            ${getSVG('window-sidebar')}
        </div>
        <div id='chat-main'>
            <div id='conversation-main'>
                <div class='greeting'>
                    Please select a ticket or start a new conversation on left.
                </div>
            </div>
            <form id='submit-chat' autocomplete="off"></form>
        </div>
    </div>`)

    document.getElementById('submit-chat').onsubmit=submitContent;
    main_elem = document.getElementById('conversation-main');
    document.getElementById('toggle-sidebar-expand').onclick = toggleExpand;

    modelSettingsRemount();
    if(conversationReMount() && conversation.id) {
        updateConversation();
        buildForm();
    }

    return ()=>{
        conversationDismount();
        modelSettingsDismount();
    };
}

function buildForm() {
    document.getElementById('submit-chat').innerHTML = `
    <input type='text' name='send-content' placeholder='Ask anything here!'>
    <div class='send'>
        <input type='submit' class='submit-btn clickable'>
        ${getSVG('send', 'submit-icon')}
    </div>`;
}

function submitContent(evt) {
    evt.preventDefault();

    const content = evt.target['send-content'].value;
    content && (
        stream_response ? 
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
    main_elem.scrollTo({
        top: main_elem.scrollHeight, 
        behavior: 'smooth'
    })
    const [bot_answer, updateMessage] = createBlock('in');
    main_elem.appendChild(bot_answer);

    const response = await request('chat', {
        method: 'POST',
        body: { 
            sessionUuid: conversation.id || "uuid", 
            message, ...model_settings
        }
    })

    const content = await send(response, updateMessage);

    appendConversationMessage([
        { type: 'out', message },
        { type: 'in', message: content}
    ], conversation.id)
}

function sendMessageWaiting(msg) {
    return sendMessage(msg, async (response, updateMessage) => {
        const { message } = await response.json();
        updateMessage(message)
        return message;
    })
}

async function sendMessageStream(msg) {
    return sendMessage(msg, async (response, updateMessage) => {
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
                    updateMessage(resp_content);
                    pending_content = splitted_content.join('')
                    if(json.stop) break;
                } catch(error) {
                    console.error(error);
                }
            }
        }
        return resp_content;
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
}

function createBlock(type, msg = '') {
    const block = document.createElement('div');
    block.className = `conversation-block sender-${type}`;

    const message = document.createElement('div');
    message.className = 'message';

    block.appendChild(message);

    if(type === 'in') {
        message.innerHTML = `
        ${getSVG('circle-fill', 'dot-animation dot-1')}
        ${getSVG('circle-fill', 'dot-animation dot-2')}
        ${getSVG('circle-fill', 'dot-animation dot-3')}`

        block.insertAdjacentHTML("afterbegin", `<img class='avatar' src='/medias/SkywardAI.png'>`)
    }

    if(msg) {
        message.textContent = msg;
    }

    return [
        block,
        (msg) => {
            if(msg) {
                message.textContent = msg;
                main_elem.scrollTo({
                    top: main_elem.scrollHeight, 
                    behavior: 'smooth'
                })
            }
        }
    ]
}