<script>

</script>

<template>
  <div id="container">
    <div class="navbar">
      <div class="title">
        File Explorer
      </div>
      <div class="menu">
        <RouterLink :to="'/s'">主页</RouterLink>
        <RouterLink :to="'/setting'">设置</RouterLink>
      </div>
    </div>
    <RouterView></RouterView>
  </div>
</template>

<style scoped>
#container {
  background-color: rgb(255, 255, 255);
  width: 60%;
  min-width: 50rem;
  max-width: 80rem;
  margin: 20vh auto 0;
}

.navbar {
  display: flex;
  background-color: var(--color-plain);
  color: rgb(255, 255, 255);
}

.navbar>.title {
  padding: 1rem 2rem;
  font-size: 1.4rem;
  font-weight: lighter;
}

.navbar>.menu {
  display: flex;
}

.navbar>.menu>a {
  text-decoration: none;
  transition: all .2s;
  display: flex;
  align-items: center;
  padding: 0 1rem;
}

.navbar>.menu>a:visited {
  color: rgb(255, 255, 255);
}

.navbar>.menu>a:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: rgba(255, 255, 255, 0.8);
}
</style>
