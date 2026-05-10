export function initUI(templateId) {
    const app = document.getElementById('app');
    const template = document.getElementById(templateId);
    if (template) {
        const content = template.content.cloneNode(true);
        app.appendChild(content);
    }
}
