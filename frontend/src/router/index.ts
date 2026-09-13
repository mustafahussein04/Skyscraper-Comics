import { createRouter, createWebHistory } from 'vue-router'
import { isAdminAuthenticated } from '@/composables/useAdminAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('../components/layout/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('../views/HomePage.vue'),
          meta: {
            title: 'Home',
          },
        },
        {
          path: 'events',
          name: 'Events',
          component: () => import('../views/EventsPage.vue'),
          meta: {
            title: 'Events',
          },
        },
        {
          path: 'products/:id',
          name: 'ProductDetail',
          component: () => import('../views/ProductDetail.vue'),
          meta: {
            title: 'Product Detail',
          },
        },
      ],
    },
    {
      path: '/products/:filter?',
      name: 'Products',
      component: () => import('../views/ProductsView.vue'),
      props: {},
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/admin/login',
      name: 'Admin Login',
      component: () => import('../views/Admin.vue'),
      meta: {
        title: 'Admin Sign In',
      },
    },
    {
      path: '/admin',
      component: () => import('../components/admin/AdminDashboardLayout.vue'),
      meta: {
        requiresAdmin: true,
      },
      children: [
        {
          path: '',
          name: 'Admin Dashboard',
          component: () => import('../views/admin/AdminDashboardHome.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'products',
          name: 'Admin Products',
          component: () => import('../views/admin/AdminSectionPage.vue'),
          props: {
            title: 'Products',
            description: 'Manage the comic book and trading card catalog from this area.',
          },
          meta: { title: 'Products' },
        },
        {
          path: 'orders',
          name: 'Admin Orders',
          component: () => import('../views/admin/AdminSectionPage.vue'),
          props: {
            title: 'Orders',
            description: 'Review and manage customer orders from this area.',
          },
          meta: { title: 'Orders' },
        },
        {
          path: 'events',
          name: 'Admin Events',
          component: () => import('../views/admin/AdminSectionPage.vue'),
          props: {
            title: 'Events',
            description: 'Create and maintain store events from this area.',
          },
          meta: { title: 'Events' },
        },
        {
          path: 'customers',
          name: 'Admin Customers',
          component: () => import('../views/admin/AdminSectionPage.vue'),
          props: {
            title: 'Customers',
            description: 'View customer information and support workflows from this area.',
          },
          meta: { title: 'Customers' },
        },
      ],
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

export default router

router.beforeEach((to) => {
  document.title = `Vue.js ${to.meta.title} | TailAdmin - Vue.js Tailwind CSS Dashboard Template`

  const authenticated = isAdminAuthenticated()
  const requiresAdmin = to.matched.some((routeRecord) => routeRecord.meta.requiresAdmin)

  if (requiresAdmin && !authenticated) {
    return {
      name: 'Admin Login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.name === 'Admin Login' && authenticated) {
    return { name: 'Admin Dashboard' }
  }
})
