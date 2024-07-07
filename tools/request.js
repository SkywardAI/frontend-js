import { LOCAL_API_ADDRESS } from "../settings.js";

export default function request(url, options={}) {

    url = `${LOCAL_API_ADDRESS}/${url}`

    const headers = {
        Accept: 'application/json'
    }
    if(options.method && options.method === 'POST') {
        headers['Content-Type'] = 'application/json'
    }

    return fetch(url, {
        headers,
        ...options
    })
}