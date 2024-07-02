import createChatMain from "./chatMain.js";
import createChatHistory from "./history.js";
import createModelSettings from "./modelSettings.js";

export default function createChatPage() {
    const main = document.getElementById('main');
    main.innerHTML = '';
    
    const chatPage = document.createElement('div');
    chatPage.id = 'chat-page'

    main.appendChild(chatPage);

    const components_clear = []

    components_clear.push(createChatHistory(chatPage));
    components_clear.push(createChatMain(chatPage));
    components_clear.push(createModelSettings(chatPage));

    return () => {
        components_clear.forEach(e=>e&&e());
    }
}