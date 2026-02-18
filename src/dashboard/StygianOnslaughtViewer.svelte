<script lang="ts">
  import type { ChallengeDetail, StygianOnslaughtDetail } from '$/genshin';
  import { cn } from '@/lib/tailwind';
  import { untrack } from 'svelte';

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

  const elementIcons:Record<string, string> = Object.fromEntries(
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
</script>

{#snippet challenge(challengeDetail: ChallengeDetail, idx: number)}
  {@const mainImage = mainImageList[idx]}
  {@const bgImage = bgImageList[idx]}
  {@const bgToggle = bgImageToggle[idx]}
  {@const bgFillToggle = bgImageFillToggle[idx]}
  <div class="odd:bg-slate-500 relative flex flex-col h-full min-h-0">
    <!-- <div class="p-4 h-16 box-border font-genshin leading-4 text-white bg-gray-900"> -->
    <div class="h-16 flex-none box-border font-genshin bg-gray-900">
      <div>
      </div>
    </div>
    <div class="grow min-h-0 relative">
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
                  'h-144': !bgFillToggle,
                },
              )}
            >
          {:else}
            {#await getCharCard(mainImageFGOptions[idx]) then charCard}
              <img src={charCard} alt=""
                class={cn(
                  'object-cover brightness-50',
                  {
                    'w-full': bgFillToggle,
                    'h-144': !bgFillToggle,
                  },
                )}
              >
            {/await}
          {/if}
        </div>
      </div>
      <div class="overflow-clip relative h-full">
        <div class="place-self-center h-full">
          {#if mainImage !== ''}
            <img src={mainImage} alt="">
          {:else}
            {#await getCharImage(mainImageFGOptions[idx]) then charImg}
              <img src={charImg} alt=""
                class="h-full w-auto object-cover"
              >
            {/await}
          {/if}
        </div>
      </div>
    </div>
    <div class="w-full absolute bottom-0 py-8 bg-linear-to-t from-black via-black/75 to-white/0">
      <div class="flex justify-between w-4/5 place-self-center">
        {#each challengeDetail.teams as member}
          <div
            class="aspect-64/84 w-16 h-21 relative rounded-sm overflow-clip bg-[#ece5d8]"
          >
            <img src={member.image} alt={member.name}
              class={cn(
                'w-full block bg-cover',
                {
                  'bg-[url(@/assets/bg-5-star-raw.png)]': member.rarity === 5,
                  'bg-[url(@/assets/bg-4-star-raw.png)]': member.rarity === 4,
                },
              )}
            >
            <div class="h-5 text-center text-black">
              Lv. {member.level}
            </div>
            {#if member.rank > 0}
              <div class="absolute right-0 top-0 w-4 text-center bg-black/64 text-white rounded-bl-sm">
                {member.rank}
              </div>
            {/if}
            <img src={elementIcons[member.element.toLowerCase()]} alt=""
              class="absolute left-0 top-0 w-3 h-3 p-0.5"
            >
          </div>
        {/each}
      </div>
    </div>
  </div>
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
  </div>
  <div class="grid grid-cols-3 aspect-16/10 w-4/5 overflow-y-clip">
    {#each data.single.challenge as item, idx}
      {@render challenge(item, idx)}
    {/each}
  </div>
</div>
