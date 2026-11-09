<template>
    <img
        v-if="src && !failed"
        :src="src"
        :alt="alt"
        :class="imgClass"
        @error="failed = true"
    >
    <div
        v-else
        role="img"
        :aria-label="`No image available for ${alt}`"
        :class="['flex flex-col items-center justify-center gap-2 bg-gray-100 text-gray-400', placeholderClass]"
    >
        <ImageOff class="h-10 w-10" />
        <span class="text-sm">No image available</span>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ImageOff } from 'lucide-vue-next'

// Shows the product's uploaded image, or a neutral placeholder when it is missing or fails to load
const props = defineProps<{
    src?: string
    alt: string
    imgClass?: string
    placeholderClass?: string
}>()

const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>
