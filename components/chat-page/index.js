import createChatMain from "./chatMain.js";
import createChatHistory from "./history.js";
import createModelSettings from "./modelSettings.js";

export default function createChatPage() {
    const chatPage = document.createElement('div');
    chatPage.id = 'chat-page';
    chatPage.className = 'sidebar-expanded';
    document.getElementById('main').appendChild(chatPage);

    function toggleExpand() {
        chatPage.classList.toggle('sidebar-expanded');
    }

    let model_setting_elem;
    function openModelSetting() {
        model_setting_elem && model_setting_elem.showModal();
    }

    const dismount_components = []

    dismount_components.push(createChatHistory(chatPage));
    dismount_components.push(createChatMain(chatPage, toggleExpand, openModelSetting));
    dismount_components.push(createModelSettings(chatPage, elem=>model_setting_elem = elem));

    return () => {
        dismount_components.forEach(e=>e());
    }
}