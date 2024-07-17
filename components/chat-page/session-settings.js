import useConversation from '../../global/useConversation.js';
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

export default function createSessionSettings(main) {
    session_settings = document.createElement('div');
    session_settings.className = 'session-settings disabled'
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
                if(success) showMessage(`Session renamed to </br><strong>${new_name}</strong>`, { type: 'success' });
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
    session_settings.appendChild(csv_upload_elem)

    main.appendChild(session_settings);
}