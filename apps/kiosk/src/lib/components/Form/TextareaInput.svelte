<script lang="ts">
  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  const classes = ` ${ className }`;

  export let id: string;
  export let name: string;
  export let value: string = "";

  let textarea = null;
  let height   = 120;

  type ResizeEvent = CustomEvent<{
    rect: DOMRectReadOnly;
    target: HTMLTextAreaElement
  }>;

  function onResize( event: ResizeEvent ) {
    textarea = event.target;
    height   = event.detail.rect.height;
  }

  export function resize( node ) {
    let rect: DOMRectReadOnly;
    let target: Element;

    const resizeObserver = new ResizeObserver( ( entries ) => {
      for ( let entry of entries ) {
        rect   = entry.contentRect;
        target = entry.target;
      }

      node.dispatchEvent( new CustomEvent( "resize", {
        detail: { rect, target }
      } ) as ResizeEvent );
    } );

    resizeObserver.observe( node );

    return {
      destroy: () => resizeObserver.disconnect()
    };
  }

  $: rows = ( value && value.match( /\n/g ) || [] ).length + 1 || 1;
</script>

<textarea
  use:resize
  rows={rows}
  bind:this={textarea}
  on:resize={onResize}
  style="--height:auto"
  class={classes}
  name={name}
  id={id}
  bind:value
></textarea>

<style>
    textarea {
        height: var(--height);
    }
</style>
