// @ts-ignore
export default function({ store, redirect }) {
  // If the user is authenticated redirect to home page
  console.log(store.state.token)
  if (store.state.token.length === 0) {
    return redirect("/")
  }
}
