import '@testing-library/jest-dom';

// Add a mock root element for ReactDOM
const root = document.createElement('div') as HTMLElement
root.id = 'root';
document.body.appendChild(root);