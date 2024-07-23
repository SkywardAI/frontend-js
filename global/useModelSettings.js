import createHook from "./createHook.js";
import debounce from '../tools/debounce.js'

const defaultSettings = {
    temperature: 0.2,
    top_k: 40,
    top_p: 0.9,
    n_predict: 512,
    collection_name: 'collection_name'
}

const savedSettings = localStorage.getItem('model-settings') ?
JSON.parse(localStorage.getItem('model-settings')) : {};

let currentSettings = {
    ...defaultSettings,
    ...savedSettings
}

const writeSettingsToLocal = debounce(()=>{
    localStorage.setItem(
        'model-settings',
        JSON.stringify(currentSettings)
    )
}, 5000)

const { onmount, remount, dismount, updateAll } = createHook();

function updateSettings(key, value) {
    currentSettings = {
        ...currentSettings,
        [key]: value
    }
    updateAll(currentSettings);
    writeSettingsToLocal();
}

function setToDefault(key) {
    if(key in defaultSettings) {
        updateSettings(key, defaultSettings[key])
        return true;
    } else {
        return false;
    }
}

export default function useModelSettings(updated) {
    const mount_key = onmount(updated)

    function componentReMount() {
        return remount(mount_key)(currentSettings)
    }

    updated && updated(currentSettings);

    return {
        updateSettings, setToDefault,
        componetDismount: dismount(mount_key), componentReMount
    }
}