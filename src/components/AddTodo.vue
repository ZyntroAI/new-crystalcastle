<template>
  <form class="add-todo" @submit.prevent="add">
    <input v-model="text" placeholder="What needs to be done?" />
    <button type="submit">Add</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useTodoStore } from '@/stores/todo'

const store = useTodoStore()
const text = ref('')

function add() {
  const t = text.value.trim()
  if (!t) return
  store.addTodo(t)
  text.value = ''
}
</script>

<style scoped>
.add-todo { display:flex; gap:8px; margin-bottom:12px; }
.add-todo input { flex:1; padding:6px 8px; }
</style>
