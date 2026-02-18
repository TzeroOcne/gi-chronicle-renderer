<script lang="ts">
  import '@/app.css';
  async function fetchData() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;
    const result = await chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'FETCH_DATA',
      },
    );
    const dashboardTab = await chrome.tabs.create({
      url: chrome.runtime.getURL('src/dashboard/index.html'),
    });
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === dashboardTab.id && info.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
          type: 'DASHBOARD_DATA',
          payload: result,
        });

        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  }
</script>

<div>
  <button
    class="btn btn-primary"
    onclick={fetchData}
  >
    Fetch
  </button>
</div>
