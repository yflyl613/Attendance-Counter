<template>
  <page-header />
  <file-uploader />
</template>

<script>
import PageHeader from './components/PageHeader.vue'
import FileUploader from './components/FileUploader.vue'

export default {
  name: 'App',
  components: {
    PageHeader, FileUploader
  }
}
</script>

<style>
body {
  margin: 0px;
}
</style>
