import useUser from '../../global/useUser.js'
import capitalizeFirstLetter from "../../tools/capitalizeFirstLetter.js";
import getSVG from "../../tools/svgs.js";

let account_dialog = null, input_details_main = null;
let current_user = {}, isRegister = false;

const {
    register, login, logout, updateUserInfo
} = useUser(user=>{
    if(!input_details_main) return;
    current_user = user;
    createInputDetailsPage();
});

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
        { index: 'repeat-password', title: 'Confirm Password', type: 'password' }
    ],
    logged_in: [
        { index: 'username', readonly: true },
        { index: 'email', title: 'Update Email' },
        { index: 'new-password', title: 'New Password', type: 'password' },
        { index: 'repeat-new-password', title: 'Confirm New Password', type: 'password' },
    ]
}

function createInputDetailsPage() {
    input_details_main.innerHTML = '';
    // input fields
    account_fields[
        current_user.logged_in ? 'logged_in' : 
        isRegister ? 'register' : 'login'
    ]
    .forEach(e=>{
        if(current_user.logged_in) {
            if(e.index === 'username') e.value = current_user.username;
            else if(e.index === 'email') e.value = current_user.email;
        } else if(!isRegister) {
            const saved_user_login_info = localStorage.getItem('saved-user-login-info');
            if(saved_user_login_info) {
                const info = JSON.parse(saved_user_login_info);
                if(e.index === 'username') e.value = info.username;
                else if(e.index === 'email') e.value = info.password;
            }
        }
        input_details_main.appendChild(
            createAccountInputFields(e)
        )
    })
    // hr
    input_details_main.insertAdjacentHTML("beforeend", "<hr>")
    // buttons
    const submit_btn = document.createElement('button');
    submit_btn.type = 'submit';
    submit_btn.className = 'function-btn clickable';
    input_details_main.appendChild(submit_btn);

    const functional_btn = document.createElement('button');
    functional_btn.type = 'button';
    functional_btn.className = 'function-btn reverse-color clickable';
    input_details_main.appendChild(functional_btn);

    function updateBtnText() {
        submit_btn.textContent = 
            current_user.logged_in ? 'Update' :
            isRegister ? 'Register Now' : 'Login Now';

        functional_btn.textContent = 
            current_user.logged_in ? 'Logout' :
            isRegister ? 'I want to Login!' : 'I want to Register!';
    }
    updateBtnText();

    functional_btn.onclick = evt => {
        evt.preventDefault();
        if(current_user.logged_in) {
            logout();
        } else {
            updateBtnText();
            isRegister = !isRegister;
            createInputDetailsPage();
        }
    }

}

function submitDetails(evt) {
    evt.preventDefault();
    
    if(current_user.logged_in) {
        const email = evt.target.email.value;
        const new_password = evt.target['new-password'].value;
        const repeat_new_password = evt.target['repeat-new-password'].value;
        const submit_values = {}
        if(email && email !== current_user.email) {
            submit_values.email = email;
        }
        if(new_password) {
            if(repeat_new_password !== new_password) {
                evt.target['repeat-new-password'].classList.add('error');
                return;
            }
            submit_values.password = new_password;
        }
        updateUserInfo(submit_values).then(res=>{
            // TODO: show updated or not
            console.log(res)
        });
    } else if(isRegister) {
        const username = evt.target.username.value;
        const email = evt.target.email.value;
        const password = evt.target.password.value;
        const repeat_password = evt.target['repeat-password'].value;

        if(password !== repeat_password) {
            evt.target['repeat-password'].classList.add('error');
            return;
        }
        register(username, email, password).then(()=>isRegister=false);
    } else {
        const username = evt.target.username.value;
        const password = evt.target.password.value;
        login(username, password);
    }
}

export default function createAccountPage() {
    if(toggleDialog()) return;

    account_dialog = document.createElement('dialog');
    account_dialog.onclick = () => toggleDialog(false);
    document.getElementById('user-popup-container').appendChild(account_dialog)

    const account_main_page = document.createElement('form');
    account_main_page.className = 'account-main';
    account_main_page.onclick = evt => evt.stopPropagation();
    account_main_page.onsubmit = submitDetails;

    account_main_page.insertAdjacentHTML("afterbegin", `
    <div class='logo-image'><img src='/medias/SkywardAI.png'></div>`)

    input_details_main = document.createElement('div');
    input_details_main.className = 'input-details-main';
    
    account_main_page.appendChild(input_details_main);
    account_dialog.appendChild(account_main_page);

    createInputDetailsPage();
    toggleDialog();
}

function createAccountInputFields({
    index, title = '', type = '', 
    readonly = false, value = ''
}) {
    const field_container = document.createElement('div');
    field_container.className = 'account-field-container';

    const title_element = document.createElement('div');
    title_element.textContent = title || capitalizeFirstLetter(index);
    title_element.className = 'title'

    const input = document.createElement('input');
    input.type = type || 'text';
    input.name = index;
    input.value = value;
    input.placeholder = ' '
    input.autocomplete = 'off'
    if(readonly) input.readOnly = 'true';

    field_container.onclick = () => input.focus();
    field_container.appendChild(title_element);
    field_container.appendChild(input);

    if(type === 'password') {
        let show_password = false;
        
        const eye_icon = document.createElement('div');
        eye_icon.className = 'password-eye-icon clickable';

        const toggleShowPassword = () => {
            if(!show_password) {
                input.type = 'password';
                eye_icon.innerHTML = getSVG('eye');
                eye_icon.title = 'Show Password';
            } else {
                input.type = 'text';
                eye_icon.innerHTML = getSVG('eye-slash');
                eye_icon.title = 'Hide Password';
            }
            show_password = !show_password;
        }
        toggleShowPassword();
        eye_icon.onclick = toggleShowPassword;
        field_container.appendChild(eye_icon);
    }

    return field_container;
}