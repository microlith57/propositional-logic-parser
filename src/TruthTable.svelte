<script>
  export let table = {};

  const to_int = (bool) => (bool ? 1 : 0);
</script>

{#if table.body.length > 0}
  <table>
    <thead>
      <tr>
        {#each table.inputs as input}
          <th>{input}</th>
        {/each}
        <th>Output</th>
      </tr>
    </thead>
    {#each table.body as row}
      <tr>
        {#each row.inputs as input}
          <td>{to_int(input)}</td>
        {/each}
        <td>{to_int(row.output)}</td>
      </tr>
    {/each}
  </table>
{/if}
