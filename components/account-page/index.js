import useUser from '../../global/useUser.js'
import capitalizeFirstLetter from "../../tools/capitalizeFirstLetter.js";
import getSVG from "../../tools/svgs.js";
import showMessage from "../../tools/message.js";
import createDialog from '../../tools/dialog.js';
import { email_not_valid, password_not_valid, username_not_valid, validateEmail, validatePassword, validateUsername } from '../../tools/validators.js';

let input_details_main = null, init = false, toggleDialog;
let current_user = {}, isRegister = false, user_info_saved = localStorage.getItem('saved-user-login-info');
if(user_info_saved) user_info_saved = JSON.parse(user_info_saved);

const {
    register, login, logout, updateUserInfo
} = useUser(user=>{
    current_user = user;
    if(!input_details_main) return;
    createInputDetailsPage();
});

function saveUserInfo(save_info = null) {
    if(!save_info) {
        user_info_saved && localStorage.removeItem('saved-user-login-info');
        user_info_saved = null;
    } else {
        user_info_saved = save_info
        localStorage.setItem('saved-user-login-info', JSON.stringify(save_info))
    }
}

const account_fields = {
    login: [
        { index: 'username' },
        { index: 'password', type: 'password' }
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
        const field = {...e};
        if(current_user.logged_in) {
            if(e.index === 'username') field.value = current_user.username;
            else if(e.index === 'email') field.value = current_user.email;
        } else if(!isRegister && user_info_saved) {
            if(e.index === 'username') field.value = user_info_saved.username;
            else if(e.index === 'password') field.value = user_info_saved.password;
        }
        input_details_main.appendChild(
            createAccountInputFields(field)
        )
    })

    if(!current_user.logged_in) {
        const keep_login = document.createElement('div')
        keep_login.className = 'keep-login clickable';

        keep_login.innerHTML = `
        <input type='checkbox' name='keep-login'${user_info_saved?' checked':''}>
        <div class="title">Keep me logged in!</div>`

        input_details_main.appendChild(keep_login);
        keep_login.onclick = () => {
            keep_login.firstElementChild.click();
        }
        keep_login.firstElementChild.onclick = evt => evt.stopPropagation();
    }

    // hr
    input_details_main.insertAdjacentHTML("beforeend", "<hr>")
    // buttons
    const submit_btn = document.createElement('button');
    submit_btn.type = 'submit';
    submit_btn.className = 'function-btn button';
    input_details_main.appendChild(submit_btn);

    const functional_btn = document.createElement('button');
    functional_btn.type = 'button';
    functional_btn.className = 'function-btn clickable reverse-color';
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
            logout().then(()=>showMessage('User logged out.'));
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
            if(!validateEmail(email)) {
                showMessage(email_not_valid, { type: "error" })
                return;
            }
            submit_values.email = email;
        }
        if(new_password) {
            if(!validatePassword(new_password)) {
                showMessage(password_not_valid, { type: 'err' })
                return;
            } else if(repeat_new_password !== new_password) {
                showMessage("Passwords are not same!", { type: 'err' })
                return;
            }
            submit_values.password = new_password;
        }
        updateUserInfo(submit_values).then(res=>{
            if(res) {
                submit_values.email && showMessage('Email updated.');
                submit_values.password && showMessage('Password updated.');
                evt.target['new-password'].value = ''
                evt.target['repeat-new-password'].value = ''
            } else {
                showMessage('Update information failed!', { type: 'err' })
            }
        });
    } else {
        const username = evt.target.username.value;
        const password = evt.target.password.value;
        const keep_login = evt.target['keep-login'].checked;
        if(isRegister) {
            const email = evt.target.email.value;
            if(!validateUsername(username)) {
                showMessage(username_not_valid, { type: 'err' })
                return;
            } else if(!validateEmail(email)) {
                showMessage(email_not_valid, { type: 'err' })
                return;
            } else if(!validatePassword(password)) {
                showMessage(password_not_valid, { type: 'err' })
                return;
            }
            
            const repeat_password = evt.target['repeat-password'].value;
    
            if(password !== repeat_password) {
                showMessage("Passwords are not same!", { type: 'err' })
                return;
            }
            register(username, email, password).then(res=>{
                if(res) {
                    isRegister=false;
                    showMessage('Register Success!', { type: 'success' });
                    saveUserInfo(keep_login && { username, password });
                } else showMessage('Register failed!', { type: 'err' });
            });
        } else {
            login(username, password).then(res=>{
                if(res) {
                    showMessage(`Welcome back, ${username}`);
                    saveUserInfo(keep_login && { username, password });
                }
                else showMessage('Login failed!', { type: 'err' })
            });
        }
    } 
}

export default function createAccountPage() {
    if(init && toggleDialog) {
        toggleDialog();
        return;
    }

    const [account_container, controller] = createDialog();
    toggleDialog = controller.toggleModal;

    const account_main_page = document.createElement('form');
    account_main_page.className = 'account-main';
    account_main_page.onclick = evt => evt.stopPropagation();
    account_main_page.onsubmit = submitDetails;

    account_main_page.insertAdjacentHTML("afterbegin", `
    <div class='logo-image'><img src='/medias/SkywardAI.png'></div>`)

    input_details_main = document.createElement('div');
    input_details_main.className = 'input-details-main';
    
    account_main_page.appendChild(input_details_main);
    account_container.appendChild(account_main_page)
    document.body.appendChild(account_container)

    createInputDetailsPage();

    init = true;
    controller.showModal();
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