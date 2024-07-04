import useConversation from "../../global/useConversation.js";
import debounce from "../../tools/debounce.js";

let settings = {}, updated_settings = {}, init = false;

const fields = [
    { title: 'Temperature', idx_name: 'temperature', input_type: 'range' },
    { title: 'Top-K', idx_name: 'top_k' },
    { title: 'Top-P', idx_name: 'top_p' },
    { title: 'N-Keep', idx_name: 'n_keep' },
    { title: 'N-Predict', idx_name: 'n_predict' }
]

let
    temperature_range_elem, temperature_text_elem,
    top_k_elem, top_p_elem, n_keep_elem, n_predict_elem

const { componentDismount, updateSetting, componentReMount } = useConversation(c=>{
    settings = c;
    loadSettings();
})

export default function createModelSettings(main) {

    componentReMount();

    main.insertAdjacentHTML("beforeend", `
    <div class='model-settings'>
        <div class='title'>Adjust Model Settings</div>
        ${fields.map(({title, idx_name, input_type}) => {
            return `
            <div class='setting-section'>
                <div class='title'>${title}</div>
                ${
                input_type === 'range'?
                `<div class='combined-section range'>
                    <input type='range' id='setting-${idx_name}'>
                    <input type='text' id='setting-${idx_name}-value'>
                </div>` : 
                // else
                `<input type='text' id='setting-${idx_name}'>`
                }
        </div>`
        }).join('')}
    </div>`)

    temperature_range_elem = document.getElementById('setting-temperature');
    temperature_text_elem = document.getElementById('setting-temperature-value');
    top_k_elem = document.getElementById('setting-top_k');
    top_p_elem = document.getElementById('setting-top_p');
    n_keep_elem = document.getElementById('setting-n_keep');
    n_predict_elem = document.getElementById('setting-n_predict');

    init = true;
    addEvtListeners();
    loadSettings();
    return componentDismount;
}

const updateModelSettings = debounce(async ()=>{
    if(!await updateSetting(updated_settings)) {
        loadSettings();
        // TODO: show failed notification
    } else {
        // TODO: show success notification
    }
}, 500)

function addEvtListeners() {
    function requestUpdate({evt, key, value}) {
        if(evt) {
            key = evt.target.id.substring(8)
            value = evt.target.value;
        }
        updated_settings[key] = value;
        updateModelSettings();
    }
    temperature_range_elem.oninput=(evt)=>{
        const value = (+evt.target.value) / 100;
        temperature_text_elem.value = value;
        requestUpdate({key: 'temperature', value});
    }
    temperature_text_elem.onchange=(evt)=>{
        const value = +evt.target.value
        temperature_range_elem.value = value * 100
        requestUpdate({key: 'temperature', value});
    }
    top_k_elem.onchange=requestUpdate
    top_p_elem.onchange=requestUpdate
    n_keep_elem.onchange=requestUpdate
    n_predict_elem.onchange=requestUpdate

}

function loadSettings() {
    if(!init) return;

    const {  
        temperature,
        top_k,
        top_p,
        n_keep,
        n_predict
    } = settings;

    temperature_range_elem.value = temperature * 100;
    temperature_text_elem.value = temperature;
    top_k_elem.value = top_k;
    top_p_elem.value = top_p;
    n_keep_elem.value = n_keep;
    n_predict_elem.value = n_predict;
}