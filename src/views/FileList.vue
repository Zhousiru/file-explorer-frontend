<script>
export default {
    data() {
        return {
            setting: {
                addr: '',
                key: ''
            },
            path: '',
            list: {
                file: [],
                folder: []
            },
            info: {},
            drag: {}, // drag, drop
            editor: {
                path: '',
                new: '',
                old: ''
            },
            error: {
                rename: ''
            },
            hint: ''
        }
    },
    mounted() {
        // get localStorage setting
        this.setting.addr = localStorage.getItem('addr')
        this.setting.key = localStorage.getItem('key')

        if (!this.setting.addr) {
            this.$router.push({ 'path': `/login` })
        }

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

            // get list
            let r = {}
            try {
                r = await this.$axios.get(`http://${this.setting.addr}/${this.path}?key=${this.setting.key}&action=list`)
            } catch (e) {
                this.showHint(e)
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

            if (this.path !== '') {
                let upper = this.path.split('/').slice(0, -1).join('/')
                folderList.unshift({
                    'name': '..',
                    'path': upper,
                    'isFolder': true
                })
            }
            this.list.folder = folderList

            // get info
            tempList.forEach(async el => {
                let r = {}
                try {
                    r = await this.$axios.get(`http://${this.setting.addr}/${el.path}?key=${this.setting.key}&action=info`)
                } catch (e) {
                    this.showHint(e)
                    return
                }
                this.info[el.path] = r.data.payload
            })

        },
        navigate(el) {
            this.$router.push({ 'path': `/s/${el.path}` })
        },
        getFile(el) {
            window.open(`http://${this.setting.addr}/${el.path}?key=${this.setting.key}&action=get`, '_blank')
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
            try {
                await this.$axios.get(`http://${this.setting.addr}/${el.path}?key=${this.setting.key}&action=del`)
            } catch (e) {
                this.showHint(e)
                return
            }

            console.log('[INFO] del', el.path)
            this.init()
        },
        openEditor(el) {
            this.editor.path = el.path
            this.editor.new = el.name
            this.editor.old = el.name
        },
        async closeEditor() {
            if (!this.editor.new || this.editor.new === this.editor.old) {
                this.editor.path = ''
                return
            }

            try {
                await this.$axios.get(`http://${this.setting.addr}/${this.editor.path}?key=${this.setting.key}&action=rename&new=${this.editor.new}`)
            } catch (e) {
                this.showHint(e)
                return
            }
            console.log('[INFO] rename', this.editor.path)

            this.editor.path = ''
            this.init()
        },
        showHint(e) {
            this.hint = (e.response && e.response.data) ? e.response.data.err : 'no connection'
            setTimeout(() => {
                this.hint = ''
            }, 3000)
        },
        dragstart($event, el) {
            $event.dataTransfer.setData('text/plain', el.path)
            this.drag[el.path] = 'drag'
        },
        dragover($event, el) {
            if (this.drag[el.path] === 'drop') {
                $event.preventDefault()
            }
        },
        async drop($event, el) {
            this.drag[el.path] = ''
            let source = $event.dataTransfer.getData("text/plain")
            let target = el.path ? el.path : '/'
            try {
                await this.$axios.get(`http://${this.setting.addr}/${source}?key=${this.setting.key}&action=move&new=${target}`)
            } catch (e) {
                this.showHint(e)
                return
            }
            this.init()
        },
        async upload() {
            let file = this.$refs.upload.files[0]
            if (!file) {
                return
            }

            let formData = new FormData()
            formData.append('file', file)

            try {
                await this.$axios.post(`http://${this.setting.addr}/${this.path}?key=${this.setting.key}&action=upload`, formData)
            } catch (e) {
                console.log(e)
                this.showHint(e)
                return
            }

            this.init()
        }
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition>
            <div class="notice" v-if="hint">
                {{ hint }}
            </div>
        </Transition>
        <Transition>
            <div class="modal" v-if="editor.path !== ''">
                <div>请输入新文件（夹）名</div>
                <input type="text" v-model="editor.new">
                <button @click="closeEditor()">确定</button>
            </div>
        </Transition>
    </Teleport>
    <div class="action-area">
        <div class="new">
            <input type="file" id="input" ref="upload" style="display: none;" @change="upload($event)" />
            <button>
                <span class="mdi-set mdi-folder-plus-outline"></span>
            </button>
            <button @click="$refs.upload.click()">
                <span class="mdi-set mdi-cloud-upload"></span>
            </button>
        </div>
    </div>
    <div class="bar">
        <button :disabled="!this.path" @click="toUpper()">
            <span class="mdi-set mdi-arrow-left"></span>
        </button>
        <div>{{ '/' + path }}</div>
    </div>
    <div class="header">
        <div>标题</div>
        <div>修改时间</div>
    </div>
    <ol>
        <li v-for="el in list.folder" @click="navigate(el)" @dragstart="dragstart($event, el)"
            @dragend="drag[el.path] = ''" @dragenter="drag[el.path] !== 'drag' ? drag[el.path] = 'drop' : undefined"
            @dragleave="drag[el.path] === 'drop' ? drag[el.path] = '' : undefined" @dragover="dragover($event, el)"
            @drop="drop($event, el)" :class="{'drop': drag[el.path] === 'drop'}" draggable="true">
            <div class="name">
                <span class="mdi-set mdi-folder"></span>
                {{ el.name }}
            </div>
            <div class="mod-time">{{ getModTime(el) }}</div>
            <div class="action" v-if="el.path !== ''">
                <a @click.stop="openEditor(el)">重命名</a>
                <a @click.stop="del(el)">删除</a>
            </div>
        </li>
        <li v-for="el in list.file" @click="getFile(el)" @dragstart="dragstart($event, el)"
            @dragend="drag[el.path] = ''" draggable="true">
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
.action-area {
    right: 0;
    position: absolute;
}

.new {
    top: 70vh;
    position: fixed;
    transform: translateX(calc(-100% - 2rem));
    z-index: 2333;
    display: flex;
}

.new>button {
    border: none;
    background-color: var(--color-plain);
    color: #fff;
    padding: 0;
    font-size: 1.4rem;
    width: 2.6rem;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);
}

.new>button:hover {
    opacity: .8;
}

.new>button:not(:first-child) {
    margin-left: 1rem;
}

.bar {
    background-color: var(--color-primary);
    display: flex;
}

.bar>button {
    border: none;
    background-color: transparent;
    transition: all .2s;
    padding: 1rem;
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

li>* {
    pointer-events: none;
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

li.drop {
    box-shadow: 0 0 0 2px var(--color-plain);
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
</style>
