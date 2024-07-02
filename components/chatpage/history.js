import useHistory from "../../global/useHistory.js";

let history = [], history_elem = null;

const { componentClear } = useHistory(h=>{
    history = h;
    updateHistoryList();
})

export default function createChatHistory(main) {
    history_elem = document.createElement('div');
    history_elem.id = 'chat-history';
    main.insertAdjacentElement('beforeend', history_elem);
    updateHistoryList();
    return componentClear;
}

function updateHistoryList() {
    if(!history_elem) return;

    history_elem.innerHTML = `${
        history.map(({name, createdAt})=>{
            return `
            <div class='ticket clickable'>
                <div class='title'>${name}</div>
                <div class='datetime'>${createdAt}</div>
                <div class='preview'>this is a preview</div>
            </div>`
        }).join('')
    }`
}