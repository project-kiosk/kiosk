<script lang="ts">
  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  const classes = `icon material-symbols-outlined ${ className }`.trimEnd();

  /**
   * Name of the icon.
   */
  export let name: string | undefined = undefined;

  /**
   * Weight and grade affect a symbol’s thickness. Adjustments to grade are more
   * granular than adjustments to weight and have a small impact on the size of
   * the symbol.
   *
   * Grade is also available in some text fonts. You can match grade levels
   * between text and symbols for a harmonious visual effect. For example, if
   * the text font has a -25 grade value, the symbols can match it with a
   * suitable value, say -25.
   *
   * You can use grade for different needs:
   * Low emphasis (e.g. -25 grade): To reduce glare for a light symbol on a dark
   * background, use a low grade.
   *
   * High emphasis (e.g. 200 grade): To highlight a symbol, increase the
   * positive grade.
   */
  export let grade: number = 0;

  /**
   * Weight defines the symbol’s stroke weight, with a range of weights between
   * thin (100) and bold (700). Weight can also affect the overall size of
   * the symbol.
   */
  export let weight: number = 400;

  /**
   * Optical sizes range from 20dp to 48dp.
   *
   * For the image to look the same at different sizes, the stroke
   * weight (thickness) changes as the icon size scales. Optical size offers a
   * way to automatically adjust the stroke weight when you increase or decrease
   * the symbol size.
   */
  export let opticalSize: number = 48;

  /**
   * Fill gives you the ability to modify the default icon style. A single icon
   * can render both unfilled and filled states.
   *
   * To convey a state transition, use the fill axis for animation
   * or interaction. The values are 0 for default or 1 for completely filled.
   * Along with the weight axis, the fill also impacts the look of the icon.
   */
  export let fill: boolean = false;

  $: styles = Object
  .entries( {
    "--icon-fill": fill ? "1" : "0",
    "--icon-weight": weight.toString(),
    "--icon-grade": grade.toString(),
    "--icon-optical-size": opticalSize.toString()
  } )
  .map( ( pair ) => pair.join( ":" ) )
  .join( ";" );
</script>

<style>
    /*noinspection CssUnusedSymbol, CssUnresolvedCustomProperty */
    .icon {
        font-variation-settings: 'FILL' var(--icon-fill),
                                 'wght' var(--icon-weight),
                                 'GRAD' var(--icon-grade),
                                 'opsz' var(--icon-optical-size);
    }
</style>

<span class="{classes}" style="{styles}">
  <slot>{ name }</slot>
</span>
