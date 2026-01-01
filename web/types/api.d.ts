import { $fetch } from "ofetch"

export {}

declare module "#app" {
  interface NuxtApp {
    $api: typeof $fetch
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $api: typeof $fetch
  }
}
