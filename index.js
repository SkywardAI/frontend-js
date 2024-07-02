import createChatPage from "./components/chatpage/index.js";
import createSideBar from "./components/sidebar.js";

let last_selected_page = '';
let componentClear = null;

function switchSelectedPage(page) {
    if(page === last_selected_page) return;
    componentClear && componentClear();

    switch(page) {
        case 'chat':
        case 'default':
            componentClear = createChatPage();
            break;
    }

    // change side-bar icon class
    document.getElementById(`sidebar-icon-${page}`).classList.add('selected');
    last_selected_page && document.getElementById(`sidebar-icon-${last_selected_page}`).classList.remove('selected');
    last_selected_page = page;
}
function build() {
    createSideBar(switchSelectedPage);
}

window.onload = build;