<script lang="ts">
  import type { ChallengeDetail, StygianOnslaughtDetail } from '$/genshin';
  import { tick, untrack } from 'svelte';
  import { Icon } from 'svelte-icons-pack';
  import { FaSolidCameraRetro } from 'svelte-icons-pack/fa';
  import bg5 from '@/assets/bg-5-star-raw.png';
  import bg4 from '@/assets/bg-4-star-raw.png';
  import { flattenSVG, toBase64 } from '@/lib/images';

  const bgMap:Record<number, string> = $state({
    5: '',
    4: '',
  });

  const elementIcons:Record<string, string> = $state(Object.fromEntries(
    Object.entries(
      import.meta.glob<true, string, string>('@/assets/icons/elements/*.png', {
        eager: true,
        import: 'default',
      }),
    ).map(([path, module]) => {
      const name = path.split('/').pop()!
        .replace('.png', '')
        .toLowerCase();
      return [name, module];
    }),
  ));
  $effect(() => {
    (async () => {
      bgMap[5] = await toBase64(bg5);
      bgMap[4] = await toBase64(bg4);
      await Promise.all(Object.entries(elementIcons).map(async ([name, src]) => {
        elementIcons[name] = await toBase64(src);
      }));
    })();
  });

  type Props = {
    data: StygianOnslaughtDetail;
    idx: number;
  };
  let {
    data,
    idx: dataIdx,
  }:Props = $props();
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

  const charImageMap:Record<string, string> = {};
  async function getCharImage(name: string) {
    if (charImageMap[name]) return charImageMap[name];
    const module = await import(`@/assets/characters/fg-profile/${name}.webp`);
    charImageMap[name] = await toBase64(module.default);
    return charImageMap[name];
  }

  const charCard:Record<string, string> = {};
  async function getCharCard(name: string) {
    if (charCard[name]) return charCard[name];
    const module = await import(`@/assets/characters/card/${name}.webp`);
    charCard[name] = await toBase64(module.default);
    return charCard[name];
  }

  async function loadAndMeasure(src: string) {
    const img = new Image();
    img.src = src;
    await img.decode();
    return {
      ratio: img.naturalWidth / img.naturalHeight,
    };
  }

  let svgElement = $state<SVGSVGElement>();
  let rendering = $state(false);
  async function render() {
    try {
      // console.log(Array.from(svgElement.querySelectorAll('image'))
      //   .map((img) => img.href.baseVal)
      //   .filter((src) => src.startsWith('http')),
      // );
      console.log(svgElement.toString());
      const png = await flattenSVG(svgElement, 1);
      const a = document.createElement('a');
      a.href = png;
      a.download = 'stygian-challenge.png';
      a.click();
    } finally {
      rendering = false;
    }
  }
  async function startRender() {
    // rendering = true;
    // await tick();
    await render();
  }
</script>

