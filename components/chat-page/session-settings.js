import useConversation from '../../global/useConversation.js';
import useUser from '../../global/useUser.js';
import showMessage from '../../tools/message.js';
import request from '../../tools/request.js';
import fileSettingSection from './file-setting-section.js';
import textSettingSection from './text-setting-section.js';

let current_conversation = {}, session_settings, name_setter;

const { rename } = useConversation(c=>{
    if(session_settings) {
        session_settings.classList.toggle('disabled', !c.id)
    }
    if(c.name && name_setter && current_conversation.name !== c.name) {
        name_setter(c.name)
    }
    current_conversation = c;
});

let login = false;
useUser(user=>{
    login = user.id !== null;
    if(session_settings) {
        session_settings.classList.toggle('no-rag', !login)
    }
})

export default function createSessionSettings(main) {
    session_settings = document.createElement('div');
    session_settings.className = 'session-settings disabled'
    if(!login) session_settings.classList.add('no-rag')
    session_settings.innerHTML = `
    <div class='title'>Adjust Session Settings</div>
    <div class='sub-title'>* Cannot change RAG settings after session started *</div>
    `

    const [rename_elem, setName] = textSettingSection('Rename Session', new_name=>{
        if(!new_name) {
            setName(current_conversation.name)
        } else if(new_name === current_conversation.name) {
            return;
        } else {
            rename(new_name).then(success=>{
                const strong_name = document.createElement('strong');
                strong_name.textContent = new_name;
                if(success) showMessage([`Session renamed to`, document.createElement('br'), strong_name], { type: 'success' });
                else showMessage('Rename session failed!', { type: 'err' })
            })
        }
    })
    session_settings.appendChild(rename_elem);
    name_setter = setName;

    const csv_upload_elem = fileSettingSection('Upload CSV file for RAG', async form=>{
        const form_data = new FormData(form);
        const { http_error } = await request('/api/file', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: form_data
        });
        if(http_error) {
            showMessage("File upload failed!", { type: "err" });
        } else {
            showMessage("File upload success!", { type: "success" });
        }
    }, ['csv'])
    csv_upload_elem.classList.add('rag-option')
    session_settings.appendChild(csv_upload_elem)

    main.appendChild(session_settings);
}