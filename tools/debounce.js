export default function debounce(func, timeout=1000) {
    let running_timer;
    return function(...args) {
        clearTimeout(running_timer);
        running_timer = setTimeout(() => {
            func.apply(this, args); 
        }, timeout);
    }
}