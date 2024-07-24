const locale = navigator.language || navigator.userLanguage

export default function formatDateTime(date = null) {
    if(!date) date = new Date();
    const parsed_date = date.toLocaleDateString(locale);
    const parsed_time = date.toLocaleTimeString(locale, { hour12: false });
    return `${parsed_date} ${parsed_time}`
}