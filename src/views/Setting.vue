<script>
export default {
  data() {
    return {
      addr: '',
      key: ''
    }
  },
  methods: {
    save() {
      localStorage.setItem('addr', this.addr)
      localStorage.setItem('key', this.key)
      this.$router.push({ path: '/s' })
    }
  },
  mounted() {
    this.addr = localStorage.getItem('addr')
    this.key = localStorage.getItem('key')
  }
}
</script>

<template>
  <div class="content">
    <div>API 地址</div>
    <input type="text" v-model="addr">
    <div>Key</div>
    <input type="text" v-model="key">
    <button @click="save">保存</button>
  </div>
</template>

<style scoped>
.content {
  padding: 2rem;
}

.content>*:not(:first-child) {
  margin-top: 1rem;
}
</style>
