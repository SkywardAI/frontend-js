import cookies from "../tools/cookies.js";
import request from "../tools/request.js";
import createHook from "./createHook.js";

let userInfo = {
    logged_in: false,
    id: null,
    token: "",
    username: "",
    email: ""
}

const cookie = cookies();
const current_user_info = cookie.getItem('current-user');
if(current_user_info) {
    // current we have user logged in but somehow we lost it, e.g. user refreshed page
    const info = JSON.parse(current_user_info);
    userInfo = {
        ...info, logged_in: true
    }
}

const { onmount, remount, dismount, updateAll } = createHook();

export default function useUser(updated) {
    const mount_key = onmount(updated)

    async function login(username, password) {
        const {id, authorizedAccount} = await request('/auth/signin', {
            method: 'POST',
            body: { username, password }
        });

        const { token, email } = authorizedAccount;
        userInfo = {
            ...userInfo, username, email,
            id, token, logged_in: true
        }
        cookie.setItem('current-user', { id, username, email, token })
        updateAll(userInfo);
    }

    async function register(username, email, password) {
        const {id, authorizedAccount} = await (await request('/auth/signup', {
            method: 'POST',
            body: { username, email, password }
        })).json()

        const { token } = authorizedAccount;
        userInfo = {
            ...userInfo, username,email,
            id, token, logged_in: true
        }
        cookie.setItem('current-user', { id, username, email, token })
        updateAll(userInfo);
    }

    function logout() {
        userInfo = {
            logged_in: false,
            id: null,
            token: "",
            username: "",
            email: ""
        }
        cookie.removeItem('current-user');
        updateAll(userInfo);
    }

    updated && updated(userInfo);

    return {
        login, register, logout,
        componetDismount: dismount(mount_key), componentReMount:remount(mount_key) 
    }
}