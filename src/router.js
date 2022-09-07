import { createRouter, createWebHashHistory } from "vue-router"

import Home from "./views/Home.vue"
import Setting from "./views/Setting.vue"
import FileList from "./views/FileList.vue"

const routes = [
    {
        path: "/",
        redirect: "/s"
    },
    {
        path: "/s",
        component: Home,
        children: [{
            path: ":path*",
            component: FileList,
        }]
    },
    {
        path: "/setting",
        component: Setting,
    }
]

const router = createRouter({
    routes,
    history: createWebHashHistory()
})

export default router
