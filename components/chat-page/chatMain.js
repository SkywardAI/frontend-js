import useConversation from "../../global/useConversation.js";
import useHistory from "../../global/useHistory.js";
import useModelSettings from "../../global/useModelSettings.js";
import { formatJSON, formatMarkdown } from "../../tools/conversationFormat.js";
import showMessage from "../../tools/message.js";
import request from "../../tools/request.js";
import getSVG from "../../tools/svgs.js";
import createRAGSelector from "./rag-blocks.js";

let conversation = {pending: false}, model_settings = {}, 
    main_elem, toggle_expand,
    stream_response=true, download_conversation_icon;

let abort_controller;

const { 
    componetDismount: conversationDismount, 
    componentReMount: conversationReMount, 
    togglePending, rename,
    sendMessage:appendConversationMessage 
} = useConversation(c=>{
    conversation.pending = c.pending;
    const submit_chat_form = document.getElementById('submit-chat')
    submit_chat_form && submit_chat_form.classList.toggle('pending', conversation.pending);
    if(c.id === conversation.id) return;
    conversation = c;
    if(!conversation.id) {
        if(main_elem) {
            main_elem.innerHTML = `
            <div class='greeting'>
                Please select a ticket or start a new conversation on left.
            </div>`
            document.getElementById('submit-chat').innerHTML = '';
            download_conversation_icon.classList.add('hidden')
        }
        return;
    } else if(download_conversation_icon) {
        download_conversation_icon.classList.remove('hidden')
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

const { getHistory } = useHistory();

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
            id='download-conversation' class='clickable function-icon hidden'
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

    toggle_expand = toggleExpand;
    document.getElementById('submit-chat').onsubmit=submitContent;
    main_elem = document.getElementById('conversation-main');
    document.getElementById('toggle-sidebar-expand').onclick = toggle_expand;
    document.getElementById('toggle-setting-page').onclick = openModelSetting;
    download_conversation_icon = document.getElementById('download-conversation')
    download_conversation_icon.onclick = () => {
        if(conversation.id && conversation.history.length) {
            formatJSON(conversation, getHistory(conversation.id))
        }
    }
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
    const submit_chat =  document.getElementById('submit-chat')
    submit_chat.innerHTML = `
    <div class='right-button'>
        <input type='submit' class='btn clickable'>
        ${getSVG('send', 'icon send')}
    </div>`;

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'send-content';
    input.placeholder = 'Ask anything here!';

    submit_chat.insertAdjacentElement("afterbegin", input);
    submit_chat.clientHeight;

    const abortMessage = document.createElement('div');
    abortMessage.className = 'right-button abort-message clickable'
    abortMessage.onclick = () => {
        conversation.pending && abort_controller.abort();
    }
    abortMessage.innerHTML = getSVG('stop-circle-fill', 'icon');
    submit_chat.appendChild(abortMessage);

    if(!conversation.history.length) {
        toggle_expand();
        input.focus();
    }
}

function submitContent(evt) {
    evt.preventDefault();
    if(conversation.pending) {
        showMessage(
            "Please wait until assistant finished response or abort manually.",
            { type: 'warn' }
        )
        return;
    }

    const content = evt.target['send-content'].value;
    if(content) {
        stream_response ? 
        sendMessageStream(content) : 
        sendMessageWaiting(content)
    } else {
        showMessage(
            "Message is empty, feel free to ask anything!",
            { type: 'warn' }
        )
        return;
    }
    evt.target['send-content'].value = ''
}

async function sendMessage(message, send) {
    togglePending();
    if(!conversation.history.length) {
        main_elem.innerHTML = ''
        const message_len = message.length;
        await rename(`${message.substring(0, 25)}${message_len > 25 ? '...' : ''}`)
    }
    main_elem.appendChild(createBlock('user', message)[0]);
    main_elem.scrollTo({
        top: main_elem.scrollHeight, 
        behavior: 'smooth'
    })
    const [bot_answer, elements] = createBlock('assistant');
    main_elem.appendChild(bot_answer);

    let content = ''
    try {
        abort_controller = new AbortController();
        const response = await request('chat', {
            method: 'POST',
            signal: abort_controller.signal,
            body: { 
                sessionUuid: conversation.id || "uuid", 
                message, ...model_settings
            }
        }, true)
    
        await send(response, elements, c=>content = c);
    } catch(error) {
        error;
        if(content) content+=' ...'
        content += '(Message Abroted)'
        elements.main = content;
    } finally {
        appendConversationMessage([
            { role: 'user', message },
            { role: 'assistant', message: content}
        ], conversation.id);
        togglePending();
    }
}

function sendMessageWaiting(msg) {
    return sendMessage(msg, async (response, updateMessage) => {
        const { message } = await response.json();
        updateMessage(message)
        return message;
    })
}

async function sendMessageStream(msg) {
    return sendMessage(msg, async (response, elements, updateContent) => {
        const { main, pending, started } = elements;
        let msg_started = false;
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let resp_content = '', pending_content = '', html_content = '', end_block = null
        while(true) {
            const {value, done} = await reader.read();
            if(done) break;
            pending_content += value;
            if(pending_content.includes('}\n\n')) {
                const splitted_content = pending_content.split('}\n\n')
                try {
                    if(!msg_started) {
                        msg_started = true;
                        started();
                    }
                    const json = JSON.parse(splitted_content.shift().replace('data: ', '')+'}')
                    pending_content = splitted_content.join('}\n\n')
                    resp_content += json.content;
                    html_content += json.content;
                    const parsed_md = formatMarkdown(html_content, main, pending, end_block);
                    main_elem.scrollTo({
                        top: main_elem.scrollHeight, 
                        behavior: 'smooth'
                    })
                    if(parsed_md) {
                        html_content = parsed_md[0];
                        end_block = parsed_md[1];
                    }
                    updateContent(resp_content);
                    if(json.stop) break;
                } catch(error) { 
                    console.error(error);
                }
            }
        }
        formatMarkdown(html_content, main, pending, end_block, true);
    })
}

function updateConversation() {
    if(!conversation.history) return;
    if(!conversation.history.length && main_elem) {
        main_elem.innerHTML = "<div class='greeting start-session'>Hi, how can I help you today?</div>"
        main_elem.appendChild(createRAGSelector(conversation))
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
        block.insertAdjacentHTML("afterbegin", `<img class='avatar' src='/medias/SkywardAI.png'>`)
        if(!msg) {
            message.innerHTML = `
            ${getSVG('circle-fill', 'dot-animation dot-1')}
            ${getSVG('circle-fill', 'dot-animation dot-2')}
            ${getSVG('circle-fill', 'dot-animation dot-3')}`
        }
    }

    const pending_elem = document.createElement('div');

    if(msg) {
        message.appendChild(pending_elem);
        formatMarkdown(msg, message, pending_elem, null, true);
    }

    return [
        block,
        {
            main: message,
            pending: pending_elem,
            started: ()=>{ message.innerHTML = ''; message.appendChild(pending_elem); }
        }
    ]
}