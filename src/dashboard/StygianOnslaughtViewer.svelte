<script lang="ts">
  import type { ChallengeDetail, StygianOnslaughtDetail } from '$/genshin';
  import { cn } from '@/lib/tailwind';
  import { formatDate } from '@/lib/datetime';
  import { untrack } from 'svelte';
  import { Icon } from 'svelte-icons-pack';
  import { FaSolidCameraRetro, FaSolidDownload } from 'svelte-icons-pack/fa';
  import Team from './Team.svelte';
  import { toPng } from 'html-to-image';

  type Props = {
    data: StygianOnslaughtDetail;
    idx: number;
  };
  let {
    data,
    idx: dataIdx,
  }:Props = $props();
  let showTitle = $state(false);
  let selectedView = $state<'preview' | 'result'>('preview');
  let mainImageFGOptions = $state(
    untrack(() => data
      .single.challenge.map((challenge) => challenge.teams[0].name),
    ),
  );
  let mainImageList = $state(
    untrack(() => mainImageFGOptions.map(() => '')),
  );
  let bgImageList = $state(
    untrack(() => mainImageFGOptions.map(() => '')),
  );
  let bgImageToggle = $state(
    untrack(() => mainImageFGOptions.map(() => true)),
  );
  let bgImageFillToggle = $state(
    untrack(() => mainImageFGOptions.map(() => true)),
  );

  const charImage:Record<string, string> = {};
  async function getCharImage(name: string) {
    if (charImage[name]) return charImage[name];
    const module = await import(`@/assets/characters/fg-profile/${name}.webp`);
    charImage[name] = module.default;
    return charImage[name];
  }

  const charCard:Record<string, string> = {};
  async function getCharCard(name: string) {
    if (charCard[name]) return charCard[name];
    const module = await import(`@/assets/characters/card/${name}.webp`);
    charCard[name] = module.default;
    return charCard[name];
  }

  let renderTarget = $state<HTMLElement>();
  let resultUrl = $state('');
  let rendering = $state(false);
  async function render() {
    rendering = true;
    selectedView = 'result';

    const targetWidth = 1920;
    const targetHeight = 1200;

    const rect = renderTarget.getBoundingClientRect();
    const elementWidth = rect.width;
    const elementHeight = rect.height;

    const scaleX = targetWidth / elementWidth;
    const scaleY = targetHeight / elementHeight;

    // choose behavior
    const scale = Math.min(scaleX, scaleY); // fit
    // const scale = Math.max(scaleX, scaleY); // fill

    const dataUrl = await toPng(renderTarget, {
      width: elementWidth,
      height: elementHeight,
      pixelRatio: scale,     // equivalent to html2canvas scale
      cacheBust: true,       // helps avoid cached asset issues
    });

    rendering = false;
    resultUrl = dataUrl;
  }

  async function download() {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `GI-SO-${formatDate(new Date(), 'YYYY-MM-DDTHH-mm-ss')}.png`;
    a.click();
  }
</script>

