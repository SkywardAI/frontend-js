import useConversation from '../../global/useConversation.js';
import useUser from '../../global/useUser.js';
import showMessage from '../../tools/message.js';
import request from '../../tools/request.js';
import normalSettingSection from './normal-setting-section.js';

let updateDatasetOptions;

async function updateUserDatasetList() {
    if(!updateDatasetOptions) return;
    const response = await request('ds/list');
    if(!Array.isArray(response) && response.http_error) {
        showMessage('Get user dataset list failed!', { type: 'err' })
    } else {
        const available_datasets = response.map(({name})=>{
            return { value: name }
        });
        updateDatasetOptions([
            {value:'', title: '-- Please select a dataset --'},
            ...available_datasets
        ])
    }
}

let current_conversation = {}, session_settings, name_setter;

const { rename } = useConversation(c=>{
    if(session_settings) {
        session_settings.classList.toggle('disabled', !c.id)
        session_settings.classList.toggle('no-rag', c.type === 'chat')
    }
    if(c.name && name_setter && current_conversation.name !== c.name) {
        name_setter(c.name)
    }
    current_conversation = c;
});

let login = false;
useUser(user=>{
    login = user.id !== null;
    login && updateUserDatasetList();
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

    // eslint-disable-next-line no-unused-vars
    const [select_dataset_elem, _, updateDatasetVars] = normalSettingSection('select', "Select Dataset For RAG", async dataset_name=>{
        // TODO: upload dataset selection
        const { http_error } = await request('ds/load', {
            method: 'POST',
            body: {
                name: dataset_name,
                des: 'string',
                ratio: 0
            }
        })
        if(!http_error) {
            showMessage(dataset_name ? `"${dataset_name}" Selected` : 'Deselect Dataset')
        } else {
            showMessage('Upload dataset failed! Please check your network.', { type: 'err' })
        }
    }, [{value:'', title: '-- Please select a dataset --'}])
    updateDatasetOptions = updateDatasetVars;
    select_dataset_elem.classList.add('rag-option')
    session_settings.appendChild(select_dataset_elem)
    login && updateUserDatasetList();

    main.appendChild(session_settings);
}