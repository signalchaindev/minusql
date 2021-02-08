<script>
  import { onMount } from "svelte";
  import { client, gql } from "../graphql.js";
  import { safeJsonParse } from "../utils/safeJsonParse.js";

  let dump;

  onMount(() => {
    queryError();
  });

  const HANDLE_ERRORS_QUERY = gql`
    query HANDLE_ERRORS_QUERY {
      queryError
    }
  `;

  async function queryError() {
    const [data, error] = await client.query(HANDLE_ERRORS_QUERY);

    if (error) {
      console.error(error);
      let [json] = safeJsonParse(error.message);
      if (json.constructor === String) {
        json = {
          alert: json,
        };
      }
      dump = JSON.stringify(json, null, 2);
      return;
    }

    console.log(data);
  }
</script>

<pre>
  {dump}
</pre>
