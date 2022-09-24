<script>
export default {
  data() {
    return {
      addr: '',
      key: '',
      hint: ''
    }
  },
  methods: {
    async save() {
      try {
        let r = await this.$axios.get(`//${this.addr}`, {
          params: {
            key: this.key,
            action: 'list'
          }
        })
      } catch (e) {
        if (e.code === "ERR_NETWORK") {
          this.showHint("can't connect to api server")
        } else {
          this.showHint(e.response.data.err)
        }

        return
      }

      localStorage.setItem('addr', this.addr)
      localStorage.setItem('key', this.key)

      this.$router.push({ path: '/s' })
    },
    showHint(eStr) {
      this.hint = eStr
      setTimeout(() => {
        this.hint = ''
      }, 3000)
    }
  },
  mounted() {
    this.addr = localStorage.getItem('addr')
    this.key = localStorage.getItem('key')
  }
}
</script>

<template>
  <Transition>
    <div class="notice" v-if="hint">
      {{ hint }}
    </div>
  </Transition>
  <div class="content">
    <div class="title">File Expolre</div>
    <div class="form-field">
      <input type="text" v-model="addr" placeholder="API 地址">
      <div class="combine">
        <input type="text" v-model="key" placeholder="Key">
        <button @click="save()">
          <span class="mdi-set mdi-arrow-right"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 2rem;
  backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, .6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.title {
  font-size: 2rem;
  color: rgba(0, 0, 0, .8);
}

.form-field {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 15rem;
  margin-top: 1.2rem;
}

.form-field>* {
  width: 100%;
}

.combine {
  display: flex;
}

.combine {
  margin-top: 1rem;
  display: flex;
}

.combine>input {
  flex: 1;
  width: inherit;
  border-right: none;
}

.combine>button {
  padding: 0;
  aspect-ratio: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: var(--color-plain);
  color: #fff;
}

.combine>button:hover {
  opacity: .8;
}
</style>