{#snippet cardImage(cardUrl: string, bgFillToggle: boolean)}
  <image href={cardUrl} x="0" y="0" width="640" height="1200" preserveAspectRatio={bgFillToggle ? 'xMidYMid slice' : 'xMidYMid meet'} style="filter: brightness(0.5);" />
{/snippet}

{#snippet charImage(charUrl: string, offsetX: number, renderedWidth: number)}
  <image
    href={charUrl}
    x={offsetX}
    y="0"
    width={renderedWidth}
    height="1200"
  />
{/snippet}

{#snippet challenge(challengeDetail: ChallengeDetail, idx: number)}
  {@const mainImage = mainImageList[idx]}
  {@const bgImage = bgImageList[idx]}
  {@const bgToggle = bgImageToggle[idx]}
  {@const bgFillToggle = bgImageFillToggle[idx]}
  {@const memberWidth = 128 * 108 / 128}
  {@const memberHeight = (128 + 40) * 108 / 128}
  {@const gap = 32}
  {@const totalWidth = challengeDetail.teams.length * memberWidth + (challengeDetail.teams.length - 1) * gap}
  {@const startX = (640 - totalWidth) / 2} <!-- assuming the container width is 640 -->
  {#if bgToggle}
    {#if bgImage !== ''}
      <image href={bgImage} x="0" y="0" width="640" height="1200" preserveAspectRatio={bgFillToggle ? 'xMidYMid slice' : 'xMidYMid meet'} style="filter: brightness(0.5);" />
    {:else}
      {#await getCharCard(mainImageFGOptions[idx]) then charCard}
        {#if rendering}
          {#await toBase64(charCard) then cardUrl}
            {@render cardImage(cardUrl, bgFillToggle)}
          {/await}
        {:else}
          {@render cardImage(charCard, bgFillToggle)}
        {/if}
      {/await}
    {/if}
  {/if}
  {#if mainImage !== ''}
    <image href={mainImage}
      x="0" y="0"
      width="640"
      height="1200"
      preserveAspectRatio="xMidYMid meet"
    />
  {:else}
    {#await getCharImage(mainImageFGOptions[idx]) then charImg}
      {#await loadAndMeasure(charImg) then size}
        <defs>
          <clipPath id={`mainClip-${idx}`}>
            <rect x="0" y="0" width="640" height="1200" />
          </clipPath>
        </defs>
        {@const renderedWidth = 1200 * size.ratio}
        {@const offsetX = (640 - renderedWidth) / 2}
        <g clip-path={`url(#mainClip-${idx})`}>
          {#if rendering}
            {#await toBase64(charImg) then charUrl}
              {@render charImage(charUrl, offsetX, renderedWidth)}
            {/await}
          {:else}
            {@render charImage(charImg, offsetX, renderedWidth)}
          {/if}
        </g>
      {/await}
    {/await}
  {/if}
  <rect x="0" y="0" width="640" height="80" fill="#111827" />
  <text
    x="320"
    y="40"
    text-anchor="middle"
    dominant-baseline="middle"
    fill="white"
    font-size="20"
    font-family="Genshin"
  >
    {challengeDetail.name}
  </text>
  <defs>
    <linearGradient id={`bottomFade-${idx}`} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="black" />
      <stop offset="30%" stop-color="black" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="800" width="640" height="400" fill={`url(#bottomFade-${idx})`} />
  <g transform="translate(0, 960)">
    {#each challengeDetail.teams as member, i}
      <g transform={`translate(${startX + i * (memberWidth + gap)}, 0)`} clip-path={`url(#memberClip-${i})`}>
        <clipPath id={`memberClip-${i}`}>
          <rect width={memberWidth} height={memberHeight} rx={16 * 108 / 128} ry={16 * 108 / 128} />
        </clipPath>
        <rect width={memberWidth} height={128 * 108 / 128} rx={12 * 108 / 128} fill="#ece5d8" />
        <image href={bgMap[member.rarity]} x="0" y="0" width={memberWidth} height={128 * 108 / 128} preserveAspectRatio="xMidYMid slice" />
        {#await toBase64(member.image) then memberImage}
          <image href={memberImage} x="0" y="0" width={memberWidth} height={128 * 108 / 128} preserveAspectRatio="xMidYMid slice" />
        {/await}
        <rect x="0" y={128 * 108 / 128} width={memberWidth} height={40 * 108 / 128} fill="#ece5d8" />
        <text x={memberWidth / 2} y={(128 + 30) * 108 / 128} text-anchor="middle" font-size={24 * 108 / 128} fill="black">Lv. {member.level}</text>
        {#if member.rank > 0}
          <rect x={88 * 108 / 128} y="0" width={40 * 108 / 128} height={40 * 108 / 128} fill="black" opacity="0.64" rx={8 * 108 / 128} />
          <text x={108 * 108 / 128} y={28 * 108 / 128} text-anchor="middle" font-size={24 * 108 / 128} fill="white">{member.rank}</text>
        {/if}
        <image href={elementIcons[member.element.toLowerCase()]} x={8 * 108 / 128} y={8 * 108 / 128} width={32 * 108 / 128} height={32 * 108 / 128} />
      </g>
    {/each}
  </g>
{/snippet}

<div class="flex">
  <div class="w-1/5 box-border px-4">
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
    <button class="btn btn-primary mt-8"
      onclick={startRender}
    >
      <Icon src={FaSolidCameraRetro}/>
    </button>
  </div>
  <svg
    bind:this={svgElement}
    viewBox="0 0 1920 1200"
    class="w-4/5 aspect-16/10"
    preserveAspectRatio="xMidYMid meet"
  >
    {#each data.single.challenge as item, idx}
      <g transform={`translate(${idx * 640}, 0)`}>
        {@render challenge(item, idx)}
      </g>
    {/each}
  </svg>
</div>
