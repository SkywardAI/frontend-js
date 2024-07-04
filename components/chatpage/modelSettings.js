import useConversation from "../../global/useConversation.js";
import debounce from "../../tools/debounce.js";
import settingSection from "./settingSection.js";

let settings = {}, updated_settings = {}, init = false;

const fields = {
    temperature: { title: 'Temperature', valueRange: { min: 0, max: 2, is_100_times: true } },
    top_k: { title: 'Top-K', valueRange: { min: 0, max: 40 } },
    top_p: { title: 'Top-P', valueRange: { min: 0, max: 0.9, is_100_times: true } },
    n_predict: { title: 'N-Predict', valueRange: { min: 0, max: 128 } }
}

const { componentDismount, updateSetting, componentReMount } = useConversation(c=>{
    settings = c;
    loadSettings();
})

const updateModelSettings = debounce(async ()=>{
    if(!await updateSetting(updated_settings)) {
        loadSettings();
        // TODO: show failed notification
    } else {
        // TODO: show success notification
    }
}, 500)

export default function createModelSettings(main) {
    componentReMount();

    const model_settings = document.createElement('div');
    model_settings.className = 'model-settings';

    model_settings.insertAdjacentHTML('afterbegin', "<div class='title'>Adjust Model Settings</div>")

    for(const key in fields) {
        const { title, valueRange } = fields[key];
        const [component, setter] = settingSection(title, valueRange, value=>{
            updated_settings[key] = value;
            updateModelSettings();
        })
        model_settings.appendChild(component);
        fields[key].setValue = setter;
    }

    main.appendChild(model_settings);

    init = true;
    loadSettings();
    return componentDismount;
}

function loadSettings() {
    if(!init) return;

    for(const key in fields) {
        fields[key].setValue(settings[key]);
    }
}