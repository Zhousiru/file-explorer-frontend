<script>
export default {
    data() {
        return {
            path: '',
            list: {
                file: [],
                folder: []
            },
            info: {},
            editor: {
                path: "",
                value: ""
            }
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
            console.log('[INFO] Now at:', '/' + this.path)

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
            if (!this.info[el.path]) return
            return this.info[el.path]['modTime']
        },
        toUpper() {
            let upper = this.path.split('/').slice(0, -1).join('/')
            this.$router.push({ 'path': `/s/${upper}` })
        },
        async del(el) {
            let r = await this.$axios.get(`http://127.0.0.1:2333/${el.path}?action=del`)
            if (r.status != 200) {
                console.error('[!ERR]', r.data)
                return
            }
            console.log('[INFO] del', el.path)
            this.init()
        },
        openEditor(el) {
            this.editor.path = el.path
            this.editor.value = el.name
        },
        async closeEditor() {
            if (!this.editor.value) {
                this.editor.path = ''
                return
            }

            let r = await this.$axios.get(`http://127.0.0.1:2333/${this.editor.path}?action=rename&new=${this.editor.value}`)
            if (r.status != 200) {
                console.error('[!ERR]', r.data)
                return
            }
            console.log('[INFO] rename', this.editor.path)

            this.editor.path = ''
            this.init()
        }
    }
}
</script>

<template>
    <Teleport to="body">
        <div class="modal" v-if="editor.path !== ''">
            <div>请输入新文件名</div>
            <input type="text" v-model="editor.value">
            <button @click="closeEditor()">确定</button>
        </div>
    </Teleport>
    <div class="bar">
        <button :disabled="this.path === '/'" @click="toUpper()">
            <span class="mdi-set mdi-arrow-left"></span>
        </button>
        <div>{{ '/' + path }}</div>
    </div>
    <div class="header">
        <div>标题</div>
        <div>修改时间</div>
        <div></div>
    </div>
    <ol>
        <li v-for="el in list.folder" @click="navigate(el)">
            <div class="name">
                <span class="mdi-set mdi-folder"></span>
                {{ el.name }}
            </div>
            <div class="mod-time">{{ getModTime(el) }}</div>
            <div class="action">
                <a @click.stop="openEditor(el)">重命名</a>
                <a @click.stop="del(el)">删除</a>
            </div>
        </li>
        <li v-for="el in list.file" @click="getFile(el)">
            <div class="name">
                <span class="mdi-set mdi-file"></span>
                {{ el.name }}
            </div>
            <div class="mod-time">{{ getModTime(el) }}</div>
            <div class="action">
                <a @click.stop="openEditor(el)">重命名</a>
                <a @click.stop="del(el)">删除</a>
            </div>
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
    grid-template-columns: 8fr 2fr 1fr;
}

li>div {
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

.mod-time,
.action,
.action>a:visited {
    font-size: 0.6rem;
    color: rgba(0, 0, 0, 0.5);
}

.action {
    pointer-events: none;
    opacity: 0;
    transition: all .2s;
}

.action>a {
    text-decoration: none;
}

.action>a:not(:first-child) {
    margin-left: 1em;
}

li:hover .action {
    pointer-events: all;
    opacity: 1;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(calc(50vw - 50%), calc(50vh - 50%));
    z-index: 2333;
    background-color: #fff;
    padding: 2rem;
    box-shadow: 0 5px 4px 1px rgba(0, 0, 0, .05);
    border: 2px var(--color-plain) solid;
}

.modal>*:not(:first-child) {
    margin-top: 1rem;
}

.modal>input {
    border: 2px var(--color-primary) solid;
    font-size: 1.2rem;
    padding: .4rem;
    outline: none;
    transition: all .2s;
}

.modal>input:focus {
    border: 2px var(--color-plain) solid;
}

.modal>button {
    display: block;
    background-color: rgb(255, 255, 255);
    padding: .4rem .8rem;
    font-size: 1rem;
    transition: all .2s;
    border: 1px var(--color-plain) solid;
}

.modal>button:hover {
    background-color: var(--color-primary);
    cursor: pointer;
}
</style>
