import createModelSettings from "./model-settings.js";
import createSessionSettings from "./session-settings.js";

let init = false

export default function createChatSettingsPage(main, close_setting) {
    if(!init) {
        const setting_main = document.createElement('div');
        setting_main.className = 'chat-settings'
        setting_main.onclick = evt => evt.stopPropagation();

        createSessionSettings(setting_main, close_setting);
        createModelSettings(setting_main);

        main.appendChild(setting_main);
        init = true;
    }

    return null;
}