import request from "../tools/request.js";
import createHook from "./createHook.js";
import cookies from "../tools/cookies.js";

const cookie = cookies();
let currentSession = cookie.getItem('current-session') || null;

const { onmount, remount, dismount, updateAll } = createHook();

function updateCookie() {
    cookie.setItem('current-session', currentSession);
}

async function genSession() {
    const { token } = await request('auth/token');
    currentSession = token;
    updateCookie();
    updateAll(currentSession);
}

function manualUpdateSession(sessionId) {
    currentSession = sessionId;
    updateCookie();
    updateAll(currentSession);
}

if(!currentSession) genSession();

export default function useSessionId(updated) {
    const mount_key = onmount(updated)

    function componentReMount() {
        return remount(mount_key)(currentSession)
    }

    updated && updated(currentSession);

    return {
        manualUpdateSession, genSession,
        componetDismount: dismount(mount_key), componentReMount
    }
}