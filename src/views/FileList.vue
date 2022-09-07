<script>
export default {
    data() {
        return {
            path: '',
            list: {
                file: [],
                folder: []
            },
            info: {}
        }
    },
    mounted() {
        this.init()
    },
    watch: {
        '$route.params.path': function () {
            this.init()
        }
    },
    methods: {
        async init() {
            if (this.$route.params.path) {
                this.path = this.$route.params.path.join('/')
            } else {
                this.path = ''
            }
            console.log('[INFO] Now at:', this.path)

            // get list
            let r = await this.$axios.get(`http://127.0.0.1:2333/${this.path}?action=list`)
            if (r.status != 200) {
                console.error('[!ERR]', r.data)
                return
            }

            let tempList = r.data.payload

            let fileList = []
            let folderList = []
            for (const el of tempList) {
                if (el.isFolder) folderList.push(el)
                else fileList.push(el)
            }
            this.list.file = fileList
            this.list.folder = folderList

            // get info
            tempList.forEach(async el => {
                let r = await this.$axios.get(`http://127.0.0.1:2333/${el.path}?action=info`)
                if (r.status != 200) {
                    console.error('[!ERR]', r.data)
                    return
                }
                this.info[el.path] = r.data.payload
            })

        },
        navigate(el) {
            this.$router.push({ 'path': `/s/${el.path}` })
        },
        getFile(el) {
            window.open(`http://127.0.0.1:2333/${el.path}?action=get`, '_blank')
        },
        getModTime(el) {
            if(!this.info[el.path]) return
            return this.info[el.path]['modTime']
        },
        toUpper() {
            let upper = this.path.split('/').slice(1, -1).join('/')
            this.$router.push({ 'path': `/s/${upper}` })
        },
    }
}
</script>

<template>
    <div class="bar">
        <button :disabled="this.path === '/'" @click="toUpper()">
            <span class="mdi-set mdi-arrow-left"></span>
        </button>
        <div>{{ '/' + path }}</div>
    </div>
    <div class="header">
        <div>标题</div>
        <div>修改时间</div>
    </div>
    <ol>
        <li v-for="el in list.folder" @click="navigate(el)">
            <div class="name">
                <span class="mdi-set mdi-folder"></span>
                {{ el.name }}
            </div>
            <div class="mod-time">{{ getModTime(el) }}</div>
        </li>
        <li v-for="el in list.file" @click="getFile(el)">
            <div class="name">
                <span class="mdi-set mdi-file"></span>
                {{ el.name }}
            </div>
            <div class="mod-time">{{ getModTime(el) }}</div>
        </li>
    </ol>
</template>

<style scoped>
.bar {
    background-color: var(--color-primary);
    display: flex;
}

.bar>button {
    border: none;
    background-color: transparent;
    transition: all .2s;
    padding: 1rem;
    cursor: pointer;
}

.bar>button>span {
    font-size: 1.2rem;
}

.bar>button:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 0.05)
}

.bar>div {
    padding: 1rem 1.4rem;
}

.header {
    padding: 0.8rem 1rem;
    font-size: .8rem;
    background-color: rgba(0, 0, 0, 0.03);
    border-bottom: 1px rgba(0, 0, 0, 0.2) solid;
    border-top: 1px rgba(0, 0, 0, 0.2) solid;
}

.header,
li {
    display: grid;
    grid-template-columns: 80% 20%;
}

li>.name {
    display: flex;
    align-items: center;
}

li>.name>.mdi-set {
    color: var(--color-plain);
    margin-right: 1rem;
    transform: scale(1.4);
}

ol {
    padding: 0;
    margin: 0;
    list-style: none;
}

li {
    padding: 0.8rem 1rem;
    transition: all .2s;
}

li:hover {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
}

.mod-time {
    font-size: 0.6rem;
    color: rgba(0, 0, 0, 0.5);
}
</style>
