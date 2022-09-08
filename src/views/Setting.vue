<script>
import { def } from '@vue/shared';

export default {
  data() {
    return {
      addr: '',
      hint: ''
    }
  },
  methods: {
    save() {
      localStorage.addr = this.addr
      this.$router.push({ path: '/s' })
    }
  },
  mounted() {
    this.addr = localStorage.addr
  }
}
</script>

<template>
  <div class="content">
    <div>API 地址</div>
    <input type="text" v-model="addr">
    <button @click="save">{{ hint ? hint : '保存' }}</button>
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
