import {ActionTree, GetterTree, MutationTree} from "vuex"
import {RootState} from "~/types"

const cookieparser = process.server ? require("cookieparser") : undefined

export const state = (): RootState => ({
  token: ""
})

export const mutations: MutationTree<RootState> = {
  setToken(state: RootState, tokenData: string): void {
    state.token = tokenData
  }
}

export const getters: GetterTree<RootState, any> = {
  getToken(state): string {
    return state.token
  },
  isAuthenticated(state): boolean {
    return !!state.token
  }
}

export const actions: ActionTree<RootState, RootState> = {
  async nuxtServerInit({commit}, {req}) {
    let tokenState: string = ""
    if (req.headers.cookie) {
      const parsed = await cookieparser.parse(req.headers.cookie)
      try {
        tokenState = await JSON.parse(parsed.token)
      } catch (err) {
        // No valid cookie found
      }
    }
    commit("setToken", tokenState)
  }
}
