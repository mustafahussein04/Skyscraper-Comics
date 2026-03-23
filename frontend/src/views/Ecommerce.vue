<template>
  <admin-layout>
    <!-- SCRUM-44 - Splash section.  This should be on the splash page. -->
    <section class="bg-[linear-gradient(to_bottom_right,rgba(0,0,95,0.5),rgba(63,0,95,0.5)),url('https://images.unsplash.com/photo-1760986784449-79e1a6ba616b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21pYyUyMGJvb2slMjBzdG9yZSUyMGludGVyaW9yfGVufDF8fHx8MTc3MjQwNzU3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')] bg-cover bg-center">
      <div class="col-span-12 flex items-center mx-auto px-4 py-10">
          <div class="w-2/3">
              <h2 class="text-5xl mb-4 font-bold text-white">Welcome to Skyscraper Comics</h2>
              <p class="text-xl text-gray-200 mb-8">Discover your next favorite comic book or master your favorite trading card game. Where collectors and players come together.</p>
              <!-- SCRUM-3 - Add button to navigate to Products page.  This should be on the splash page. -->
              <primary-button @click="goToProducts">Shop Products</primary-button> 
              <!-- SCRUM-3 -->
          </div>
      </div>
    </section>
    <!-- SCRUM-44 -->
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      <div class="col-span-12 space-y-6 xl:col-span-7">
        <ecommerce-metrics />
        <monthly-target />
      </div>
      <div class="col-span-12 xl:col-span-5">
        <monthly-sale />
      </div>
      <div class="col-span-12">
        <statistics-chart />
      </div>

      <div class="col-span-12 xl:col-span-5">
        <customer-demographic />
      </div>

      <div class="col-span-12 xl:col-span-7">
        <recent-orders />
      </div>
    </div>
  </admin-layout>
</template>

<script>
import AdminLayout from '../components/layout/AdminLayout.vue'
import EcommerceMetrics from '../components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '../components/ecommerce/MonthlySale.vue'
import MonthlySale from '../components/ecommerce/MonthlyTarget.vue'
import CustomerDemographic from '../components/ecommerce/CustomerDemographic.vue'
import StatisticsChart from '../components/ecommerce/StatisticsChart.vue'
import RecentOrders from '../components/ecommerce/RecentOrders.vue'
import PrimaryButton from '@/components/ui/PrimaryButton.vue'
export default {
  components: {
    AdminLayout,
    EcommerceMetrics,
    MonthlyTarget,
    MonthlySale,
    CustomerDemographic,
    StatisticsChart,
    RecentOrders,
    PrimaryButton,    // SCRUM-3 - Import PrimaryButton component.  This should be on the splash page.
  },
  name: 'Ecommerce',
  methods: {
    goToProducts() {  // SCRUM-3 - Navigate to Products page.  This should be on the splash page.
      this.$router.push('/products')
    }
  }                   // SCRUM-3
}
</script>
