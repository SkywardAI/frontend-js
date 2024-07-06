import apiAddress from "../tools/apiAddress.js";
import createHook from "./createHook.js";

let currentSession = null, init = false;

const { onmount, remount, dismount, updateAll } = createHook();

export default function useSessionId(updated) {
    const mount_key = onmount(updated)

    async function genSession() {
        const { token } = await (await fetch(apiAddress('auth/token'), { mode: 'no-cors' })).json();
        currentSession = token;
        updateAll(currentSession);
    }

    function manualUpdateSession(sessionId) {
        currentSession = sessionId;
        updateAll(currentSession);
    }

    if(!currentSession && !init) {
        init = true;
        genSession();
    }

    return {
        manualUpdateSession, genSession,
        componetDismount: dismount(mount_key), componentReMount:remount(mount_key) 
    }
}