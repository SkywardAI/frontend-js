import { LOCAL_API_ADDRESS } from "../settings.js";

export default function apiAddress(address) {
    return `${LOCAL_API_ADDRESS}/${address}`;
}