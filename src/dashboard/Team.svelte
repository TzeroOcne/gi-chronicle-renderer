<script lang="ts">
  import type { TeamAvatar } from '$/genshin';
  import { elementIcons } from '@/const/icons';
  import { imageUrlToBase64 } from '@/lib/images';
  import { cn } from '@/lib/tailwind';

  type Props = {
    teams: TeamAvatar[];
  };
  let { teams }: Props = $props();
</script>

<div class="w-full absolute bottom-0 py-8 bg-linear-to-t from-black via-black/75 to-white/0">
  <div class="flex justify-between w-9/11 place-self-center">
    {#each teams as member}
      <div
        class="aspect-64/84 w-2/9 relative rounded-sm overflow-clip bg-[#ece5d8]"
      >
        {#await imageUrlToBase64(member.image) then imageUrl}
          <img src={imageUrl} alt={member.name}
            class={cn(
              'w-full block bg-cover',
              {
                'bg-[url(@/assets/bg-5-star-raw.png)]': member.rarity === 5,
                'bg-[url(@/assets/bg-4-star-raw.png)]': member.rarity === 4,
              },
            )}
          >
        {/await}
        <div class="text text-center text-black">
          Lv. {member.level}
        </div>
        {#if member.rank > 0}
          <div class="text absolute right-0 top-0 w-4 text-center bg-black/64 text-white rounded-bl-sm">
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

<style>
  div.text {
    font-size: 75%;
  }
</style>
