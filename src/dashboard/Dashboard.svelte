<script lang="ts">
  import type { StygianOnslaughtDetail } from '$/genshin';
  import StygianOnslaughtViewer from './StygianOnslaughtViewer.svelte';
  import { StygianOnslaughtExample } from '@/example/data';

  let data = $state<StygianOnslaughtDetail[]>(StygianOnslaughtExample);
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'DASHBOARD_DATA') {
      data = message.payload?.data?.data?.data ?? [];
    }
  });
</script>

<div class="w-full h-3/5 place-ci-center">
  {#if data.length > 0}
    {#each data as item, idx}
      <StygianOnslaughtViewer {idx} data={item}/>
    {/each}
  {/if}
  <div class="flex">
  </div>
</div>
