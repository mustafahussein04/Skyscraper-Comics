<template>
  <footer class="bg-gray-900 text-white py-8">
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-2 mb-4">
            <img src="/images/logo/Skyscraper Logo.jpg" alt="Skyscraper Comics Logo" class="h-8 w-auto" />
            <span class="font-bold text-xl">Skyscraper Comics</span>
          </div>
          <p class="text-gray-400 mb-4">
            Your premier destination for comic books and trading card products.
            Discover rare finds and connect with fellow collectors.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.012.017z"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-2.448-2.31 0-1.255.906-2.561 2.041-2.561 1.136 0 2.031 1.306 2.031 2.561 0 1.82-1.151 2.31-2.031 2.31zm7.718 0c-1.297 0-2.448-.49-2.448-2.31 0-1.255.906-2.561 2.041-2.561 1.136 0 2.031 1.306 2.031 2.561 0 1.82-1.151 2.31-2.031 2.31z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="font-semibold text-white mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li><RouterLink to="/" class="text-gray-400 hover:text-white transition-colors">Home</RouterLink></li>
            <li><RouterLink to="/products" class="text-gray-400 hover:text-white transition-colors">Products</RouterLink></li>
            <li><RouterLink to="/events" class="text-gray-400 hover:text-white transition-colors">Events</RouterLink></li>
            <li><RouterLink to="/about" class="text-gray-400 hover:text-white transition-colors">About Us</RouterLink></li>
            <li><RouterLink to="/contact" class="text-gray-400 hover:text-white transition-colors">Contact</RouterLink></li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h3 class="font-semibold text-white mb-4">Customer Service</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Returns</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Size Guide</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Track Order</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © 2024 Skyscraper Comics. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component for Skyscraper Comics
</script>