<template>
    <div class="bodyOfManage">
       <div class="leftNavbar" :style="{width: withOfIconType}">
<!--            头像区-->

         <div class="profileArea">
           <el-tooltip class="item" effect="dark" content="连接钱包" placement="bottom">
             <img src="../../assets/images/touxiang.png" @click="connectUserWallet">
           </el-tooltip>
         </div>
         <span>{{account.substring(0,8)}}</span>

           <div class="profileArea">
               <el-tooltip class="item" effect="dark" content="个人中心" placement="bottom">
               </el-tooltip>
           </div>
<!--               导航栏区-->
           <div class="barArea">
<!--               文字导航栏-->
               <transition
                       name="animate__animated animate__bounce"
                       enter-active-class="animate__fadeInUp"
                       leave-active-class="animate__zoomOut"
                       appear
               >
             <div v-show="flagOfShow" style="width: 100%;position: absolute">
                 <router-link :to="{name:'AuctionPage'}" active-class="active" >拍卖市场</router-link>
                 <router-link :to="{name:'MarketPage'}" active-class="active" >交易平台</router-link>
                 <router-link :to="{name:'GoodsPage'}" active-class="active" >我的商品</router-link>
             </div>

               </transition>
               <transition
                       name="animate__animated animate__bounce"
                       enter-active-class="animate__fadeInUp"
                       leave-active-class="animate__zoomOut"
                       appear

               >
<!--               图标导航栏-->
               <div v-show="!flagOfShow" style="width: 100%;">
                   <el-tooltip class="item" effect="dark"  content="拍卖市场" placement="right">
                   <router-link style="font-size: 20px" :to="{name:'AuctionPage'}"  active-class="active2"><li class="el-icon-s-home"></li></router-link>
                   </el-tooltip>
                   <el-tooltip class="item" effect="dark" content="购物市场" placement="right">
                   <router-link style="font-size: 20px" :to="{name:'MarketPage'}" active-class="active2"><li class="el-icon-milk-tea"></li></router-link>
                   </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="我的商品" placement="right">
                   <router-link style="font-size: 20px" :to="{name:'GoodsPage'}" active-class="active2"><li class="el-icon-takeaway-box"></li></router-link>
                   </el-tooltip>
               </div>
               </transition>
           </div>
<!--           转换格式按钮-->
           <div class="changeArea">
               <li class="el-icon-guide" @click="changeToIcon"></li>
           </div>
       </div>
    </div>
</template>

<script>

    export default {
        name: "LeftNavBar",
        data(){
           return{
             signDialogVisible:false,
             withOfIconType:'100px',
             flagOfShow:true,
             flagOfPersonalCenter:true,
             account:"",
           }
        },
        methods:{
            connectUserWallet() {
              window.ethereum.request({ method: 'eth_requestAccounts' }).then((res)=>{
                localStorage.setItem("account",res[0])
                this.account=res[0]
                console.log(this.account)
              })
            },
            changeToIcon(){
                this.flagOfShow= !this.flagOfShow
            },
        },
        mounted() {
          window.ethereum.on('accountsChanged', (accounts) => {
            localStorage.setItem("account",accounts[0])
            this.account=accounts[0]
          });
        },
    }
</script>

<style scoped>
    .active{
        background-color: rgba(37,123,94,0.2);
        color: #257B5E;
    }
    .active2{
        color: #257B5E;
    }
    a{
        position: relative;
        text-decoration: none;
        display: block;
        height: 50px;
        text-align: center;
        line-height: 50px;
        color: #3C3F41;
    }
    a::before{
        display: block;
        content: "";
        width: 3px;
        height: 50px;
        position: absolute;
        border-radius: 10px;
    }
    a:hover::before{
        background-color: #69717A;
    }
    .bodyOfManage{
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .leftNavbar{
        transition: 0.5s linear;
        overflow: hidden;
        border-top-left-radius: 15px;
        border-bottom-left-radius: 15px;
        height: 650px;
        width: 100px;
        background-color: #F5F7F9;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .profileArea{

        width: 100%;
        flex: 2;
        display: flex;
        justify-content: center;
        align-items: center;

    }
    .profileArea:hover img{
        cursor: pointer;
    }
    .barArea{
        font-size: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        flex: 7;
        font-weight: bold;
        position: relative;
        margin-bottom: 60px;
    }
    .profileArea img{
        border-radius: 10px;
        width: 50px;
        height:50px;
    }
    .changeArea{
        flex: 2;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .changeArea li{
       font-size: 18px;
    }
    .changeArea li:hover{
        color: #257B5E;
        cursor: pointer;
    }


</style>