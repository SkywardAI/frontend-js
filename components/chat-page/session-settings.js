import useConversation from '../../global/useConversation.js';
import useUser from '../../global/useUser.js';
import createDialog from '../../tools/dialog.js';
import showMessage from '../../tools/message.js';
import request from '../../tools/request.js';
import getSVG from '../../tools/svgs.js';
import normalSettingSection from './normal-setting-section.js';
import rangeSettingSection from './range-setting-section.js';

// ===================================================
//
//                  Local Variables
//
// ===================================================

let current_conversation = {}, user_id = null;
let rag_dataset_options = {};

// ===================================================
//
//                     Elements
//
// ===================================================

const [upload_dataset_cover, upload_dataset_cover_controller] = createDialog(false);
const show_dataset_loading = document.createElement('div');
show_dataset_loading.className = 'show-dataset-loading';
show_dataset_loading.innerHTML = 
`${getSVG('arrow-clockwise')}<div>Dataset loading, please wait...</div>`
upload_dataset_cover.appendChild(show_dataset_loading);

const session_settings = document.createElement('div');
session_settings.className = 'session-settings'
session_settings.innerHTML = 
`<div class='title'>Adjust Session Settings</div>
<div class='sub-title'>* Cannot change RAG settings after session started *</div>`

// ===========================rename============================

const [rename_session_elem, {
    setValue:setSessionName
}] = normalSettingSection('text', 'Rename Session', new_name=>{
    const old_name = current_conversation.name;
    if(!new_name) {
        setSessionName(old_name)
    } else if(new_name === old_name) {
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

// ===========================list============================

const [dataset_list_elem, {
    setValue:setSelectedDataset,
    setArgs:setDatasetList,
    toggleDisable:toggleDatasetListDisable 
}] = normalSettingSection('select', 'Select Dataset For RAG', select=>{
    rag_dataset_options.dataset_name = select;
}, [])
dataset_list_elem.classList.add('rag-option')

// ===========================range============================

const [dataset_range_elem, {
    toggleDisable:toggleDatasetRangeDisable
}] = rangeSettingSection('Dataset Ratio',
    { max: 1, min: 0.1, is_100_times: true, step: 10 },
    0.1, 
    ratio => {
        rag_dataset_options.ratio = ratio;
    },
    0.1
)
dataset_range_elem.classList.add('rag-option','hide-on-no-change')

// ===========================submit============================

const [submit_dataset_btn, {
    toggleDisable:toggleSubmitButtonDisable
}] = normalSettingSection(
    'button', 'Confirm Dataset Options', ()=>{}, 
    'Confirm', submitDatasetOptions
)
submit_dataset_btn.classList.add('rag-option','hide-on-no-change')

// ===================================================
//
//                      Functions
//
// ===================================================

function toggleRAGOptionsStatus(status) {
    // because we want to pass is_disabled which is oppsite to "status"
    status = !status;
    
    toggleDatasetListDisable(status);
    toggleDatasetRangeDisable(status);
    toggleSubmitButtonDisable(status);
}

async function submitDatasetOptions() {
    if(!rag_dataset_options.dataset_name) {
        showMessage('Please select a dataset to upload!', { type: 'err' });
        return;
    }
    upload_dataset_cover_controller.showModal();
    const { http_error } = await request('ds/load', {
        method: 'POST',
        body: {
            sessionUuid: current_conversation.id,
            des: "description",
            ...rag_dataset_options
        }
    })
    upload_dataset_cover_controller.close();

    if(http_error) {
        showMessage("Confirm dataset options failed!", { type: 'err' });
        return;
    }
    
    // This normally should not happen but here's a little backup
    if(user_id === null) return;
    session_settings.classList.add('no-rag-change');
    toggleRAGOptionsStatus(false);
    showMessage('RAG Options Confirmed')
}

async function updateUserDatasetList(list = []) {
    setDatasetList([
        {value:'', title: '-- Please select a dataset --'},
        ...list
    ])
}

// ===================================================
//
//                  Global Variables
//
// ===================================================

useUser(user=>{
    user_id = user.id;
    if(user_id !== null) {
        request('ds/list').then(response=>{
            if(!Array.isArray(response) && response.http_error) {
                showMessage('Get user dataset list failed!', { type: 'err' })
                updateUserDatasetList();
            } else {
                updateUserDatasetList(response.map(e=>{return {value: e.name}}));
            }
        })
    }
})

const { rename } = useConversation(conversation=>{
    current_conversation = conversation;
    setSessionName(conversation.name)
    session_settings.classList.toggle(
        'disabled',
        conversation.id === null
    );
    session_settings.classList.toggle(
        'no-rag',
        conversation.sessionType === 'chat' || user_id === null
    );

    const dataset_set_done = !!conversation.dataset_name;
    session_settings.classList.toggle(
        'no-rag-change',
        dataset_set_done
    )
    setSelectedDataset(conversation.dataset_name || '');
    toggleRAGOptionsStatus(!dataset_set_done);
})

// ===================================================
//
//                      Others
//
// ===================================================

session_settings.appendChild(rename_session_elem);
session_settings.insertAdjacentHTML("beforeend", "<hr class='rag-option hide-on-no-change'>");
session_settings.appendChild(dataset_list_elem);
session_settings.appendChild(dataset_range_elem);
session_settings.appendChild(submit_dataset_btn);
session_settings.insertAdjacentHTML("beforeend", "<hr class='rag-option hide-on-no-change'>");

// ===================================================
//
//                       Entry
//
// ===================================================

export default function createSessionSettings(main) {
    main.appendChild(session_settings);
}