import useConversation from '../../global/useConversation.js';
import useUser from '../../global/useUser.js';
import showMessage from '../../tools/message.js';
import request from '../../tools/request.js';
import normalSettingSection from './normal-setting-section.js';
import rangeSettingSection from './range-setting-section.js';

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

let current_conversation = {}, session_settings, name_setter
let selected_dataset = '', dataset_ratio = 0.1;

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

    session_settings.insertAdjacentHTML("beforeend", "<hr class='rag-option'>")

    // eslint-disable-next-line no-unused-vars
    const [select_dataset_elem, _, updateDatasetVars] = normalSettingSection('select', "Select Dataset For RAG", 
        dataset_name=>{
            selected_dataset = dataset_name;
        }, [{value:'', title: '-- Please select a dataset --'}]
    )
    updateDatasetOptions = updateDatasetVars;
    select_dataset_elem.classList.add('rag-option')
    session_settings.appendChild(select_dataset_elem)
    login && updateUserDatasetList();

    const [ ratio_range, setRatioRange ] = rangeSettingSection(
        'Dataset Ratio', 
        { max: 1, min: 0.1, is_100_times: true, step: 10 }, 
        ()=>{ setRatioRange(0.1) }, 
        value=>{
            dataset_ratio = value;
        }
    );
    setRatioRange(0.1)
    ratio_range.classList.add('rag-option')
    session_settings.appendChild(ratio_range);

    const [submit_dataset_btn, setBtnValue] = normalSettingSection(
        "button", "Confirm Dataset Options", null,  submitDatasetOptions
    )
    setBtnValue('Confirm')
    submit_dataset_btn.classList.add('rag-option');
    session_settings.appendChild(submit_dataset_btn)

    session_settings.insertAdjacentHTML("beforeend", "<hr class='rag-option'>")
    main.appendChild(session_settings);
}

async function submitDatasetOptions() {
    console.log(selected_dataset, dataset_ratio)
    showMessage('RAG Options Confirmed')
    session_settings.classList.add('no-rag')
}