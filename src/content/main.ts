chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FETCH_DATA') {
    (async () => {
      try {
        console.log('Received from popup:', message.payload);

        const currentUrl = window.location.href;
        const hash = window.location.hash;

        if (!hash.includes('?')) {
          console.error('No query params in hash.');
          console.log('Current URL:', currentUrl);
          sendResponse({ success: false, error: 'No query params in hash' });
          return;
        }

        const hashQuery = hash.split('?')[1];
        const params = new URLSearchParams(hashQuery);
        const roleId = params.get('role_id');

        if (!roleId) {
          console.error('role_id not found in hash.');
          console.log('Current URL:', currentUrl);
          console.log('Hash params:', Object.fromEntries(params.entries()));
          sendResponse({ success: false, error: 'role_id not found' });
          return;
        }

        const apiUrl =
          'https://sg-public-api.hoyolab.com/event/game_record/genshin/api/hard_challenge' +
          `?server=os_asia&role_id=${encodeURIComponent(roleId)}&need_detail=true`;

        console.log('Requesting:', apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            'x-rpc-language': 'en-us',
          },
          credentials: 'include',
        });

        const data = await response.json();
        console.log('API Response:', data);

        sendResponse({ success: true, data });
      } catch (error) {
        console.error('Content script error:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    // Required for async sendResponse
    return true;
  }
});
