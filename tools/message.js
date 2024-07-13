import getSVG from "./svgs.js";

const message_dialog = document.createElement('dialog');
message_dialog.className = 'message-dialog';
document.body.appendChild(message_dialog);
message_dialog.show();

/**
 * @typedef messageOptions
 * @property { 'info'|'information'|'err'|'error'|'warn'|'warning'|'success' } type - Type of message, default to 'info'
 * @property { Number } timeout - Milliseconds of time before information block disappear, default to 5000
 * @property { Number } animation_duration - Milliseconds of time information block move in and out, default to 300
 * @property { Boolean } close_on_click - Set whether information block should close when clicked
 */

/**
 * Display a notification with given type on top-right corner
 * @param {String} message - The message to show, can be html element in string
 * @param {messageOptions} options - Options of showing messages
 */
export default function showMessage(message, options = {}) {
    const type = options.type || 'info';
    const timeout = options.timeout || 5000;
    const animation_duration = options.animation_duration || 300;
    const close_on_click = options.close_on_click || true;

    let icon;
    switch(type) {
        case 'err': case 'error':
            icon = 'x-circle-fill'; break;
        case 'warn': case 'warning':
            icon = 'exclamation-circle-fill'; break;
        case 'success':
            icon = 'check-circle-fill'; break;
        case 'info': case 'information':
        default: icon = 'info-circle-fill'; break;
    }

    const message_elem = document.createElement('div');
    message_elem.className = `message ${type} ${close_on_click ? ' clickable':''}`;
    message_elem.innerHTML = `
    ${getSVG(icon, 'message-icon')}
    <div class='message-text'>${message}</div>
    `
    message_elem.style.animationDuration = `${animation_duration}ms`
    message_dialog.appendChild(message_elem);
    
    const removeMessage = () => {
        message_elem.style.animationName = 'slide-out';
        setTimeout(() => {
            message_elem.remove();
        }, animation_duration);
    }

    const timer = setTimeout(removeMessage, timeout + animation_duration);

    if(close_on_click) {
        message_elem.onclick = () => {
            clearTimeout(timer);
            removeMessage();
        }
    }
}