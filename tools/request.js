import { API_ADDRESS } from "../settings.js";
import useSessionId from "../global/useSessionId.js";

let session_id = '';
useSessionId(id=>{session_id = id});

export default function request(url, options={}) {
    return fetch(reqAddress(url), generateRequest(url, options))
}

export function reqAddress(url) {
    return `${API_ADDRESS}/${url}`
}

function generateRequest(url, options={}) {
    const headers = {
        Accept: 'application/json'
    }
    if(options.method && options.method === 'POST') {
        headers['Content-Type'] = 'application/json'
    }
    if(/^(chat|accounts).*$/.test(url) && session_id) {
        headers['Authorization'] = `Bearer ${session_id}`
    }

    if(options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body)
    }

    return {
        headers,
        ...options
    }
}