<script>
  import { parse, form_rpn } from './parser';

  let input = '¬P or P and not Q ) <-> P implies Q';
  $: parser = parse(input);
</script>

<main>
  <h1>Propositional Logic Parser</h1>

  <label for="input">Input</label>
  <input id="input" type="text" bind:value={input} />

  <article>
    {#await parser}
      <code class="loading">Loading...</code>
    {:then output}
      <code>{form_rpn(output)}</code>
      <pre><code>{JSON.stringify(output, undefined, 2)}</code></pre>
    {:catch error}
      <code class="error">{error}</code>
    {/await}
  </article>
</main>

<style>
  #input {
    width: 100%;
    box-sizing: border-box;
  }

  code {
    color: var(--text-main);
  }

  code.loading {
    color: var(--text-muted);
  }

  code.error {
    color: var(--code);
  }
</style>
