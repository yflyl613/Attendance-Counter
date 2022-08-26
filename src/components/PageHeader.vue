<template>
  <el-container class="container">
    <el-header style="width: 100%"
      ><div class="header">Attendance Counter</div>
      <div class="flag">A gadget built by yy</div>
    </el-header>
  </el-container>
</template>

<script>
export default {
  name: 'PageHeader'
}
</script>

<style scoped>
.header {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: white;
  font-weight: bold;
  font-size: 30px;
  line-height: 60px;
  display: inline-block;
  width: 50%;
}

.container {
  background-color: #545c64;
  text-align: right;
}

.flag {
  width: 50%;
  font-size: 10px;
  line-height: 20px;
  font-style: italic;
  font-weight: 500;
  font-family: Georgia, serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
  display: inline-block;
}
</style>