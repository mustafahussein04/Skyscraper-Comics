<template>
    <button class="primary-btn">
        <slot></slot>
    </button>
</template> 

<script setup lang="ts">
</script>

<style scoped>
.primary-btn {
    background-color: #FFF;
    color: #264DC1;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
}

.primary-btn:hover {
    background-color: #DDD;
}
</style>