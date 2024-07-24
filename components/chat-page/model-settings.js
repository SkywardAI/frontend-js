import useModelSettings from "../../global/useModelSettings.js";
import rangeSettingSection from "./range-setting-section.js";

let settings = {};

const { 
    updateSettings:updateModelSettings, setToDefault
} = useModelSettings(s=>settings = s);

const fields = {
    temperature: { title: 'Temperature', valueRange: { min: 0, max: 2, is_100_times: true } },
    top_k: { title: 'Top-K', valueRange: { min: 0, max: 40 } },
    top_p: { title: 'Top-P', valueRange: { min: 0, max: 0.9, is_100_times: true } },
    n_predict: { title: 'N-Predict', valueRange: { min: 128, max: 512 } }
}

export default function createModelSettings(main) {
    const model_settings = document.createElement('div');

    model_settings.innerHTML = `
        <div class='title'>Adjust Model Settings</div>
        <div class='sub-title'>Settings will be saved automatically</div>
    `

    for(const key in fields) {
        const { title, valueRange } = fields[key];
        const [component, {setter}] = rangeSettingSection(
            title, valueRange,
            () => { setToDefault(key) && loadSettings() },
            value=>updateModelSettings(key, value)
        )
        model_settings.appendChild(component);
        fields[key].setValue = setter;
    }

    main.appendChild(model_settings);
    loadSettings();
}

function loadSettings() {
    for(const key in fields) {
        fields[key].setValue(settings[key]);
    }
}