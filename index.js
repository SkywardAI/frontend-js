import createChatPage from "./components/chatpage/index.js";
import createSideBar from "./components/sidebar.js";

let last_selected_page = '';
let componetDismount = null;

function switchSelectedPage(page) {
    if(page === last_selected_page) return;
    document.getElementById('main').innerHTML = '';
    componetDismount && componetDismount();

    switch(page) {
        case 'chat':
        case 'default':
            componetDismount = createChatPage();
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