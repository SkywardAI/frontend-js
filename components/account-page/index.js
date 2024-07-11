import capitalizeFirstLetter from "../../tools/capitalizeFirstLetter.js";

let account_dialog;

function toggleDialog(force = null) {
    if(!account_dialog) return false;

    let open_status = force === null ? !account_dialog.open : force;
    open_status ? account_dialog.showModal() : account_dialog.close();

    return true;
}

const account_fields = {
    login: [
        { index: 'username' },
        { index: 'password', type: 'password' },
    ],
    register: [
        { index: 'username' },
        { index: 'email' },
        { index: 'password', type: 'password' },
        { index: 'repeat-password', title: 'Repeat Password', type: 'password' }
    ],
    logged_in: [
        { index: 'username', title: 'Update Username' },
        { index: 'email', title: 'Update Email' },
        { index: 'password', title: 'Update Password', type: 'password' },
    ]
}

export default function createAccountPage() {
    if(toggleDialog()) return;

    account_dialog = document.createElement('dialog');
    account_dialog.onclick = () => toggleDialog(false);
    document.getElementById('user-popup-container').appendChild(account_dialog)

    const account_main_page = document.createElement('form');
    account_main_page.className = 'account-main';
    account_main_page.onclick = evt => evt.stopPropagation();

    account_main_page.insertAdjacentHTML("afterbegin", `
    <div class='logo-image'><img src='/medias/SkywardAI.png'></div>`)

    const input_main = document.createElement('div');
    input_main.className = 'input-details-main';

    // TODO: if logged in
    account_fields.login.forEach(e=>{
        input_main.appendChild(createAccountInputFields(e))
    })

    input_main.insertAdjacentHTML("beforeend", "<hr>")

    const submit_button = document.createElement('button')
    submit_button.type = 'submit'
    submit_button.className = 'submit-button clickable'
    submit_button.textContent = 'Login'
    input_main.appendChild(submit_button)

    const switch_btn = document.createElement('button')
    switch_btn.type = 'submit'
    switch_btn.className = 'submit-button reverse-color clickable'
    switch_btn.textContent = 'I want to register'
    input_main.appendChild(switch_btn)

    account_main_page.appendChild(input_main)
    account_dialog.appendChild(account_main_page)

    toggleDialog();
}

function createAccountInputFields({index, title = null, type = null}) {
    const field_container = document.createElement('div');
    field_container.className = 'account-field-container';

    const title_element = document.createElement('div');
    title_element.textContent = title || capitalizeFirstLetter(index);
    title_element.className = 'title'

    const input = document.createElement('input');
    input.type = type || 'text';

    field_container.appendChild(title_element);
    field_container.appendChild(input);

    if(type === 'password') {
        // TODO
    }

    return field_container;
}