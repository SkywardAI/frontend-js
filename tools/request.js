import { API_ADDRESS } from "../settings.js";
import useSessionId from "../global/useSessionId.js";

let session_id = '';
useSessionId(id=>{session_id = id});

export default async function request(url, options={}, not_return_json = false) {
    let res = null;
    try {
        const address = reqAddress(url);
        const request_options = generateRequest(url, options);
        if(not_return_json) {
            return fetch(address, request_options);
        } else {
            res = await fetch(address, request_options);
            return await res.json();
        }
    } catch (error) {
        console.error(error);
        return res || {}
    }
}

export function reqAddress(url) {
    return `${API_ADDRESS}/${url}`
}

function generateRequest(url, options={}) {
    const headers = {
        Accept: 'application/json'
    }
    if(options.method && /^(POST|PATCH)$/i.test(options.method)) {
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