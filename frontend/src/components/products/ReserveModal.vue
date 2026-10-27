<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white shadow-xl">

        <!-- Confirmation screen -->
        <div v-if="confirmed" class="p-8 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Reservation Confirmed!</h2>
          <p class="mt-2 text-sm text-gray-500">Show this confirmation number when you pick up your item.</p>

          <div class="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left space-y-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Confirmation #</p>
              <p class="mt-0.5 text-2xl font-bold tracking-widest text-blue-900">{{ confirmed.confirmationNumber }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Item Reserved</p>
              <p class="mt-0.5 font-semibold text-gray-900">{{ confirmed.productName }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Pickup Deadline</p>
              <p class="mt-0.5 font-semibold text-gray-900">{{ formatDeadline(confirmed.expiresAt) }}</p>
            </div>
          </div>

          <button
            type="button"
            class="mt-6 w-full rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            @click="$emit('close')"
          >
            Done
          </button>
        </div>

        <!-- Reservation form -->
        <div v-else>
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h2 class="text-xl font-bold text-gray-900">Reserve "{{ product.name }}"</h2>
            <button
              type="button"
              class="text-2xl text-gray-400 hover:text-gray-700"
              aria-label="Cancel"
              @click="$emit('close')"
            >&times;</button>
          </div>

          <form class="space-y-4 p-6" @submit.prevent="handleSubmit">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">First Name</label>
              <input
                v-model.trim="form.firstName"
                type="text"
                placeholder="Jane"
                class="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                :class="errors.firstName ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">{{ errors.firstName }}</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
              <input
                v-model.trim="form.lastName"
                type="text"
                placeholder="Doe"
                class="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                :class="errors.lastName ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">{{ errors.lastName }}</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                v-model.trim="form.phoneNumber"
                type="tel"
                placeholder="(555) 123-4567"
                class="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                :class="errors.phoneNumber ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errors.phoneNumber" class="mt-1 text-xs text-red-600">{{ errors.phoneNumber }}</p>
            </div>

            <p v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {{ serverError }}
            </p>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                class="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                @click="$emit('close')"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {{ submitting ? 'Submitting…' : 'Submit' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Product } from '@/types/product'
import { createReservation } from '@/services/api'

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{ close: []; reserved: [] }>()

const form = reactive({ firstName: '', lastName: '', phoneNumber: '' })
const errors = reactive({ firstName: '', lastName: '', phoneNumber: '' })
const submitting = ref(false)
const serverError = ref('')
const confirmed = ref<{ confirmationNumber: string; productName: string; expiresAt: string } | null>(null)

function validate(): boolean {
  errors.firstName = form.firstName ? '' : 'First name is required.'
  errors.lastName = form.lastName ? '' : 'Last name is required.'
  const digits = form.phoneNumber.replace(/\D/g, '')
  errors.phoneNumber = !form.phoneNumber
    ? 'Phone number is required.'
    : digits.length !== 10
      ? 'Enter a valid 10-digit US phone number.'
      : ''
  return !errors.firstName && !errors.lastName && !errors.phoneNumber
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  serverError.value = ''
  try {
    const res = await createReservation({
      productId: props.product.id,
      firstName: form.firstName,
      lastName: form.lastName,
      phoneNumber: form.phoneNumber.replace(/\D/g, ''),
    })
    confirmed.value = { confirmationNumber: res.confirmationNumber, productName: res.productName, expiresAt: res.expiresAt }
    emit('reserved')
  } catch (err) {
    serverError.value = err instanceof Error ? err.message : 'Failed to reserve. Please try again.'
  } finally {
    submitting.value = false
  }
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}
</script>
