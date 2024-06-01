
import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
const router=new Router({
    mode:'history',

    routes:[
        {
            path: '/Error',
            component:()=>import('../components/PageError/PageError')
        },
        {
            path:'/',
            name:'MainPage',
            meta:{
                requireAuth:true
            },
            component:()=>import('../components/MainPage.vue'),
            children:[
                {
                    path:'AuctionPage',
                    name:'AuctionPage',
                    meta:{
                        requireAuth:true,
                        title:"拍卖市场"
                    },
                    component:()=>import('../components/Auction/AuctionPage.vue')
                },
                {
                    path:'GoodsPage',
                    name:'GoodsPage',
                    meta:{
                        requireAuth:true,
                        title:"交易市场"
                    },
                    component:()=>import('../components/Goods/GoodsPage.vue')
                },
                {
                    path:'MarketPage',
                    name:'MarketPage',
                    meta:{
                        requireAuth:true,
                        title:"我的商品"
                    },
                    component:()=>import('../components/Market/MarketPage.vue')
                },

            ]
        }
    ]
})
router.beforeEach((to, from, next) => {
    if (to.meta && to.meta.title) {
        document.title = to.meta.title; // 设置页面标题
    }
    next();
});
export default router;