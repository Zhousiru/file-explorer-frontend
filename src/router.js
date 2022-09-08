import { createRouter, createWebHashHistory } from "vue-router"

import Setting from "./views/Setting.vue"
import FileList from "./views/FileList.vue"

const routes = [
    {
        path: "/",
        redirect: "/s"
    },
    {
        path: "/s/:path*",
        component: FileList
    },
    {
        path: "/setting",
        component: Setting
    }
]

const router = createRouter({
    routes,
    history: createWebHashHistory()
})

export default router
