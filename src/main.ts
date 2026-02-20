import { mount } from 'svelte';
import Dashboard from './dashboard/Dashboard.svelte';
import './app.css';

const app = mount(Dashboard, { target: document.getElementById('app')! });

export default app;
