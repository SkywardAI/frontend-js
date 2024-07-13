import cookies from "../tools/cookies.js";
import request from "../tools/request.js";
import createHook from "./createHook.js";
import useHistory from "./useHistory.js";
import useSessionId from "./useSessionId.js";

let userInfo = {
    logged_in: false,
    id: null,
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

const { requestUpdateHistory } = useHistory();
const { manualUpdateSession, genSession } = useSessionId();

const { onmount, remount, dismount, updateAll } = createHook();

export default function useUser(updated) {
    const mount_key = onmount(updated)

    function setLoggedIn(id, username, email, token) {
        userInfo = {
            ...userInfo, username, email,
            id, logged_in: true
        }
        manualUpdateSession(token);
        cookie.setItem('current-user', { id, username, email, token })
        updateAll(userInfo);
        requestUpdateHistory();
    }

    async function login(username, password) {
        const {id, authorizedAccount, http_error} = await request('auth/signin', {
            method: 'POST',
            body: { username, password }
        });

        if(http_error) return false;

        const { token, email } = authorizedAccount;
        setLoggedIn(id, username, email, token);
        return true;
    }

    async function register(username, email, password) {
        const {id, authorizedAccount, http_error} = await request('auth/signup', {
            method: 'POST',
            body: { username, email, password }
        })

        if(http_error) return false;

        const { token } = authorizedAccount;
        setLoggedIn(id, username, email, token);
        return true;
    }

    async function logout() {
        userInfo = {
            logged_in: false,
            id: null,
            token: "",
            username: "",
            email: ""
        }
        cookie.removeItem('current-user');
        updateAll(userInfo);
        await genSession();
        requestUpdateHistory();
    }

    async function updateUserInfo(fields) {
        const {id, authorizedAccount, http_error} = await request('accounts', {
            method: 'PATCH',
            body: fields
        })
        if(!http_error) {
            userInfo = {
                ...userInfo,
                id, email: authorizedAccount.email
            }
            return true;
        } return false;
    }

    updated && updated(userInfo);

    return {
        login, register, logout, updateUserInfo,
        componetDismount: dismount(mount_key), componentReMount:remount(mount_key) 
    }
}