{#snippet background(bgImage: string, bgToggle: boolean, bgFillToggle: boolean, idx: number)}
  <div class={cn(
    'absolute w-full h-full overflow-clip',
    {
      'hidden': !bgToggle,
    },
  )}>
    <div class="place-self-center">
      {#if bgImage !== ''}
        <img src={bgImage} alt=""
          class={cn(
            'object-cover brightness-50 mask-b-from-0% mask-b-to-80%',
            {
              'w-full': bgFillToggle,
              'h-full': !bgFillToggle,
            },
          )}
        >
      {:else}
        {#await getCharCard(mainImageFGOptions[idx]) then charCard}
          <img src={charCard} alt=""
            class={cn(
              'object-cover',
              {
                'w-full': bgFillToggle,
                'h-full': !bgFillToggle,
              },
            )}
          >
        {/await}
      {/if}
    </div>
  </div>
{/snippet}

<!-- <div class="p-4 h-16 box-border font-genshin leading-4 text-white bg-gray-900"> -->
{#snippet challenge(challengeDetail: ChallengeDetail, idx: number)}
  {@const mainImage = mainImageList[idx]}
  {@const bgImage = bgImageList[idx]}
  {@const bgToggle = bgImageToggle[idx]}
  {@const bgFillToggle = bgImageFillToggle[idx]}
  <!-- <div class="odd:bg-slate-500 relative flex flex-col h-full min-h-0"> -->
  <!-- </div> -->
  <div class="aspect-16/30 flex flex-col h-full w-full min-h-0">
    <div class={cn(
      'h-1/10 px-[7%] content-center flex-none box-border font-genshin bg-gray-900',
      {
        'hidden': !showTitle,
      },
    )}>
      <div class="text-[65%]">
        {challengeDetail.name}
      </div>
    </div>
    <div class="grow min-h-0 relative">
      {@render background(bgImage, bgToggle, bgFillToggle, idx)}
      <div class="overflow-clip relative h-full">
        <div class="place-self-center h-full">
          {#if mainImage !== ''}
            <img src={mainImage} alt="">
          {:else}
            {#await getCharImage(mainImageFGOptions[idx]) then charImg}
              <img src={charImg} alt=""
                class="h-full w-auto object-cover bg-black/60"
              >
            {/await}
          {/if}
        </div>
      </div>
      <Team teams={challengeDetail.teams}/>
    </div>
  </div>
{/snippet}

<div class="flex h-full w-full">
  <div class="w-2/7 box-border px-4">
    <fieldset class="fieldset rounded-lg bg-base-200">
      <legend class="leading-0.5"><h2>Settings</h2></legend>
      <label>
        <div class="font-genshin">
          Show Title
        </div>
        <input type="checkbox" class="toggle" bind:checked={showTitle}>
      </label>
    </fieldset>
    <div class="tabs tabs-lift">
      {#each mainImageList as _, idx}
        {@const teams = data.single.challenge[idx].teams}
        <input type="radio" name={`team-${dataIdx}`} class="tab" aria-label={`#${idx + 1}`} checked={idx === 0}>
        <div class="tab-content">
          <fieldset class="fieldset rounded-lg bg-base-200">
            <legend class="leading-0.5"><h2>#{idx + 1}</h2></legend>
            <label>
              <span class="font-genshin">
                Member
              </span>
              <select class="select w-full box-border text-white"
                bind:value={mainImageFGOptions[idx]}
              >
                {#each teams as member}
                  <option value={member.name}>
                    {member.name}
                  </option>
                {/each}
              </select>
            </label>
            <label>
              <span class="font-genshin">
                Main Image
              </span>
              <input
                type="text"
                class="input w-full box-border"
                placeholder="Image URL or empty for character image"
                bind:value={mainImageList[idx]}
              >
            </label>
            <label>
              <span class="font-genshin">
                Background Image
              </span>
              <input type="checkbox" class="toggle" bind:checked={bgImageToggle[idx]}>
              <input type="checkbox" class="toggle" bind:checked={bgImageFillToggle[idx]}>
              <input
                type="text"
                class="input w-full box-border"
                placeholder="Image URL or empty for character image"
                bind:value={bgImageList[idx]}
              >
            </label>
          </fieldset>
        </div>
      {/each}
    </div>
    <button class="mt-4 btn btn-primary"
      onclick={render}
    >
      <Icon src={FaSolidCameraRetro}/>
    </button>
  </div>
  <div class="w-1/14"></div>
  <div class="w-4/7 content-center">
    <div class="tabs tabs-border w-full">
      <input type="radio" name={`challenge-${dataIdx}`} class="tab" aria-label="Preview" checked
        value="preview"
        bind:group={selectedView}
      >
      <div class="tab-content ">
        <div
          bind:this={renderTarget}
          class="grid grid-cols-3 aspect-16/10 overflow-y-clip"
        >
          {#each data.single.challenge as item, idx}
            {@render challenge(item, idx)}
          {/each}
        </div>
      </div>

      <input type="radio" name={`challenge-${dataIdx}`} class="tab" aria-label="Result"
        value="result"
        bind:group={selectedView}
      >
      <div class="tab-content">
        <div class="aspect-16/10 w-full relative">
          <span class={cn(
            'loading loading-spinner loading-xl',
            {
              'hidden': !rendering,
            },
          )}></span>
          <img
            class={cn(
              'w-full',
              {
                'hidden!': resultUrl === '' || rendering,
              },
            )}
            src={resultUrl}
            alt="result"
          >
          <button class="btn btn-primary absolute bottom-4 right-4"
            onclick={download}
          >
            <Icon src={FaSolidDownload}/>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="w-1/14"></div>
</div>
