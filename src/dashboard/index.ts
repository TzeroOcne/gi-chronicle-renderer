import { mount } from 'svelte';
import Dashboard from './Dashboard.svelte';
import './index.css';
import '@/font.css';

const app = mount(Dashboard, { target: document.getElementById('app')! });

export default app;
