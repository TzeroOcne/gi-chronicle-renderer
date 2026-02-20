export const elementIcons:Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<true, string, string>('@/assets/icons/elements/*.png', {
      eager: true,
      import: 'default',
    }))
    .map(([path, module]) => {
      const name = path.split('/').pop()!.replace('.png', '').toLowerCase();
      return [name, module];
    }),
);
