import useModelSettings from "../../global/useModelSettings.js";
import settingSection from "./settingSection.js";

let settings = {};

const { 
    componentReMount, componetDismount, 
    updateSettings:updateModelSettings, setToDefault
} = useModelSettings(s=>settings = s);

const fields = {
    temperature: { title: 'Temperature', valueRange: { min: 0, max: 2, is_100_times: true } },
    top_k: { title: 'Top-K', valueRange: { min: 0, max: 40 } },
    top_p: { title: 'Top-P', valueRange: { min: 0, max: 0.9, is_100_times: true } },
    n_predict: { title: 'N-Predict', valueRange: { min: 128, max: 512 } }
}

export default function createModelSettings(main, passDialogElem) {
    componentReMount();

    const popup = document.createElement('dialog');
    popup.onclick = () => popup.close();
    main.insertAdjacentElement("beforeend", popup)
    passDialogElem(popup)

    const model_settings = document.createElement('div');
    model_settings.className = 'model-settings';
    model_settings.onclick = event => event.stopPropagation();

    model_settings.insertAdjacentHTML('afterbegin', `
        <div class='title'>Adjust Model Settings</div>
        <div class='sub-title'>Settings will be saved automatically</div>
    `)

    for(const key in fields) {
        const { title, valueRange } = fields[key];
        const [component, setter] = settingSection(
            title, valueRange,
            () => { setToDefault(key) && loadSettings() },
            value=>updateModelSettings(key, value)
        )
        model_settings.appendChild(component);
        fields[key].setValue = setter;
    }

    popup.appendChild(model_settings);

    loadSettings();
    return componetDismount;
}

function loadSettings() {
    for(const key in fields) {
        fields[key].setValue(settings[key]);
    }
}