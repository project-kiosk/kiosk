<script lang="ts">
  import Button from "$lib/components/Form/Button.svelte";

  export let action: string;
  export let emailAddress: string;
  export let loading: boolean;
</script>

<form method="POST" {action}>
  <p class="block py-8">
    No account exists for "{emailAddress}". Do you want to sign up with
    this address?
  </p>

  <input type="hidden" name="emailAddress" value={emailAddress}>
  <input type="hidden" name="register" value={true}>

  <Button label="Sign up" type="submit" disabled={loading} />
</form>
