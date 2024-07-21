import useConversation from '../../global/useConversation.js';
import useUser from '../../global/useUser.js';
import showMessage from '../../tools/message.js';
// import request from '../../tools/request.js';
import normalSettingSection from './normal-setting-section.js';

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

    const [rename_elem, setName] = normalSettingSection('text', 'Rename Session', new_name=>{
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

    const [select_dataset_elem] = normalSettingSection('select', "Select Dataset For RAG", dataset_name=>{
        dataset_name && showMessage(`"${dataset_name}" Selected`)
    }, [{value:'', title: '-- Please select a dataset --'}, {value: 'example/dataset1'}, {value: 'example/dataset2'}, {value: 'example/dataset3'}])
    select_dataset_elem.classList.add('rag-option')
    session_settings.appendChild(select_dataset_elem)

    main.appendChild(session_settings);
}