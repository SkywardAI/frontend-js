import { API_ADDRESS } from "../settings.js";
import useSessionId from "../global/useSessionId.js";
import { fetchEventSource } from 'https://cdn.jsdelivr.net/npm/@microsoft/fetch-event-source@2.0.1/+esm'

let session_id = '';
useSessionId(id=>{session_id = id});

export default function request(url, options={}) {
    return fetch(reqAddress(url), generateRequest(url, options))
}

export function streamRequest(url, options={}, onmessage) {
    return fetchEventSource(reqAddress(url), {
        ...generateRequest(url, options),
        onmessage,
        signal: AbortSignal.timeout(5000)
    })
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