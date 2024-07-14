function writeObjToCookie(cookie_items) {
    document.cookie = 
    Object.entries(cookie_items).map(([key, value])=>{
        return `${key}=${value}`
    }).join('; ');
}

function loadObjFromCookie() {
    const cookie_items = {}
    document.cookie && document.cookie.split('; ')
    .forEach(cookie_section=>{
        const [key, value] = cookie_section.split('=');
        cookie_items[key] = value;
    })
    return cookie_items;
}

export default function cookies() {
    const cookie_items = loadObjFromCookie();

    function getItem(key) {
        return cookie_items[key];
    }

    function setItem(key, value) {
        // if key is invalid
        if(typeof key !== "string" || /(; |=)/.test(key)) {
            return null;
        }
        // we only accept string
        if(typeof value === 'undefined') {
            return null;
        } else if(typeof value === 'object') {
            value = JSON.stringify(value);
        } else {
            value = `${value}`;
        }
        // set value
        cookie_items[key] = value;
        writeObjToCookie(cookie_items);
        return value;
    }

    function removeItem(key) {
        const value = cookie_items[key];
        delete cookie_items[key];
        writeObjToCookie(cookie_items);
        return value;
    }

    return {getItem, setItem, removeItem}
}