function writeObjToCookie(cookie_items) {
    Object.entries(cookie_items).forEach(([key, value])=>{
        document.cookie=`${key}=${value}`;
    });
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

const cookie_items = loadObjFromCookie();

export default function cookies() {

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
        document.cookie=`${key}=`
        delete cookie_items[key]
        return value;
    }

    return {getItem, setItem, removeItem}
}