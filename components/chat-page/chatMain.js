import useConversation from "../../global/useConversation.js";
import useHistory from "../../global/useHistory.js";
import useModelSettings from "../../global/useModelSettings.js";
import { formatJSON } from "../../tools/conversationFormat.js";
import request from "../../tools/request.js";
import getSVG from "../../tools/svgs.js";

let conversation = {}, model_settings = {}, 
    main_elem, toggle_expand,
    stream_response=true, init = false;

const { 
    componetDismount: conversationDismount, 
    componentReMount: conversationReMount, 
    togglePending,
    sendMessage:appendConversationMessage 
} = useConversation(c=>{
    conversation.pending = c.pending;
    const submit_icon = document.querySelector('#submit-chat .send svg.submit-icon');
    submit_icon && submit_icon.classList.toggle('pending', conversation.pending)
    if(c.id === conversation.id) return;
    conversation = c;
    if(!conversation.id) {
        if(main_elem) {
            main_elem.innerHTML = `
            <div class='greeting'>
                Please select a ticket or start a new conversation on left.
            </div>`
            document.getElementById('submit-chat').innerHTML = '';
        }
        return;
    }

    updateConversation();
    buildForm();
})

const {
    componetDismount: modelSettingsDismount,
    componentReMount: modelSettingsRemount
} = useModelSettings(s=>{
    model_settings = s;
})

const { getHistory, updateHistoryName } = useHistory();

export default function createChatMain(main, toggleExpand, openModelSetting) {
    main.insertAdjacentHTML('beforeend', `
    <div class='chat-outer-main'>
        <div 
            id='toggle-sidebar-expand' class='clickable function-icon'
            title="Show/Hide Tickets History"
        >
            ${getSVG('window-sidebar')}
        </div>
        <div 
            id='toggle-setting-page' class='clickable function-icon'
            title="Show Model Settings"
        >
            ${getSVG('gear')}
        </div>
        <div 
            id='download-conversation' class='clickable function-icon'
            title="Export Current Conversation as JSON"
        >
            ${getSVG('box-arrow-up')}
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

    if(!init) {
        toggle_expand = toggleExpand;
        document.getElementById('submit-chat').onsubmit=submitContent;
        main_elem = document.getElementById('conversation-main');
        document.getElementById('toggle-sidebar-expand').onclick = toggle_expand;
        document.getElementById('toggle-setting-page').onclick = openModelSetting;
        document.getElementById('download-conversation').onclick = () => {
            if(conversation.id && conversation.history.length) {
                formatJSON(conversation, getHistory(conversation.id))
            }
        }
        init = true;
    } else {
        modelSettingsRemount();
    }

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
    const submit_chat =  document.getElementById('submit-chat')
    submit_chat.innerHTML = `
    <div class='send'>
        <input type='submit' class='submit-btn clickable'>
        ${getSVG('send', 'submit-icon')}
    </div>`;

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'send-content';
    input.placeholder = 'Ask anything here!';

    submit_chat.insertAdjacentElement("afterbegin", input);
    submit_chat.clientHeight;
    
    if(!conversation.history.length) {
        toggle_expand();
        input.focus();
    }
}

function submitContent(evt) {
    evt.preventDefault();
    if(conversation.pending) return;

    const content = evt.target['send-content'].value;
    content && (
        stream_response ? 
        sendMessageStream(content) : 
        sendMessageWaiting(content)
    )
    evt.target['send-content'].value = ''
}

async function sendMessage(message, send) {
    togglePending();
    if(!conversation.history.length) {
        main_elem.innerHTML = ''
        const message_len = message.length;
        updateHistoryName(conversation.id, 
        `${message.substring(0, 25)}${message_len > 25 ? '...' : ''}`)
    }
    main_elem.appendChild(createBlock('user', message)[0]);
    main_elem.scrollTo({
        top: main_elem.scrollHeight, 
        behavior: 'smooth'
    })
    const [bot_answer, updateMessage] = createBlock('assistant');
    main_elem.appendChild(bot_answer);

    const response = await request('chat', {
        method: 'POST',
        body: { 
            sessionUuid: conversation.id || "uuid", 
            message, ...model_settings
        }
    }, true)

    const content = await send(response, updateMessage);
    togglePending();

    appendConversationMessage([
        { role: 'user', message },
        { role: 'assistant', message: content}
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
    conversation.history.forEach(({role, message})=>{
        main_elem.appendChild(createBlock(role, message)[0])
    })
    main_elem.scrollTo({
        top: main_elem.scrollHeight, 
        behavior: 'smooth'
    })
}

function createBlock(role, msg = '') {
    const block = document.createElement('div');
    block.className = `conversation-block sender-${role}`;

    const message = document.createElement('div');
    message.className = 'message';

    block.appendChild(message);

    if(role === 'assistant') {
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